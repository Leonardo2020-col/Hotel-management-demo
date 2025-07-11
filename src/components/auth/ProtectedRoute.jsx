// src/components/auth/ProtectedRoute.jsx - ACTUALIZADO CON SUCURSALES
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, Shield, Lock, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const ProtectedRoute = ({ 
  children, 
  requirePermission = null,
  requireRole = null,
  fallbackPath = '/login' 
}) => {
  const { 
    isAuthenticated, 
    hasPermission, 
    hasRole, 
    user, 
    needsBranchSelection,
    isReady,
    loading 
  } = useAuth();
  const location = useLocation();

  // Mostrar loading si está verificando autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Si es administrador y necesita seleccionar sucursal, redirigir
  if (needsBranchSelection && user?.role === 'admin') {
    // Solo redirigir si no estamos ya en la página de selección
    if (location.pathname !== '/select-branch') {
      return <Navigate to="/select-branch" replace />;
    }
  }

  // Si no está listo (falta sucursal para admin), mostrar mensaje
  if (!isReady()) {
    return <BranchSelectionRequired />;
  }

  // Si requiere un permiso específico y no lo tiene
  if (requirePermission && !hasPermission(requirePermission, 'read')) {
    return <AccessDenied 
      reason="permission" 
      requiredPermission={requirePermission}
      userRole={user?.role}
    />;
  }

  // Si requiere un rol específico y no lo tiene
  if (requireRole && !hasRole(requireRole)) {
    return <AccessDenied 
      reason="role" 
      requiredRole={requireRole}
      userRole={user?.role}
    />;
  }

  // Si pasa todas las validaciones, mostrar el contenido
  return children;
};

// Componente para cuando se requiere selección de sucursal
const BranchSelectionRequired = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Selección de Sucursal Requerida
          </h1>

          <p className="text-gray-600 mb-6">
            Como administrador, necesitas seleccionar una sucursal para continuar.
          </p>

          <Button
            variant="primary"
            onClick={() => window.location.href = '/select-branch'}
            className="w-full"
          >
            Seleccionar Sucursal
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar acceso denegado
const AccessDenied = ({ reason, requiredPermission, requiredRole, userRole }) => {
  const getErrorMessage = () => {
    if (reason === 'permission') {
      return {
        title: 'Acceso Denegado',
        message: `No tienes permisos para acceder a la sección "${requiredPermission}".`,
        suggestion: userRole === 'admin' 
          ? 'Esta sección está reservada para el personal de recepción.'
          : 'Contacta con tu administrador para solicitar acceso.'
      };
    }
    
    if (reason === 'role') {
      return {
        title: 'Rol Insuficiente',
        message: `Se requiere el rol "${requiredRole}" para acceder a esta sección.`,
        suggestion: `Tu rol actual es "${userRole}".`
      };
    }

    return {
      title: 'Error de Acceso',
      message: 'No puedes acceder a esta sección.',
      suggestion: 'Contacta con el administrador del sistema.'
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            {reason === 'permission' ? (
              <Lock className="w-8 h-8 text-red-600" />
            ) : (
              <Shield className="w-8 h-8 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {errorInfo.title}
          </h1>

          <p className="text-gray-600 mb-2">
            {errorInfo.message}
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            {errorInfo.suggestion}
          </p>

          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Volver Atrás
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Ir al Dashboard
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-left bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Debug Info
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Rol actual: <code className="bg-gray-200 px-1 rounded">{userRole}</code></div>
                  {requiredPermission && (
                    <div>Permiso requerido: <code className="bg-gray-200 px-1 rounded">{requiredPermission}</code></div>
                  )}
                  {requiredRole && (
                    <div>Rol requerido: <code className="bg-gray-200 px-1 rounded">{requiredRole}</code></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;