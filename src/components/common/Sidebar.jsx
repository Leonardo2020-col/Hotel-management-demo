// src/components/common/Sidebar.jsx - ACTUALIZADO
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Bed, 
  Package,
  BarChart3, 
  Settings,
  Hotel,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, onToggle, isMobile }) => {
  const location = useLocation();
  const { hasPermission, user } = useAuth();

  const menuItems = [
    { 
      path: '/checkin',
      icon: UserCheck, 
      label: 'Check In',
      description: 'Panel de recepción',
      permission: 'checkin'
    },
    { 
      path: '/dashboard', 
      icon: Home, 
      label: 'Dashboard',
      description: 'Vista general',
      permission: 'dashboard'
    },
    { 
      path: '/reservations', 
      icon: Calendar, 
      label: 'Reservas',
      description: 'Gestión de reservas',
      permission: 'reservations'
    },
    { 
      path: '/guests', 
      icon: Users, 
      label: 'Huéspedes',
      description: 'Base de datos',
      permission: 'guests'
    },
    { 
      path: '/rooms', 
      icon: Bed, 
      label: 'Habitaciones',
      description: 'Gestión de inventario',
      permission: 'rooms'
    },
    { 
      path: '/supplies', 
      icon: Package, 
      label: 'Insumos',
      description: 'Inventario y consumo',
      permission: 'supplies'
    },
    { 
      path: '/reports', 
      icon: BarChart3, 
      label: 'Informes',
      description: 'Análisis y reportes',
      permission: 'reports'
    }
  ];

  const secondaryItems = [
    { 
      path: '/settings', 
      icon: Settings, 
      label: 'Configuración',
      description: 'Ajustes del sistema',
      permission: 'settings'
    }
  ];

  const MenuItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    const hasAccess = hasPermission(item.permission);
    
    // Si no tiene acceso, mostrar como deshabilitado
    if (!hasAccess) {
      return (
        <div className={`
          flex items-center px-3 sm:px-4 py-2 sm:py-3 mx-2 rounded-lg transition-all duration-200
          text-gray-400 cursor-not-allowed opacity-50
          ${!open && !isMobile ? 'justify-center' : ''}
        `}>
          <Icon size={isMobile ? 22 : 20} className="flex-shrink-0" />
          {(open || isMobile) && (
            <div className="ml-3 flex-1 flex items-center justify-between">
              <div>
                <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                  {item.label}
                </span>
                {!isMobile && (
                  <p className="text-xs opacity-75 mt-0.5">Sin acceso</p>
                )}
              </div>
              <Lock size={12} className="text-gray-400" />
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={item.path}
        className={`
          flex items-center px-3 sm:px-4 py-2 sm:py-3 mx-2 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }
          ${!open && !isMobile ? 'justify-center' : ''}
        `}
        onClick={() => {
          // Cerrar sidebar en móvil al hacer clic en un enlace
          if (isMobile) {
            onToggle();
          }
        }}
      >
        <Icon size={isMobile ? 22 : 20} className="flex-shrink-0" />
        {(open || isMobile) && (
          <div className="ml-3 flex-1">
            <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
              {item.label}
            </span>
            {!isActive && !isMobile && (
              <p className="text-xs opacity-75 mt-0.5">{item.description}</p>
            )}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        bg-gray-900 shadow-xl transition-all duration-300 flex flex-col
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 w-64 transform ${open ? 'translate-x-0' : '-translate-x-full'}`
          : `${open ? 'w-64' : 'w-16'} relative`
        }
      `}>
        {/* Header */}
        <div className={`p-3 sm:p-4 border-b border-gray-700 ${isMobile ? 'pt-2' : ''}`}>
          <div className="flex items-center justify-between">
            {(open || isMobile) && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Hotel className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'} text-white`} />
                </div>
                <div>
                  <h1 className={`text-white font-bold ${isMobile ? 'text-xl' : 'text-lg'}`}>
                    Hotel Paraíso
                  </h1>
                  <p className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    Sistema de Gestión
                  </p>
                </div>
              </div>
            )}
            {!open && !isMobile && (
              <div className="p-2 bg-blue-600 rounded-lg mx-auto">
                <Hotel className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {(open || isMobile) && user && (
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-gray-400 text-xs capitalize">{user.role === 'admin' ? 'Administrador' : 'Recepción'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-2 sm:py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </div>

          {/* Divider */}
          <div className="mx-4 my-4 border-t border-gray-700"></div>

          {/* Secondary Items */}
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </div>
        </nav>

        {/* Toggle Button - Solo en desktop */}
        {!isMobile && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {open ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;