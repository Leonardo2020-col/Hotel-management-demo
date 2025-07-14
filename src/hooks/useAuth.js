// src/hooks/useAuth.js
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Contexto de autenticación
const AuthContext = createContext({});

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  RECEPTION: 'reception',
  HOUSEKEEPING: 'housekeeping',
  MAINTENANCE: 'maintenance',
  RESTAURANT: 'restaurant'
};

export const PERMISSIONS = {
  // Reservas
  VIEW_RESERVATIONS: 'view_reservations',
  CREATE_RESERVATIONS: 'create_reservations',
  EDIT_RESERVATIONS: 'edit_reservations',
  DELETE_RESERVATIONS: 'delete_reservations',
  
  // Habitaciones
  VIEW_ROOMS: 'view_rooms',
  EDIT_ROOM_STATUS: 'edit_room_status',
  MANAGE_ROOMS: 'manage_rooms',
  
  // Huéspedes
  VIEW_GUESTS: 'view_guests',
  EDIT_GUESTS: 'edit_guests',
  VIEW_GUEST_HISTORY: 'view_guest_history',
  
  // Órdenes y servicios
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  EDIT_ORDERS: 'edit_orders',
  MANAGE_SERVICES: 'manage_services',
  
  // Limpieza
  VIEW_CLEANING: 'view_cleaning',
  MANAGE_CLEANING: 'manage_cleaning',
  
  // Inventario
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Personal
  VIEW_STAFF: 'view_staff',
  MANAGE_STAFF: 'manage_staff',
  
  // Reportes
  VIEW_REPORTS: 'view_reports',
  ADVANCED_REPORTS: 'advanced_reports',
  
  // Sistema
  SYSTEM_SETTINGS: 'system_settings',
  MANAGE_BRANCHES: 'manage_branches'
};

