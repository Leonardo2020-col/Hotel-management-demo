// src/components/auth/BranchSelector.jsx
import React, { useState } from 'react';
import { Building2, MapPin, Users, Check, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

const BranchSelector = ({ onBranchSelect, loading }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Datos mock de sucursales
  const branches = [
    {
      id: 1,
      name: 'Hotel Paraíso - Centro',
      location: 'San Isidro, Lima',
      address: 'Av. Conquistadores 123, San Isidro',
      capacity: '120 habitaciones',
      status: 'active',
      description: 'Sucursal principal en el distrito financiero'
    },
    {
      id: 2,
      name: 'Hotel Paraíso - Miraflores',
      location: 'Miraflores, Lima',
      address: 'Av. Larco 456, Miraflores',
      capacity: '80 habitaciones',
      status: 'active',
      description: 'Vista al océano y zona turística'
    },
    {
      id: 3,
      name: 'Hotel Paraíso - Aeropuerto',
      location: 'Callao, Lima',
      address: 'Av. Faucett 789, Callao',
      capacity: '60 habitaciones',
      status: 'active',
      description: 'Conveniente para viajeros de negocios'
    },
    {
      id: 4,
      name: 'Hotel Paraíso - Barranco',
      location: 'Barranco, Lima',
      address: 'Jr. Unión 321, Barranco',
      capacity: '45 habitaciones',
      status: 'maintenance',
      description: 'Zona bohemia y cultural (en mantenimiento)'
    }
  ];

  const handleBranchClick = (branch) => {
    if (branch.status === 'active') {
      setSelectedBranch(branch);
    }
  };

  const handleContinue = () => {
    if (selectedBranch && onBranchSelect) {
      onBranchSelect(selectedBranch);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecciona tu Sucursal
          </h1>
          <p className="text-gray-600">
            Como administrador, necesitas seleccionar la sucursal que vas a gestionar
          </p>
        </div>

        {/* Sucursales Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {branches.map((branch) => {
            const isSelected = selectedBranch?.id === branch.id;
            const isDisabled = branch.status !== 'active';
            
            return (
              <div
                key={branch.id}
                onClick={() => handleBranchClick(branch)}
                className={`
                  relative bg-white rounded-2xl shadow-lg border-2 p-6 transition-all duration-200 cursor-pointer
                  ${isSelected 
                    ? 'border-blue-500 shadow-xl scale-105' 
                    : isDisabled 
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                  }
                `}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  {isSelected && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {isDisabled && (
                    <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Mantenimiento
                    </div>
                  )}
                </div>

                {/* Branch icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  isSelected 
                    ? 'bg-blue-100' 
                    : isDisabled 
                      ? 'bg-gray-100' 
                      : 'bg-gray-100'
                }`}>
                  <Building2 className={`w-6 h-6 ${
                    isSelected 
                      ? 'text-blue-600' 
                      : isDisabled 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                  }`} />
                </div>

                {/* Branch info */}
                <div className="mb-4">
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDisabled ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {branch.name}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    isDisabled ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {branch.description}
                  </p>
                </div>

                {/* Branch details */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{branch.capacity}</span>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <Check className="w-4 h-4 mr-2" />
                      Sucursal seleccionada
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/login'}
            disabled={loading}
          >
            Volver al Login
          </Button>
          
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedBranch || loading}
            loading={loading}
            icon={ArrowRight}
            className="px-8"
          >
            {loading ? 'Configurando acceso...' : 'Continuar al Dashboard'}
          </Button>
        </div>

        {/* Help text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Esta selección determina qué datos y configuraciones verás en el sistema.
            Puedes cambiar de sucursal más tarde desde el panel de administración.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BranchSelector;