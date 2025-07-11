import React, { useState } from 'react';
import { Plus, Edit, Trash2, Settings, Users, Maximize, DollarSign } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import classNames from 'classnames';

const RoomTypesManagement = ({ roomTypes, roomsByType, loading }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingType, setEditingType] = useState(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tipos de Habitación</h2>
          <p className="text-gray-600 mt-1">Gestiona los tipos de habitación y sus tarifas</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Nuevo Tipo
        </Button>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roomTypes.map((type) => {
          const typeStats = roomsByType[type.name] || { total: 0, available: 0, occupied: 0 };
          const occupancyRate = typeStats.total > 0 ? ((typeStats.occupied / typeStats.total) * 100).toFixed(1) : 0;

          return (
            <div
              key={type.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: type.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                    {!type.active && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Edit}
                      onClick={() => setEditingType(type)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {type.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <DollarSign size={16} className="text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(type.baseRate)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Tarifa base</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Users size={16} className="text-blue-600" />
                      <span className="text-lg font-bold text-blue-600">{type.capacity}</span>
                    </div>
                    <p className="text-xs text-gray-500">Capacidad</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Maximize size={16} className="text-purple-600" />
                      <span className="text-lg font-bold text-purple-600">{type.size}m²</span>
                    </div>
                    <p className="text-xs text-gray-500">Tamaño</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Settings size={16} className="text-orange-600" />
                      <span className="text-lg font-bold text-orange-600">{typeStats.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">Total habitaciones</p>
                  </div>
                </div>

                {/* Occupancy Stats */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Estado Actual</span>
                    <span className="text-sm font-bold text-blue-900">{occupancyRate}% ocupado</span>
                  </div>
                  
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${occupancyRate}%`,
                        backgroundColor: type.color 
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <span className="font-semibold text-green-600">{typeStats.available}</span>
                      <p className="text-blue-700">Disponibles</p>
                    </div>
                    <div className="text-center">
                      <span className="font-semibold text-blue-600">{typeStats.occupied}</span>
                      <p className="text-blue-700">Ocupadas</p>
                    </div>
                  </div>
                </div>

                {/* Bed Options */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Opciones de Cama:</p>
                  <div className="flex flex-wrap gap-2">
                    {type.bedOptions.map((option, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Características:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {type.features.slice(0, 6).map((feature, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded flex items-center"
                      >
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {feature}
                      </span>
                    ))}
                    {type.features.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded text-center col-span-2">
                        +{type.features.length - 6} características más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de Tipos de Habitación
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Disponibles</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Ocupadas</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Ocupación</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Tarifa Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roomTypes.map((type) => {
                const typeStats = roomsByType[type.name] || { total: 0, available: 0, occupied: 0 };
                const occupancyRate = typeStats.total > 0 ? ((typeStats.occupied / typeStats.total) * 100).toFixed(1) : 0;

                return (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        ></div>
                        <span className="font-medium text-gray-900">{type.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 font-medium">{typeStats.total}</td>
                    <td className="text-center py-3 px-4 text-green-600 font-medium">{typeStats.available}</td>
                    <td className="text-center py-3 px-4 text-blue-600 font-medium">{typeStats.occupied}</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${occupancyRate}%`,
                              backgroundColor: type.color 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{occupancyRate}%</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 font-bold text-green-600">
                      {formatCurrency(type.baseRate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoomTypesManagement;