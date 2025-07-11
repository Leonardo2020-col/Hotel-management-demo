// src/utils/authUtils.js
/**
 * Utilidades para manejar autenticación y permisos
 */

// Tipos de permisos disponibles
export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  RECEPTION: 'reception',
  RESERVATIONS: 'reservations',
  GUESTS: 'guests',
  ROOMS: 'rooms',
  SUPPLIES: 'supplies',
  REPORTS: 'reports',
  SETTINGS: 'settings'
};

// Roles disponibles
export const ROLES = {
  ADMIN: 'admin',
  RECEPTION: 'reception'
};

// Configuración de permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    [PERMISSIONS.DASHBOARD]: { read: true, write: true },
    [PERMISSIONS.RECEPTION]: { read: false, write: false }, // SIN ACCESO
    [PERMISSIONS.RESERVATIONS]: { read: true, write: false }, // SOLO LECTURA LIMITADA
    [PERMISSIONS.GUESTS]: { read: true, write: true },
    [PERMISSIONS.ROOMS]: { read: true, write: true },
    [PERMISSIONS.SUPPLIES]: { read: true, write: true },
    [PERMISSIONS.REPORTS]: { read: true, write: true },
    [PERMISSIONS.SETTINGS]: { read: true, write: true }
  },
  [ROLES.RECEPTION]: {
    [PERMISSIONS.DASHBOARD]: { read: true, write: false },
    [PERMISSIONS.RECEPTION]: { read: true, write: true }, // ACCESO COMPLETO
    [PERMISSIONS.RESERVATIONS]: { read: true, write: true }, // ACCESO COMPLETO
    [PERMISSIONS.GUESTS]: { read: true, write: true },
    [PERMISSIONS.ROOMS]: { read: true, write: true },
    [PERMISSIONS.SUPPLIES]: { read: true, write: false }, // SOLO LECTURA
    [PERMISSIONS.REPORTS]: { read: true, write: false }, // SOLO LECTURA
    [PERMISSIONS.SETTINGS]: { read: false, write: false } // SIN ACCESO
  }
};

/**
 * Verifica si un rol tiene un permiso específico
 * @param {string} role - El rol del usuario
 * @param {string} permission - El permiso a verificar
 * @param {string} action - La acción (read/write)
 * @returns {boolean}
 */
export const hasRolePermission = (role, permission, action = 'read') => {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions || !rolePermissions[permission]) {
    return false;
  }
  return rolePermissions[permission][action] === true;
};

/**
 * Obtiene todas las rutas permitidas para un rol
 * @param {string} role - El rol del usuario
 * @returns {string[]} Array de rutas permitidas
 */
export const getAllowedRoutesForRole = (role) => {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return [];

  const allowedRoutes = [];
  Object.keys(rolePermissions).forEach(permission => {
    if (rolePermissions[permission].read) {
      allowedRoutes.push(permission);
    }
  });

  return allowedRoutes;
};

/**
 * Mapea permisos a rutas del router
 */
export const PERMISSION_ROUTE_MAP = {
  [PERMISSIONS.DASHBOARD]: '/',
  [PERMISSIONS.RECEPTION]: '/reception',
  [PERMISSIONS.RESERVATIONS]: '/reservations',
  [PERMISSIONS.GUESTS]: '/guests',
  [PERMISSIONS.ROOMS]: '/rooms',
  [PERMISSIONS.SUPPLIES]: '/supplies',
  [PERMISSIONS.REPORTS]: '/reports',
  [PERMISSIONS.SETTINGS]: '/settings'
};

/**
 * Obtiene la primera ruta permitida para un rol (ruta de inicio)
 * @param {string} role - El rol del usuario
 * @returns {string} Primera ruta permitida
 */
export const getDefaultRouteForRole = (role) => {
  const allowedRoutes = getAllowedRoutesForRole(role);
  if (allowedRoutes.length === 0) return '/';
  
  // Priorizar dashboard si está disponible
  if (allowedRoutes.includes(PERMISSIONS.DASHBOARD)) {
    return PERMISSION_ROUTE_MAP[PERMISSIONS.DASHBOARD];
  }
  
  // Si no, devolver la primera ruta permitida
  return PERMISSION_ROUTE_MAP[allowedRoutes[0]] || '/';
};

