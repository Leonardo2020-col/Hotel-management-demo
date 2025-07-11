// GuestProfile.jsx
import React from 'react';
import { X, User, Phone, Mail } from 'lucide-react';
import Button from '../common/Button';

const GuestProfile = ({ isOpen, onClose, guest }) => {
  if (!isOpen || !guest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {guest.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{guest.fullName}</h2>
              <p className="text-gray-600 text-sm">Perfil del Huésped</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
          <div className="space-y-4">
            {/* Nombre Completo */}
            <div className="flex items-start space-x-3">
              <User size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Nombre Completo</p>
                <p className="text-gray-700">{guest.fullName}</p>
              </div>
            </div>

            {/* DNI */}
            <div className="flex items-start space-x-3">
              <User size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">DNI</p>
                <p className="text-gray-700">{guest.dni || guest.documentNumber}</p>
              </div>
            </div>

            {/* Teléfono (opcional) */}
            {guest.phone && (
              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Teléfono</p>
                  <p className="text-gray-700">{guest.phone}</p>
                </div>
              </div>
            )}

            {/* Correo (opcional) */}
            {guest.email && (
              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Correo Electrónico</p>
                  <p className="text-gray-700">{guest.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestProfile;