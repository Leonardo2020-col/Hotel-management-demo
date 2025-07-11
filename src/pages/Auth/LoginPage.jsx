// src/pages/Auth/LoginPage.jsx - SIN SECCIÓN RECEPCIÓN
import React, { useState } from 'react';
import { 
  Hotel, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  LogIn,
  User,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      console.log('Login exitoso');
    }
  };

  const handleDemoLogin = (userType) => {
    if (userType === 'admin') {
      setFormData({
        email: 'admin@hotelparaiso.com',
        password: 'admin123'
      });
    } else if (userType === 'reception') {
      setFormData({
        email: 'recepcion@hotelparaiso.com',
        password: 'recepcion123'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Hotel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hotel Paraíso</h1>
          <p className="text-gray-600">Sistema de Gestión Hotelera</p>
        </div>

        {/* Demo Users Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="p-4 border-2 border-gray-200 rounded-xl transition-all duration-200 text-left hover:shadow-md hover:border-gray-300"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Administrador</h3>
                <p className="text-xs text-gray-600">Sin acceso a reservas</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('reception')}
            className="p-4 border-2 border-gray-200 rounded-xl transition-all duration-200 text-left hover:shadow-md hover:border-gray-300"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recepción</h3>
                <p className="text-xs text-gray-600">Acceso a reservas</p>
              </div>
            </div>
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              loading={loading}
              icon={LogIn}
              disabled={!formData.email || !formData.password || loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Credenciales de Demo:</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">Administrador:</span>
                <span>admin@hotelparaiso.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Recepción:</span>
                <span>recepcion@hotelparaiso.com / recepcion123</span>
              </div>
            </div>
          </div>

          {/* Role Descriptions */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Diferencias de Roles:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Administrador:</strong> Sin acceso a Reservas, gestión del sistema</li>
              <li>• <strong>Recepción:</strong> Acceso completo a Reservas y operaciones</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Demo del Sistema de Gestión Hotelera
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;