/**
 * Obtiene información descriptiva de un rol
 * @param {string} role - El rol del usuario
 * @returns {object} Información del rol
 */
export const getRoleInfo = (role) => {
  const roleInfo = {
    [ROLES.ADMIN]: {
      name: 'Administrador',
      description: 'Acceso completo al sistema excepto funciones de recepción',
      color: 'blue',
      icon: 'Shield',
      restrictions: [
        'Sin acceso a la sección de Recepción',
        'Acceso limitado a Reservas (solo próximos 7 días)',
        'Solo lectura en algunas secciones'
      ]
    },
    [ROLES.RECEPTION]: {
      name: 'Personal de Recepción',
      description: 'Acceso completo a funciones operativas del hotel',
      color: 'green',
      icon: 'UserCheck',
      restrictions: [
        'Sin acceso a Configuración del sistema',
        'Solo lectura en Reportes e Insumos'
      ]
    }
  };

  return roleInfo[role] || {
    name: 'Usuario',
    description: 'Usuario básico',
    color: 'gray',
    icon: 'User',
    restrictions: []
  };
};

/**
 * Verifica si una ruta está permitida para un rol
 * @param {string} route - La ruta a verificar
 * @param {string} role - El rol del usuario
 * @returns {boolean}
 */
export const isRouteAllowedForRole = (route, role) => {
  // Encontrar el permiso correspondiente a la ruta
  const permission = Object.keys(PERMISSION_ROUTE_MAP).find(
    perm => PERMISSION_ROUTE_MAP[perm] === route
  );
  
  if (!permission) return true; // Si no está mapeada, permitir acceso
  
  return hasRolePermission(role, permission, 'read');
};

/**
 * Obtiene las limitaciones específicas para un rol en una sección
 * @param {string} role - El rol del usuario
 * @param {string} permission - El permiso/sección
 * @returns {object} Limitaciones del rol
 */
export const getRoleLimitations = (role, permission) => {
  const limitations = {
    [ROLES.ADMIN]: {
      [PERMISSIONS.RESERVATIONS]: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        viewRestriction: 'next_7_days',
        message: 'Vista limitada: solo reservas de los próximos 7 días'
      },
      [PERMISSIONS.RECEPTION]: {
        canAccess: false,
        message: 'Sección exclusiva para personal de recepción'
      }
    },
    [ROLES.RECEPTION]: {
      [PERMISSIONS.SUPPLIES]: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        message: 'Solo lectura: contacta al administrador para cambios'
      },
      [PERMISSIONS.REPORTS]: {
        canCreate: false,
        canEdit: false,
        canExport: false,
        message: 'Solo lectura: sin permisos de exportación avanzada'
      },
      [PERMISSIONS.SETTINGS]: {
        canAccess: false,
        message: 'Configuración reservada para administradores'
      }
    }
  };

  return limitations[role]?.[permission] || {};
};

/**
 * Datos mock de usuarios para desarrollo
 */
export const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@hotelparaiso.com',
    password: 'admin123',
    name: 'Administrador del Sistema',
    role: ROLES.ADMIN,
    avatar: null,
    lastLogin: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS[ROLES.ADMIN]
  },
  {
    id: 2,
    email: 'recepcion@hotelparaiso.com',
    password: 'recepcion123',
    name: 'Personal de Recepción',
    role: ROLES.RECEPTION,
    avatar: null,
    lastLogin: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS[ROLES.RECEPTION]
  }
];

/**
 * Simula autenticación de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<object>} Resultado de la autenticación
 */
export const authenticateUser = async (email, password) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));

  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Credenciales incorrectas');
  }

  // Remover contraseña del objeto de usuario
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    permissions: user.permissions,
    token: `mock_token_${user.id}_${Date.now()}` // Token mock para desarrollo
  };
};