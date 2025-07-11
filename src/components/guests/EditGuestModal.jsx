// EditGuestModal.jsx
import React from 'react';
import { X, User, Save } from 'lucide-react';
import Button from '../common/Button';

const EditGuestModal = ({ isOpen, onClose, onSubmit, guest }) => {
  if (!isOpen || !guest) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Por ahora solo cerrar el modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Huésped</h2>
            <p className="text-gray-600 mt-1">Modificar información de {guest.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Funcionalidad en Desarrollo
            </h3>
            <p className="text-gray-600">
              El formulario de edición será implementado próximamente
            </p>
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

export default EditGuestModal;