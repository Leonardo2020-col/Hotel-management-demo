// src/components/auth/BranchSelector.jsx
import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Bed,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Button from '../common/Button';

const BranchSelector = ({ onBranchSelect, loading = false }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Datos mock de sucursales
  const branches = [
    {
      id: 1,
      name: 'Hotel Paraíso - Centro',
      location: 'San Isidro, Lima',
      rooms: 45,
      currentGuests: 32,
      occupancyRate: 71,
      status: 'active',
      image: '/api/placeholder/300/200',
      features: ['WiFi Gratuito', 'Restaurante', 'Spa', 'Piscina'],
      description: 'Nuestra sucursal principal en el corazón de San Isidro'
    },
    {
      id: 2,
      name: 'Hotel Paraíso - Miraflores',
      location: 'Miraflores, Lima',
      rooms: 60,
      currentGuests: 48,
      occupancyRate: 80,
      status: 'active',
      image: '/api/placeholder/300/200',
      features: ['Vista al Mar', 'Centro de Negocios', 'Gimnasio', 'Bar'],
      description: 'Ubicación privilegiada con vista al malecón de Miraflores'
    },
    {
      id: 3,
      name: 'Hotel Paraíso - Aeropuerto',
      location: 'Callao, Lima',
      rooms: 35,
      currentGuests: 28,
      occupancyRate: 80,
      status: 'active',
      image: '/api/placeholder/300/200',
      features: ['Shuttle Gratuito', 'Check-in 24h', 'Business Center'],
      description: 'Ideal para viajeros de negocios y conexiones'
    }
  ];

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };

  const handleContinue = () => {
    if (selectedBranch && onBranchSelect) {
      onBranchSelect(selectedBranch);
    }
  };

  const getOccupancyColor = (rate) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Sucursal</h1>
          <p className="text-gray-600">
            Elige la sucursal que deseas administrar
          </p>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-xl ${
                selectedBranch?.id === branch.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleBranchSelect(branch)}
            >
              {/* Selection Indicator */}
              {selectedBranch?.id === branch.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="p-6">
                {/* Branch Image Placeholder */}
                <div className="w-full h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-white" />
                </div>

                {/* Branch Info */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {branch.name}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{branch.location}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {branch.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bed className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-lg font-semibold text-gray-900">
                        {branch.rooms}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Habitaciones</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-lg font-semibold text-gray-900">
                        {branch.currentGuests}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Huéspedes</span>
                  </div>
                </div>

                {/* Occupancy Rate */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Ocupación</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getOccupancyColor(branch.occupancyRate)}`}>
                      {branch.occupancyRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${branch.occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Servicios:</span>
                  <div className="flex flex-wrap gap-1">
                    {branch.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {branch.features.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{branch.features.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedBranch || loading}
            loading={loading}
            icon={ArrowRight}
            className="px-8"
          >
            {loading ? 'Configurando...' : 'Continuar'}
          </Button>
        </div>

        {/* Selected Branch Summary */}
        {selectedBranch && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Sucursal Seleccionada:
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">{selectedBranch.name}</p>
                <p className="text-blue-600 text-sm">{selectedBranch.location}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-800 text-sm">
                  {selectedBranch.currentGuests}/{selectedBranch.rooms} ocupadas
                </p>
                <p className="text-blue-600 text-sm">
                  {selectedBranch.occupancyRate}% ocupación
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchSelector;