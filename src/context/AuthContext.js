// src/context/AuthContext.js - VERSIÓN ACTUALIZADA CON SUCURSALES
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        permissions: action.payload.permissions,
        selectedBranch: action.payload.selectedBranch || null,
        needsBranchSelection: action.payload.needsBranchSelection || false,
        error: null
      };
    
    case 'SET_BRANCH':
      return {
        ...state,
        selectedBranch: action.payload,
        needsBranchSelection: false,
        loading: false
      };
    
    case 'REQUIRE_BRANCH_SELECTION':
      return {
        ...state,
        needsBranchSelection: true,
        loading: false
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        permissions: null,
        selectedBranch: null,
        needsBranchSelection: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        permissions: null,
        selectedBranch: null,
        needsBranchSelection: false,
        error: null,
        loading: false
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  permissions: null,
  selectedBranch: null,
  needsBranchSelection: false,
  loading: true,
  error: null
};

// Datos de usuarios mock para demo
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@hotelparaiso.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
    avatar: null,
    requiresBranchSelection: true, // Administradores necesitan seleccionar sucursal
    permissions: {
      dashboard: { read: true, write: true },
      checkin: { read: false, write: false },
      reservations: { read: false, write: false },
      guests: { read: true, write: true },
      rooms: { read: true, write: true },
      supplies: { read: true, write: true },
      reports: { read: true, write: true },
      settings: { read: true, write: true }
    }
  },
  {
    id: 2,
    email: 'recepcion@hotelparaiso.com',
    password: 'recepcion123',
    name: 'Personal de Recepción',
    role: 'reception',
    avatar: null,
    requiresBranchSelection: false, // Personal de recepción tiene sucursal asignada
    defaultBranch: {
      id: 1,
      name: 'Hotel Paraíso - Centro',
      location: 'San Isidro, Lima'
    },
    permissions: {
      dashboard: { read: true, write: false },
      checkin: { read: true, write: true },
      reservations: { read: true, write: true },
      guests: { read: true, write: true },
      rooms: { read: true, write: true },
      supplies: { read: true, write: false },
      reports: { read: true, write: false },
      settings: { read: false, write: false }
    }
  }
];

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar si hay sesión guardada al cargar la app
  useEffect(() => {
    const checkSavedSession = () => {
      try {
        const savedUser = localStorage.getItem('hotel_user');
        const savedPermissions = localStorage.getItem('hotel_permissions');
        const savedBranch = localStorage.getItem('hotel_selected_branch');
        
        if (savedUser && savedPermissions) {
          const user = JSON.parse(savedUser);
          const permissions = JSON.parse(savedPermissions);
          const selectedBranch = savedBranch ? JSON.parse(savedBranch) : null;
          
          // Verificar si el administrador necesita seleccionar sucursal
          const needsBranchSelection = user.role === 'admin' && !selectedBranch;
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { 
              user, 
              permissions,
              selectedBranch,
              needsBranchSelection
            }
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error checking saved session:', error);
        localStorage.removeItem('hotel_user');
        localStorage.removeItem('hotel_permissions');
        localStorage.removeItem('hotel_selected_branch');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const timer = setTimeout(checkSavedSession, 100);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = MOCK_USERS.find(u => u.email === email && u.password === password);

      if (!user) {
        throw new Error('Credenciales incorrectas');
      }

      const { password: _, ...userWithoutPassword } = user;
      const { permissions } = user;

      // Guardar datos básicos
      localStorage.setItem('hotel_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('hotel_permissions', JSON.stringify(permissions));

      // Verificar si necesita selección de sucursal
      if (user.requiresBranchSelection) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userWithoutPassword,
            permissions,
            needsBranchSelection: true
          }
        });
      } else {
        // Para personal de recepción, usar sucursal por defecto
        const defaultBranch = user.defaultBranch;
        if (defaultBranch) {
          localStorage.setItem('hotel_selected_branch', JSON.stringify(defaultBranch));
        }

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userWithoutPassword,
            permissions,
            selectedBranch: defaultBranch,
            needsBranchSelection: false
          }
        });
      }

      return { success: true };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  const selectBranch = async (branch) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simular delay para configuración de sucursal
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Guardar sucursal seleccionada
      localStorage.setItem('hotel_selected_branch', JSON.stringify(branch));
      
      dispatch({
        type: 'SET_BRANCH',
        payload: branch
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('hotel_user');
    localStorage.removeItem('hotel_permissions');
    localStorage.removeItem('hotel_selected_branch');
    
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasPermission = (module, action = 'read') => {
    if (!state.permissions || !state.permissions[module]) {
      return false;
    }
    return state.permissions[module][action] === true;
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const getAllowedRoutes = () => {
    if (!state.permissions) return [];

    const routes = [];
    
    Object.keys(state.permissions).forEach(module => {
      if (state.permissions[module].read) {
        routes.push(module);
      }
    });

    return routes;
  };

  const isReady = () => {
    if (!state.isAuthenticated) return false;
    if (state.user?.role === 'admin') {
      return !state.needsBranchSelection && state.selectedBranch;
    }
    return true;
  };

  const value = {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    permissions: state.permissions,
    selectedBranch: state.selectedBranch,
    needsBranchSelection: state.needsBranchSelection,
    loading: state.loading,
    error: state.error,
    login,
    selectBranch,
    logout,
    clearError,
    hasPermission,
    hasRole,
    getAllowedRoutes,
    isReady
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};