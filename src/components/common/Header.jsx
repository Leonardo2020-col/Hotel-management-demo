// src/components/common/Header.jsx - ACTUALIZADO
import React from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  User,
  LogOut,
  Settings,
  ChevronDown,
  Shield,
  UserCheck
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick, sidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout, hasRole } = useAuth();

  const notifications = [
    { id: 1, message: 'Nueva reserva de Juan Pérez', time: '5 min', type: 'info' },
    { id: 2, message: 'Check-out habitación 203', time: '15 min', type: 'success' },
    { id: 3, message: 'Mantenimiento habitación 105', time: '1 hora', type: 'warning' }
  ];

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  const getRoleIcon = () => {
    if (hasRole('admin')) {
      return <Shield size={16} className="text-blue-600" />;
    }
    return <UserCheck size={16} className="text-green-600" />;
  };

  const getRoleLabel = () => {
    if (hasRole('admin')) return 'Administrador';
    if (hasRole('reception')) return 'Recepción';
    return 'Usuario';
  };

  const getRoleColor = () => {
    if (hasRole('admin')) return 'text-blue-600';
    if (hasRole('reception')) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar reservas, huéspedes..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Stats - Solo para recepción */}
          {hasRole('reception') && (
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Ocupación</p>
                <p className="font-semibold text-green-600">78%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Check-ins Hoy</p>
                <p className="font-semibold text-blue-600">12</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Ingresos Hoy</p>
                <p className="font-semibold text-purple-600">S/ 2,850</p>
              </div>
            </div>
          )}

          {/* Role Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
            {getRoleIcon()}
            <span className={`text-sm font-medium ${getRoleColor()}`}>
              {getRoleLabel()}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon()}
                      <span className={`text-sm font-medium ${getRoleColor()}`}>
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button 
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} className="mr-3" />
                    Perfil
                  </button>
                  
                  <button 
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} className="mr-3" />
                    Configuración
                  </button>
                  
                  <hr className="my-2" />
                  
                  <button 
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;