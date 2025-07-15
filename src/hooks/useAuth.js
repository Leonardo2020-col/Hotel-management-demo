// src/hooks/useAuth.js - VERSIÓN CORREGIDA COMPLETA
import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { supabase, handleAuthError, checkAuth } from '../lib/supabase';
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
    PERMISSIONS.VIEW_REPORTS
  ],
  [USER_ROLES.HOUSEKEEPING]: [
    PERMISSIONS.VIEW_ROOMS,
    PERMISSIONS.EDIT_ROOM_STATUS,
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
  const [initialized, setInitialized] = useState(false);

  // FIX: Crear usuario demo para desarrollo - MEMOIZADA
  const createDemoUser = useCallback(async () => {
    try {
      const demoUser = {
        id: 'demo-user-id',
        email: 'admin@hotelparaiso.com',
        user_metadata: {
          full_name: 'Administrador Demo'
        }
      };

      const demoStaff = {
        id: 1,
        employeeId: 'DEMO001',
        email: 'admin@hotelparaiso.com',
        fullName: 'Administrador Demo',
        role: USER_ROLES.ADMIN,
        department: 'Administration',
        phone: '+51 999 888 777',
        status: 'active',
        permissions: {},
        branch: {
          id: 1,
          name: 'Hotel Paraíso Principal',
          code: 'HTP',
          city: 'Lima'
        },
        branchId: 1
      };

      setUser(demoUser);
      setStaff(demoStaff);
      console.log('Demo user created for development');
    } catch (error) {
      console.error('Error creating demo user:', error);
    }
  }, []);

  // FIX: Cargar datos del usuario/empleado - MEMOIZADA
  const loadUserData = useCallback(async (authUser) => {
    try {
      setUser(authUser);

      // Intentar buscar datos del empleado en la tabla staff
      try {
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
        } else {
          // Si no se encuentra staff, crear uno básico
          const basicStaff = {
            id: 1,
            employeeId: 'USER001',
            email: authUser.email,
            fullName: authUser.user_metadata?.full_name || authUser.email,
            role: USER_ROLES.ADMIN,
            department: 'Administration',
            status: 'active',
            permissions: {},
            branch: {
              id: 1,
              name: 'Hotel Paraíso Principal',
              code: 'HTP',
              city: 'Lima'
            },
            branchId: 1
          };
          setStaff(basicStaff);
        }
      } catch (staffError) {
        console.warn('Could not load staff data, using basic profile:', staffError);
        // Fallback a perfil básico
        const basicStaff = {
          id: 1,
          employeeId: 'USER001',
          email: authUser.email,
          fullName: authUser.user_metadata?.full_name || authUser.email,
          role: USER_ROLES.ADMIN,
          department: 'Administration',
          status: 'active',
          permissions: {},
          branch: {
            id: 1,
            name: 'Hotel Paraíso Principal',
            code: 'HTP',
            city: 'Lima'
          },
          branchId: 1
        };
        setStaff(basicStaff);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
    }
  }, []);

  // FIX: Función principal para obtener sesión - MEMOIZADA CON CONTROL DE EJECUCIÓN
  const getSession = useCallback(async () => {
    // Prevenir ejecución múltiple
    if (initialized) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const authCheck = await checkAuth();
      
      if (authCheck.success && authCheck.session?.user) {
        await loadUserData(authCheck.session.user);
      } else {
        // Solo crear usuario demo si no tenemos usuario
        if (!user && !staff) {
          await createDemoUser();
        }
      }
    } catch (err) {
      console.error('Error getting session:', err);
      setError(err.message);
      // Solo crear usuario demo si no tenemos usuario y no hay error de red
      if (!user && !staff && !err.message.includes('fetch')) {
        await createDemoUser();
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized, user, staff, loadUserData, createDemoUser]);

  // FIX: Verificar sesión al cargar - CON CONTROL DE EJECUCIÓN
  useEffect(() => {
    // Solo ejecutar si no se ha inicializado
    if (!initialized) {
      getSession();
    }

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setStaff(null);
          // Solo crear usuario demo si no tenemos sesión
          if (!session?.user) {
            await createDemoUser();
          }
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [initialized, getSession, loadUserData, createDemoUser]);

  // FIX: Iniciar sesión - MEMOIZADA
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

  // FIX: Cerrar sesión - MEMOIZADA
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setUser(null);
      setStaff(null);
      setInitialized(false); // Reset initialization flag
      toast.success('Sesión cerrada exitosamente');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Error al cerrar sesión: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // FIX: Registrar nuevo empleado - MEMOIZADA
  const registerStaff = useCallback(async (staffData) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_STAFF)) {
        throw new Error('No tienes permisos para registrar empleados');
      }

      // Solo crear registro en tabla staff (sin crear usuario de auth por ahora)
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
  }, [staff]); // Dependencia de staff para hasPermission

  // FIX: Verificar permisos - MEMOIZADA
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

  // FIX: Verificar múltiples permisos - MEMOIZADA
  const hasAnyPermission = useCallback((permissions) => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // FIX: Verificar todos los permisos - MEMOIZADA
  const hasAllPermissions = useCallback((permissions) => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // FIX: Verificar si tiene rol específico - MEMOIZADA
  const hasRole = useCallback((role) => {
    return staff?.role === role;
  }, [staff?.role]);

  // FIX: Retornar objeto memoizado para evitar re-renders innecesarios
  return useMemo(() => ({
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

    // Permisos
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,

    // Utilidades
    loadUserData,

    // Constantes
    USER_ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS
  }), [
    user,
    staff,
    loading,
    error,
    signIn,
    signOut,
    registerStaff,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    loadUserData
  ]);
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