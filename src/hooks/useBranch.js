// src/hooks/useBranch.js - Código completo final
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext, PERMISSIONS } from './useAuth';
import toast from 'react-hot-toast';

export const BRANCH_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance'
};

export const useBranch = () => {
  const { staff, hasPermission } = useAuthContext();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar sucursales desde Supabase
  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          manager:staff(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      const transformedBranches = (data || []).map(branch => ({
        id: branch.id,
        name: branch.name,
        code: branch.code,
        address: branch.address,
        city: branch.city,
        country: branch.country,
        phone: branch.phone,
        email: branch.email,
        totalRooms: branch.total_rooms || 0,
        status: branch.status,
        manager: branch.manager ? {
          id: branch.manager.id,
          name: branch.manager.full_name,
          email: branch.manager.email,
          phone: branch.manager.phone
        } : null,
        timezone: 'America/Lima',
        features: branch.settings?.features || [],
        createdAt: branch.created_at
      }));

      setBranches(transformedBranches);

      // Si el usuario tiene una sucursal asignada y no hay una seleccionada, usar esa
      if (!selectedBranch && staff?.branchId) {
        const userBranch = transformedBranches.find(b => b.id === staff.branchId);
        if (userBranch) {
          setSelectedBranch(userBranch);
          localStorage.setItem('selectedBranchId', userBranch.id.toString());
        }
      } else if (!selectedBranch && transformedBranches.length > 0) {
        // Si no hay sucursal asignada, usar la primera disponible
        setSelectedBranch(transformedBranches[0]);
        localStorage.setItem('selectedBranchId', transformedBranches[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError(err.message);
      
      // Si hay error, crear sucursal por defecto
      const defaultBranch = {
        id: 1,
        name: 'Hotel Paraíso Principal',
        code: 'HTP',
        address: 'Av. Principal 123',
        city: 'Lima',
        country: 'Peru',
        phone: '+51 1 234-5678',
        email: 'principal@hotelparaiso.com',
        totalRooms: 36,
        status: 'active',
        manager: null,
        timezone: 'America/Lima',
        features: ['WiFi Gratuito', 'Recepción 24h']
      };
      
      setBranches([defaultBranch]);
      setSelectedBranch(defaultBranch);
      localStorage.setItem('selectedBranchId', '1');
    } finally {
      setLoading(false);
    }
  }, [staff, selectedBranch]);

  // Cargar sucursal desde localStorage al inicio
  useEffect(() => {
    const savedBranchId = localStorage.getItem('selectedBranchId');
    if (savedBranchId && branches.length > 0) {
      const branch = branches.find(b => b.id === parseInt(savedBranchId));
      if (branch) {
        setSelectedBranch(branch);
      }
    }
  }, [branches]);

  // Cargar datos inicialmente
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Obtener estadísticas de una sucursal específica con funciones SQL
  const getBranchStats = useCallback(async (branchId, date = new Date()) => {
    try {
      const dateStr = date.toISOString().split('T')[0];

      // Intentar usar las funciones SQL primero
      try {
        const [occupancyResponse, revenueResponse] = await Promise.all([
          // Estadísticas de ocupación
          supabase.rpc('get_branch_occupancy_stats', {
            p_branch_id: branchId,
            p_date: dateStr
          }),
          
          // Estadísticas de ingresos
          supabase.rpc('get_branch_revenue_stats', {
            p_branch_id: branchId,
            p_start_date: dateStr,
            p_end_date: dateStr
          })
        ]);

        if (occupancyResponse.error) throw occupancyResponse.error;
        if (revenueResponse.error) throw revenueResponse.error;

        const occupancyData = occupancyResponse.data?.[0];
        const revenueData = revenueResponse.data?.[0];

        // Obtener llegadas y salidas del día
        const [arrivalsResponse, departuresResponse] = await Promise.all([
          supabase
            .from('reservations')
            .select('id')
            .eq('check_in_date', dateStr)
            .in('status', ['confirmed', 'pending', 'checked_in']),
          
          supabase
            .from('reservations')
            .select('id')
            .eq('check_out_date', dateStr)
            .in('status', ['checked_in', 'checked_out'])
        ]);

        return {
          rooms: {
            total: occupancyData?.total_rooms || 0,
            available: occupancyData?.available_rooms || 0,
            occupied: occupancyData?.occupied_rooms || 0,
            checkout: occupancyData?.checkout_rooms || 0,
            cleaning: occupancyData?.cleaning_rooms || 0,
            maintenance: 0,
            outOfOrder: 0
          },
          reservations: {
            checkInsToday: arrivalsResponse.data?.length || 0,
            checkOutsToday: departuresResponse.data?.length || 0,
            totalReservations: (arrivalsResponse.data?.length || 0) + (departuresResponse.data?.length || 0)
          },
          revenue: {
            total: parseFloat(revenueData?.total_revenue || 0),
            rooms: parseFloat(revenueData?.room_revenue || 0),
            services: parseFloat(revenueData?.services_revenue || 0),
            pending: parseFloat(revenueData?.pending_payments || 0)
          },
          occupancy: {
            rate: parseFloat(occupancyData?.occupancy_rate || 0),
            occupiedRooms: occupancyData?.occupied_rooms || 0,
            availableRooms: occupancyData?.available_rooms || 0
          }
        };

      } catch (funcError) {
        console.warn('Error using SQL functions, falling back to basic queries:', funcError);
        
        // Fallback: consultas básicas
        const [roomsResponse, reservationsResponse] = await Promise.all([
          // Total de habitaciones por estado
          supabase
            .from('rooms')
            .select('status')
            .eq('branch_id', branchId),

          // Reservas básicas
          supabase
            .from('reservations')
            .select('status, total_amount, paid_amount, check_in_date, check_out_date')
            .or(`check_in_date.eq.${dateStr},check_out_date.eq.${dateStr}`)
        ]);

        if (roomsResponse.error) throw roomsResponse.error;
        if (reservationsResponse.error) throw reservationsResponse.error;

        // Procesar estadísticas de habitaciones
        const roomStats = (roomsResponse.data || []).reduce((acc, room) => {
          acc[room.status] = (acc[room.status] || 0) + 1;
          return acc;
        }, {});

        // Procesar reservas
        const todayArrivals = (reservationsResponse.data || []).filter(r => r.check_in_date === dateStr);
        const todayDepartures = (reservationsResponse.data || []).filter(r => r.check_out_date === dateStr);

        // Calcular ingresos básicos
        const totalRevenue = (reservationsResponse.data || []).reduce((sum, r) => 
          sum + parseFloat(r.total_amount || 0), 0
        );

        return {
          rooms: {
            total: roomsResponse.data?.length || 0,
            available: roomStats.available || 0,
            occupied: roomStats.occupied || 0,
            checkout: roomStats.checkout || 0,
            cleaning: roomStats.cleaning || 0,
            maintenance: roomStats.maintenance || 0,
            outOfOrder: roomStats.out_of_order || 0
          },
          reservations: {
            checkInsToday: todayArrivals.length,
            checkOutsToday: todayDepartures.length,
            totalReservations: reservationsResponse.data?.length || 0
          },
          revenue: {
            total: totalRevenue,
            rooms: totalRevenue * 0.8, // Estimado
            services: totalRevenue * 0.2, // Estimado
            pending: totalRevenue * 0.3 // Estimado
          },
          occupancy: {
            rate: roomStats.occupied ? Math.round((roomStats.occupied / (roomsResponse.data?.length || 1)) * 100) : 0,
            occupiedRooms: roomStats.occupied || 0,
            availableRooms: roomStats.available || 0
          }
        };
      }
    } catch (err) {
      console.error('Error fetching branch stats:', err);
      return {
        rooms: { total: 0, available: 0, occupied: 0, checkout: 0, cleaning: 0, maintenance: 0, outOfOrder: 0 },
        reservations: { checkInsToday: 0, checkOutsToday: 0, totalReservations: 0 },
        revenue: { total: 0, rooms: 0, services: 0, pending: 0 },
        occupancy: { rate: 0, occupiedRooms: 0, availableRooms: 0 }
      };
    }
  }, []);

  // Obtener estadísticas de la sucursal actual
  const getCurrentBranchStats = useCallback(async (date = new Date()) => {
    if (!selectedBranch) return null;
    return await getBranchStats(selectedBranch.id, date);
  }, [selectedBranch, getBranchStats]);

  // Cambiar sucursal seleccionada
  const selectBranch = useCallback(async (branchId) => {
    try {
      // Verificar permisos
      if (!canChangeBranch()) {
        throw new Error('No tienes permisos para cambiar de sucursal');
      }

      const branch = branches.find(b => b.id === branchId);
      if (!branch) {
        throw new Error('Sucursal no encontrada');
      }

      setSelectedBranch(branch);
      localStorage.setItem('selectedBranchId', branchId.toString());
      
      toast.success(`Sucursal cambiada a: ${branch.name}`);
      return branch;
    } catch (err) {
      console.error('Error selecting branch:', err);
      toast.error('Error al cambiar sucursal: ' + err.message);
      throw err;
    }
  }, [branches]);

  // Crear nueva sucursal (solo administradores)
  const createBranch = useCallback(async (branchData) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_BRANCHES)) {
        throw new Error('No tienes permisos para crear sucursales');
      }

      const { data, error } = await supabase
        .from('branches')
        .insert({
          name: branchData.name,
          code: branchData.code,
          address: branchData.address,
          city: branchData.city,
          country: branchData.country || 'Peru',
          phone: branchData.phone,
          email: branchData.email,
          total_rooms: branchData.totalRooms || 0,
          status: BRANCH_STATUS.ACTIVE,
          settings: {
            timezone: branchData.timezone || 'America/Lima',
            features: branchData.features || [],
            ...branchData.settings
          }
        })
        .select(`
          *,
          manager:staff(full_name, email, phone)
        `)
        .single();

      if (error) throw error;

      const newBranch = {
        id: data.id,
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        country: data.country,
        phone: data.phone,
        email: data.email,
        totalRooms: data.total_rooms,
        status: data.status,
        manager: data.manager,
        timezone: data.settings?.timezone || 'America/Lima',
        features: data.settings?.features || []
      };

      setBranches(prev => [...prev, newBranch]);
      toast.success('Sucursal creada exitosamente');
      return newBranch;
    } catch (err) {
      console.error('Error creating branch:', err);
      toast.error('Error al crear sucursal: ' + err.message);
      throw err;
    }
  }, [hasPermission]);

  // Actualizar sucursal
  const updateBranch = useCallback(async (branchId, updates) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_BRANCHES)) {
        throw new Error('No tienes permisos para actualizar sucursales');
      }

      const { data, error } = await supabase
        .from('branches')
        .update({
          name: updates.name,
          address: updates.address,
          city: updates.city,
          country: updates.country,
          phone: updates.phone,
          email: updates.email,
          total_rooms: updates.totalRooms,
          status: updates.status,
          settings: {
            timezone: updates.timezone,
            features: updates.features,
            ...updates.settings
          }
        })
        .eq('id', branchId)
        .select(`
          *,
          manager:staff(full_name, email, phone)
        `)
        .single();

      if (error) throw error;

      // Actualizar lista local
      setBranches(prev => prev.map(branch => 
        branch.id === branchId ? {
          ...branch,
          ...updates,
          manager: data.manager
        } : branch
      ));

      // Si es la sucursal seleccionada, actualizar también
      if (selectedBranch?.id === branchId) {
        setSelectedBranch(prev => ({ ...prev, ...updates }));
      }

      toast.success('Sucursal actualizada exitosamente');
      return data;
    } catch (err) {
      console.error('Error updating branch:', err);
      toast.error('Error al actualizar sucursal: ' + err.message);
      throw err;
    }
  }, [hasPermission, selectedBranch]);

  // Funciones de utilidad
  const getCurrentBranchInfo = useCallback(() => {
    return selectedBranch;
  }, [selectedBranch]);

  const getBranchById = useCallback((id) => {
    return branches.find(branch => branch.id === id);
  }, [branches]);

  const getCurrentBranchCode = useCallback(() => {
    return selectedBranch?.code || 'N/A';
  }, [selectedBranch]);

  const getBranchDisplayName = useCallback(() => {
    if (!selectedBranch) return 'Sin sucursal';
    return `${selectedBranch.name} (${selectedBranch.code})`;
  }, [selectedBranch]);

  const isBranchSelected = useCallback((branchId) => {
    return selectedBranch?.id === branchId;
  }, [selectedBranch]);

  const canChangeBranch = useCallback(() => {
    // Los administradores pueden cambiar a cualquier sucursal
    // Los demás solo pueden acceder a su sucursal asignada
    return hasPermission(PERMISSIONS.MANAGE_BRANCHES) || 
           branches.length <= 1 ||
           staff?.role === 'admin';
  }, [hasPermission, branches.length, staff]);

  // Función alias para compatibilidad con el hook original
  const changeBranch = useCallback(async (branchId) => {
    return await selectBranch(branchId);
  }, [selectBranch]);

  // Obtener sucursales disponibles para el usuario actual
  const getAvailableBranches = useCallback(() => {
    if (hasPermission(PERMISSIONS.MANAGE_BRANCHES)) {
      return branches; // Administradores ven todas
    }
    
    // Otros usuarios solo ven su sucursal asignada
    return branches.filter(branch => branch.id === staff?.branchId);
  }, [branches, hasPermission, staff]);

  // Alias para compatibilidad con el hook original
  const availableBranches = getAvailableBranches();

  // Configurar actualizaciones en tiempo real
  useEffect(() => {
    const subscription = supabase
      .channel('branches_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'branches' },
        () => {
          console.log('Branch data changed, refreshing...');
          fetchBranches();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [fetchBranches]);

  return {
    // Estado (compatible con hook original)
    selectedBranch,
    availableBranches,
    branches: getAvailableBranches(),
    loading,
    error,

    // Acciones principales (nuevas funcionalidades)
    selectBranch,
    createBranch,
    updateBranch,

    // Funciones de información (compatible con hook original)
    getCurrentBranchInfo,
    getBranchById,
    getCurrentBranchCode,
    getCurrentBranchStats,
    getBranchStats,
    getBranchDisplayName,

    // Funciones de acción (compatible con hook original)
    changeBranch,
    canChangeBranch,
    isBranchSelected,

    // Utilidades adicionales
    refreshBranches: fetchBranches,

    // Estado derivado (compatible con hook original)
    hasSelectedBranch: !!selectedBranch,
    isMultiBranch: branches.length > 1,
    isAdmin: staff?.role === 'admin',

    // Constantes
    BRANCH_STATUS
  };
};