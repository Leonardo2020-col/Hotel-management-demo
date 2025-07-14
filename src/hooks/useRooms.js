// src/hooks/useRooms.js - CONECTADO CON SUPABASE
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// Constantes de estado
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CHECKOUT: 'checkout',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  OUT_OF_ORDER: 'out_of_order'
};

export const CLEANING_STATUS = {
  CLEAN: 'clean',
  DIRTY: 'dirty',
  IN_PROGRESS: 'in_progress',
  INSPECTION: 'inspection'
};

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [cleaningStaff, setCleaningStaff] = useState([]);
  const [cleaningTasks, setCleaningTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calcular estadísticas de habitaciones
  const roomStats = useMemo(() => {
    if (!rooms || rooms.length === 0) {
      return {
        total: 0,
        available: 0,
        occupied: 0,
        occupancyRate: 0,
        cleaning: 0,
        maintenance: 0,
        outOfOrder: 0,
        needsCleaning: 0,
        revenue: {
          today: 0,
          thisMonth: 0,
          average: 0
        }
      };
    }

    const total = rooms.length;
    const available = rooms.filter(r => r.status === ROOM_STATUS.AVAILABLE).length;
    const occupied = rooms.filter(r => r.status === ROOM_STATUS.OCCUPIED).length;
    const cleaning = rooms.filter(r => r.status === ROOM_STATUS.CLEANING || r.status === ROOM_STATUS.CHECKOUT).length;
    const maintenance = rooms.filter(r => r.status === ROOM_STATUS.MAINTENANCE).length;
    const outOfOrder = rooms.filter(r => r.status === ROOM_STATUS.OUT_OF_ORDER).length;
    
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    // Calcular ingresos estimados basados en habitaciones ocupadas
    const todayRevenue = rooms
      .filter(r => r.status === ROOM_STATUS.OCCUPIED)
      .reduce((sum, room) => sum + parseFloat(room.price || 0), 0);
    
    const monthlyRevenue = todayRevenue * 30; // Estimado mensual
    const averageRevenue = total > 0 ? monthlyRevenue / total : 0;

    return {
      total,
      available,
      occupied,
      occupancyRate,
      cleaning,
      maintenance,
      outOfOrder,
      needsCleaning: cleaning, // Por ahora, cleaning = needs cleaning
      revenue: {
        today: todayRevenue,
        thisMonth: monthlyRevenue,
        average: averageRevenue
      }
    };
  }, [rooms]);

  // Calcular habitaciones por tipo
  const roomsByType = useMemo(() => {
    if (!rooms || rooms.length === 0 || !roomTypes || roomTypes.length === 0) {
      return {};
    }

    const typeStats = {};
    
    roomTypes.forEach(type => {
      const typeRooms = rooms.filter(r => r.type === type.name);
      typeStats[type.name] = {
        total: typeRooms.length,
        available: typeRooms.filter(r => r.status === ROOM_STATUS.AVAILABLE).length,
        occupied: typeRooms.filter(r => r.status === ROOM_STATUS.OCCUPIED).length,
        averageRate: parseFloat(type.base_price || 0)
      };
    });

    return typeStats;
  }, [rooms, roomTypes]);

  // Cargar habitaciones desde Supabase
  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');

      if (error) throw error;

      setRooms(data || []);
      return data;
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      setError(error.message);
      return [];
    }
  };

  // Cargar tipos de habitaciones desde Supabase
  const loadRoomTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name');

      if (error) throw error;

      setRoomTypes(data || []);
      return data;
    } catch (error) {
      console.error('Error cargando tipos de habitaciones:', error);
      setError(error.message);
      return [];
    }
  };

  // Cargar personal de limpieza desde Supabase
  const loadCleaningStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('role', 'housekeeping')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;

      const formattedStaff = data.map(staff => ({
        id: staff.id,
        name: staff.full_name,
        employeeId: staff.employee_id,
        phone: staff.phone,
        department: staff.department,
        status: staff.status
      }));

      setCleaningStaff(formattedStaff);
      return formattedStaff;
    } catch (error) {
      console.error('Error cargando personal de limpieza:', error);
      setError(error.message);
      
      // Fallback a personal mock
      const mockStaff = [
        { id: 1, name: 'María González', employeeId: 'EMP001', phone: '+51 999 111 222' },
        { id: 2, name: 'Carlos Ruiz', employeeId: 'EMP002', phone: '+51 999 333 444' },
        { id: 3, name: 'Ana López', employeeId: 'EMP003', phone: '+51 999 555 666' }
      ];
      setCleaningStaff(mockStaff);
      return mockStaff;
    }
  };

  // Cargar tareas de limpieza desde Supabase
  const loadCleaningTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('room_cleaning')
        .select(`
          *,
          rooms (number, floor, type),
          staff (full_name, employee_id)
        `)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = data.map(task => ({
        id: task.id,
        roomNumber: task.rooms?.number,
        roomFloor: task.rooms?.floor,
        roomType: task.rooms?.type,
        status: task.status,
        cleaningType: task.cleaning_type,
        priority: task.priority,
        estimatedDuration: task.estimated_duration,
        actualDuration: task.actual_duration,
        assignedCleaner: task.staff?.full_name,
        cleanerEmployeeId: task.staff?.employee_id,
        startedAt: task.started_at,
        completedAt: task.completed_at,
        notes: task.notes,
        qualityScore: task.quality_score,
        createdAt: task.created_at
      }));

      setCleaningTasks(formattedTasks);
      return formattedTasks;
    } catch (error) {
      console.error('Error cargando tareas de limpieza:', error);
      setError(error.message);
      return [];
    }
  };

  // Crear nueva habitación
  const createRoom = async (roomData) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{
          number: parseInt(roomData.number),
          floor: parseInt(roomData.floor),
          type: roomData.type,
          status: ROOM_STATUS.AVAILABLE,
          price: parseFloat(roomData.price),
          capacity: parseInt(roomData.capacity),
          description: roomData.description,
          amenities: roomData.amenities || []
        }])
        .select()
        .single();

      if (error) throw error;

      // Recargar habitaciones
      await loadRooms();

      return { success: true, data };
    } catch (error) {
      console.error('Error creando habitación:', error);
      return { success: false, error: error.message };
    }
  };

  // Actualizar habitación
  const updateRoom = async (roomId, updateData) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          number: updateData.number ? parseInt(updateData.number) : undefined,
          floor: updateData.floor ? parseInt(updateData.floor) : undefined,
          type: updateData.type,
          price: updateData.price ? parseFloat(updateData.price) : undefined,
          capacity: updateData.capacity ? parseInt(updateData.capacity) : undefined,
          description: updateData.description,
          amenities: updateData.amenities,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) throw error;

      // Recargar habitaciones
      await loadRooms();

      return { success: true };
    } catch (error) {
      console.error('Error actualizando habitación:', error);
      return { success: false, error: error.message };
    }
  };

  // Eliminar habitación
  const deleteRoom = async (roomId) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      // Recargar habitaciones
      await loadRooms();

      return { success: true };
    } catch (error) {
      console.error('Error eliminando habitación:', error);
      return { success: false, error: error.message };
    }
  };

  // Actualizar estado de habitación
  const updateRoomStatus = async (roomId, newStatus) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) throw error;

      // Recargar habitaciones
      await loadRooms();

      return { success: true };
    } catch (error) {
      console.error('Error actualizando estado de habitación:', error);
      return { success: false, error: error.message };
    }
  };

  // Actualizar estado por número de habitación
  const updateRoomStatusByNumber = async (roomNumber, newStatus) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('number', roomNumber);

      if (error) throw error;

      // Recargar habitaciones
      await loadRooms();

      return { success: true };
    } catch (error) {
      console.error('Error actualizando estado de habitación:', error);
      return { success: false, error: error.message };
    }
  };

  // Crear tarea de limpieza
  const createCleaningTask = async (taskData) => {
    try {
      // Obtener room_id por número de habitación
      const room = rooms.find(r => r.number === taskData.roomNumber);
      if (!room) throw new Error('Habitación no encontrada');

      const { data, error } = await supabase
        .from('room_cleaning')
        .insert([{
          room_id: room.id,
          staff_id: taskData.staffId || null,
          status: 'pending',
          cleaning_type: taskData.cleaningType || 'checkout',
          priority: taskData.priority || 'medium',
          estimated_duration: taskData.estimatedDuration || 30,
          notes: taskData.notes || ''
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado de la habitación a cleaning
      await updateRoomStatusByNumber(taskData.roomNumber, ROOM_STATUS.CLEANING);

      // Recargar tareas
      await loadCleaningTasks();

      return { success: true, data };
    } catch (error) {
      console.error('Error creando tarea de limpieza:', error);
      return { success: false, error: error.message };
    }
  };

  // Asignar limpieza a personal
  const assignCleaning = async (roomNumbers, staffId) => {
    try {
      const results = [];
      
      for (const roomNumber of roomNumbers) {
        const result = await createCleaningTask({
          roomNumber,
          staffId,
          cleaningType: 'checkout',
          priority: 'medium',
          estimatedDuration: 30
        });
        results.push(result);
      }

      const successful = results.filter(r => r.success).length;
      
      return { 
        success: successful > 0, 
        message: `${successful}/${roomNumbers.length} habitaciones asignadas correctamente`
      };
    } catch (error) {
      console.error('Error asignando limpieza:', error);
      return { success: false, error: error.message };
    }
  };

  // Completar tarea de limpieza
  const completeCleaningTask = async (taskId, qualityScore = null) => {
    try {
      const { error } = await supabase
        .from('room_cleaning')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          quality_score: qualityScore
        })
        .eq('id', taskId);

      if (error) throw error;

      // Obtener la tarea para actualizar el estado de la habitación
      const task = cleaningTasks.find(t => t.id === taskId);
      if (task) {
        await updateRoomStatusByNumber(task.roomNumber, ROOM_STATUS.AVAILABLE);
      }

      // Recargar tareas
      await loadCleaningTasks();

      return { success: true };
    } catch (error) {
      console.error('Error completando tarea de limpieza:', error);
      return { success: false, error: error.message };
    }
  };

  // Buscar habitaciones
  const searchRooms = (searchTerm, filters = {}) => {
    let filtered = [...rooms];

    // Filtro por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toString().toLowerCase();
      filtered = filtered.filter(room => 
        room.number.toString().includes(term) ||
        room.type.toLowerCase().includes(term) ||
        room.floor.toString().includes(term) ||
        room.description?.toLowerCase().includes(term)
      );
    }

    // Filtros adicionales
    if (filters.status) {
      filtered = filtered.filter(room => room.status === filters.status);
    }

    if (filters.floor) {
      filtered = filtered.filter(room => room.floor === parseInt(filters.floor));
    }

    if (filters.type) {
      filtered = filtered.filter(room => room.type === filters.type);
    }

    return filtered;
  };

  // Obtener habitaciones que necesitan limpieza
  const getRoomsNeedingCleaning = () => {
    return rooms.filter(room => 
      room.status === ROOM_STATUS.CHECKOUT || room.status === ROOM_STATUS.CLEANING
    );
  };

  // Obtener habitaciones en mantenimiento
  const getRoomsInMaintenance = () => {
    return rooms.filter(room => 
      room.status === ROOM_STATUS.MAINTENANCE || room.status === ROOM_STATUS.OUT_OF_ORDER
    );
  };

  // Refrescar todos los datos
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadRooms(),
        loadRoomTypes(),
        loadCleaningStaff(),
        loadCleaningTasks()
      ]);
    } catch (error) {
      console.error('Error refrescando datos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    // Canal para habitaciones
    const roomsChannel = supabase
      .channel('rooms_management_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          console.log('Cambio en habitaciones:', payload);
          loadRooms();
        }
      )
      .subscribe();

    // Canal para tareas de limpieza
    const cleaningChannel = supabase
      .channel('cleaning_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'room_cleaning' },
        (payload) => {
          console.log('Cambio en tareas de limpieza:', payload);
          loadCleaningTasks();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(cleaningChannel);
    };
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // Datos
    rooms,
    roomTypes,
    cleaningStaff,
    cleaningTasks,
    roomStats,
    roomsByType,
    loading,
    error,
    
    // Métodos CRUD de habitaciones
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    updateRoomStatusByNumber,
    
    // Métodos de limpieza
    createCleaningTask,
    assignCleaning,
    completeCleaningTask,
    
    // Métodos de consulta
    searchRooms,
    getRoomsNeedingCleaning,
    getRoomsInMaintenance,
    refreshData,
    
    // Funciones de recarga individual
    loadRooms,
    loadRoomTypes,
    loadCleaningStaff,
    loadCleaningTasks,
    
    // Constantes
    ROOM_STATUS,
    CLEANING_STATUS
  };
};