// hooks/useRooms.js
import { useState, useEffect, useMemo } from 'react';
import { mockRooms, roomTypes, cleaningStaff, ROOM_STATUS, CLEANING_STATUS } from '../utils/roomMockData';

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simular carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setRooms(mockRooms);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos de habitaciones');
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
    const cleaning = rooms.filter(r => r.status === ROOM_STATUS.CLEANING).length;
    const maintenance = rooms.filter(r => r.status === ROOM_STATUS.MAINTENANCE).length;
    const outOfOrder = rooms.filter(r => r.status === ROOM_STATUS.OUT_OF_ORDER).length;
    const needsCleaning = rooms.filter(r => r.cleaningStatus === CLEANING_STATUS.DIRTY).length;
    
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    // Simular ingresos
    const todayRevenue = occupied * 200; // Promedio de S/ 200 por habitación
    const monthlyRevenue = todayRevenue * 30; // Estimado mensual
    const averageRevenue = monthlyRevenue / 30;

    return {
      total,
      available,
      occupied,
      occupancyRate,
      cleaning,
      maintenance,
      outOfOrder,
      needsCleaning,
      revenue: {
        today: todayRevenue,
        thisMonth: monthlyRevenue,
        average: averageRevenue
      }
    };
  }, [rooms]);

  // Calcular habitaciones por tipo
  const roomsByType = useMemo(() => {
    if (!rooms || rooms.length === 0) return {};

    const typeStats = {};
    
    roomTypes.forEach(type => {
      const typeRooms = rooms.filter(r => r.type === type.name);
      typeStats[type.name] = {
        total: typeRooms.length,
        available: typeRooms.filter(r => r.status === ROOM_STATUS.AVAILABLE).length,
        occupied: typeRooms.filter(r => r.status === ROOM_STATUS.OCCUPIED).length,
        averageRate: type.baseRate
      };
    });

    return typeStats;
  }, [rooms]);

  // Crear nueva habitación
  const createRoom = async (roomData) => {
    try {
      const newRoom = {
        id: Date.now(),
        number: roomData.number,
        floor: parseInt(roomData.floor),
        type: roomData.type,
        status: ROOM_STATUS.AVAILABLE,
        cleaningStatus: CLEANING_STATUS.CLEAN,
        capacity: parseInt(roomData.capacity),
        beds: roomData.beds,
        size: parseFloat(roomData.size),
        rate: parseFloat(roomData.rate),
        features: roomData.features,
        description: roomData.description,
        lastCleaned: new Date().toISOString(),
        cleanedBy: 'Sistema',
        currentGuest: null,
        nextReservation: null,
        maintenanceNotes: '',
        images: [],
        created: new Date().toISOString()
      };

      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (error) {
      throw new Error('Error al crear la habitación');
    }
  };

  // Actualizar habitación
  const updateRoom = async (roomId, updateData) => {
    try {
      setRooms(prev => prev.map(room => 
        room.id === roomId 
          ? { ...room, ...updateData }
          : room
      ));
      return true;
    } catch (error) {
      throw new Error('Error al actualizar la habitación');
    }
  };

  // Eliminar habitación
  const deleteRoom = async (roomId) => {
    try {
      setRooms(prev => prev.filter(room => room.id !== roomId));
      return true;
    } catch (error) {
      throw new Error('Error al eliminar la habitación');
    }
  };

  // Actualizar estado de habitación
  const updateRoomStatus = async (roomId, newStatus) => {
    try {
      setRooms(prev => prev.map(room => 
        room.id === roomId 
          ? { ...room, status: newStatus }
          : room
      ));
      return true;
    } catch (error) {
      throw new Error('Error al actualizar el estado');
    }
  };

  // Actualizar estado de limpieza
  const updateCleaningStatus = async (roomId, newStatus) => {
    try {
      setRooms(prev => prev.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              cleaningStatus: newStatus,
              lastCleaned: newStatus === CLEANING_STATUS.CLEAN ? new Date().toISOString() : room.lastCleaned
            }
          : room
      ));
      return true;
    } catch (error) {
      throw new Error('Error al actualizar el estado de limpieza');
    }
  };

  // Asignar limpieza
  const assignCleaning = async (roomIds, staffId) => {
    try {
      const staff = cleaningStaff.find(s => s.id === staffId);
      const staffName = staff ? staff.name : 'Personal asignado';

      setRooms(prev => prev.map(room => 
        roomIds.includes(room.id)
          ? { 
              ...room, 
              cleaningStatus: CLEANING_STATUS.IN_PROGRESS,
              assignedCleaner: staffName,
              cleaningStartTime: new Date().toISOString()
            }
          : room
      ));
      return true;
    } catch (error) {
      throw new Error('Error al asignar la limpieza');
    }
  };

  return {
    // Datos
    rooms,
    roomTypes,
    cleaningStaff,
    roomStats,
    roomsByType,
    loading,
    error,
    
    // Métodos CRUD
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    updateCleaningStatus,
    assignCleaning
  };
};