// Permisos por rol
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.VIEW_RESERVATIONS,
    PERMISSIONS.CREATE_RESERVATIONS,
    PERMISSIONS.EDIT_RESERVATIONS,
    PERMISSIONS.VIEW_ROOMS,
    PERMISSIONS.EDIT_ROOM_STATUS,
    PERMISSIONS.MANAGE_ROOMS,
    PERMISSIONS.VIEW_GUESTS,
    PERMISSIONS.EDIT_GUESTS,
    PERMISSIONS.VIEW_GUEST_HISTORY,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.MANAGE_SERVICES,
    PERMISSIONS.VIEW_CLEANING,
    PERMISSIONS.MANAGE_CLEANING,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.ADVANCED_REPORTS
  ],
  [USER_ROLES.RECEPTION]: [
    PERMISSIONS.VIEW_RESERVATIONS,
    PERMISSIONS.CREATE_RESERVATIONS,
    PERMISSIONS.EDIT_RESERVATIONS,
    PERMISSIONS.VIEW_ROOMS,
    PERMISSIONS.EDIT_ROOM_STATUS,
    PERMISSIONS.VIEW_GUESTS,
    PERMISSIONS.EDIT_GUESTS,
    PERMISSIONS.VIEW_GUEST_HISTORY,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.VIEW_CLEANING,
    PERMISSIONS.VIEW_REPORTS
  ],
  [USER_ROLES.HOUSEKEEPING]: [
    PERMISSIONS.VIEW_ROOMS,
    PERMISSIONS.EDIT_ROOM_STATUS,
    PERMISSIONS.VIEW_CLEANING,
    PERMISSIONS.MANAGE_CLEANING,
    PERMISSIONS.VIEW_INVENTORY
  ],
  [USER_ROLES.MAINTENANCE]: [
    PERMISSIONS.VIEW_ROOMS,
    PERMISSIONS.EDIT_ROOM_STATUS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY
  ],
  [USER_ROLES.RESTAURANT]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.MANAGE_SERVICES,
    PERMISSIONS.VIEW_INVENTORY
  ]
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar sesión al cargar
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          await loadUserData(session.user);
        }
      } catch (err) {
        console.error('Error getting session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setStaff(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Cargar datos del usuario/empleado
  const loadUserData = async (authUser) => {
    try {
      setUser(authUser);

      // Buscar datos del empleado en la tabla staff
      const { data: staffData, error } = await supabase
        .from('staff')
        .select(`
          *,
          branch:branches(
            id,
            name,
            code,
            city
          )
        `)
        .eq('email', authUser.email)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (staffData) {
        const transformedStaff = {
          id: staffData.id,
          employeeId: staffData.employee_id,
          email: staffData.email,
          fullName: staffData.full_name,
          role: staffData.role,
          department: staffData.department,
          phone: staffData.phone,
          hireDate: staffData.hire_date,
          salary: staffData.salary,
          status: staffData.status,
          permissions: staffData.permissions || {},
          branch: staffData.branch ? {
            id: staffData.branch.id,
            name: staffData.branch.name,
            code: staffData.branch.code,
            city: staffData.branch.city
          } : null,
          branchId: staffData.branch_id
        };

        setStaff(transformedStaff);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
    }
  };

  // Iniciar sesión
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success('Sesión iniciada exitosamente');
      return data;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err.message);
      toast.error('Error al iniciar sesión: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cerrar sesión
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setUser(null);
      setStaff(null);
      toast.success('Sesión cerrada exitosamente');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Error al cerrar sesión: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar nuevo empleado (solo admins)
  const registerStaff = useCallback(async (staffData) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_STAFF)) {
        throw new Error('No tienes permisos para registrar empleados');
      }

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: staffData.email,
        password: staffData.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Crear registro en tabla staff
      const { data, error } = await supabase
        .from('staff')
        .insert({
          employee_id: staffData.employeeId,
          email: staffData.email,
          full_name: staffData.fullName,
          role: staffData.role,
          department: staffData.department,
          phone: staffData.phone,
          hire_date: staffData.hireDate || new Date().toISOString().split('T')[0],
          salary: staffData.salary,
          status: 'active',
          permissions: ROLE_PERMISSIONS[staffData.role] || {},
          branch_id: staffData.branchId
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Empleado registrado exitosamente');
      return data;
    } catch (err) {
      console.error('Error registering staff:', err);
      toast.error('Error al registrar empleado: ' + err.message);
      throw err;
    }
  }, []);

  // Actualizar perfil de empleado
  const updateStaffProfile = useCallback(async (staffId, updates) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', staffId)
        .select()
        .single();

      if (error) throw error;

      // Si se actualiza el empleado actual, recargar datos
      if (staff && staffId === staff.id) {
        await loadUserData(user);
      }

      toast.success('Perfil actualizado exitosamente');
      return data;
    } catch (err) {
      console.error('Error updating staff profile:', err);
      toast.error('Error al actualizar perfil: ' + err.message);
      throw err;
    }
  }, [staff, user]);

  // Cambiar contraseña
  const changePassword = useCallback(async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Contraseña actualizada exitosamente');
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Error al cambiar contraseña: ' + err.message);
      throw err;
    }
  }, []);

  // Verificar permisos
  const hasPermission = useCallback((permission) => {
    if (!staff) return false;
    
    // Los admins tienen todos los permisos
    if (staff.role === USER_ROLES.ADMIN) return true;
    
    // Verificar permisos específicos del rol
    const rolePermissions = ROLE_PERMISSIONS[staff.role] || [];
    
    // Verificar permisos personalizados
    const customPermissions = Object.keys(staff.permissions || {}).filter(
      key => staff.permissions[key] === true
    );
    
    return rolePermissions.includes(permission) || customPermissions.includes(permission);
  }, [staff]);

  // Verificar múltiples permisos
  const hasAnyPermission = useCallback((permissions) => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // Verificar todos los permisos
  const hasAllPermissions = useCallback((permissions) => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Obtener lista de empleados (para admins/managers)
  const getStaffList = useCallback(async (filters = {}) => {
    try {
      if (!hasPermission(PERMISSIONS.VIEW_STAFF)) {
        throw new Error('No tienes permisos para ver la lista de empleados');
      }

      let query = supabase
        .from('staff')
        .select(`
          *,
          branch:branches(name, code)
        `)
        .order('full_name');

      // Aplicar filtros
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return data.map(member => ({
        id: member.id,
        employeeId: member.employee_id,
        email: member.email,
        fullName: member.full_name,
        role: member.role,
        department: member.department,
        phone: member.phone,
        hireDate: member.hire_date,
        status: member.status,
        branch: member.branch,
        branchId: member.branch_id
      }));
    } catch (err) {
      console.error('Error fetching staff list:', err);
      toast.error('Error al obtener lista de empleados: ' + err.message);
      return [];
    }
  }, [hasPermission]);

  // Desactivar empleado
  const deactivateStaff = useCallback(async (staffId) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_STAFF)) {
        throw new Error('No tienes permisos para desactivar empleados');
      }

      const { error } = await supabase
        .from('staff')
        .update({ status: 'inactive' })
        .eq('id', staffId);

      if (error) throw error;

      toast.success('Empleado desactivado exitosamente');
    } catch (err) {
      console.error('Error deactivating staff:', err);
      toast.error('Error al desactivar empleado: ' + err.message);
      throw err;
    }
  }, [hasPermission]);

  return {
    // Estado
    user,
    staff,
    loading,
    error,
    isAuthenticated: !!user && !!staff,

    // Acciones
    signIn,
    signOut,
    registerStaff,
    updateStaffProfile,
    changePassword,

    // Permisos
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Gestión de personal
    getStaffList,
    deactivateStaff,

    // Utilidades
    loadUserData,

    // Constantes
    USER_ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS
  };
};

// Proveedor de contexto
export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de AuthProvider');
  }
  
  return context;
};