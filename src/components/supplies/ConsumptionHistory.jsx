import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  Search, 
  Calendar, 
  Package,
  Eye
} from 'lucide-react';
import { formatCurrency, getRelativeTime } from '../../utils/formatters';
import classNames from 'classnames';

const ConsumptionHistory = ({ history, supplies, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsumption, setSelectedConsumption] = useState(null);

  // Datos seguros por defecto
  const safeHistory = history || [];
  const safeSupplies = supplies || [];

  // Filtrar historial solo por búsqueda
  const filteredHistory = useMemo(() => {
    return safeHistory.filter(consumption => {
      // Filtro por término de búsqueda
      const matchesSearch = !searchTerm || 
        consumption.supplyName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [safeHistory, searchTerm]);

  // Calcular estadísticas básicas
  const periodStats = useMemo(() => {
    const totalConsumptions = filteredHistory.length;
    const totalValue = filteredHistory.reduce((sum, c) => 
      sum + (c.quantity * (c.unitPrice || 0)), 0);

    return {
      totalConsumptions,
      totalValue
    };
  }, [filteredHistory]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas básicas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Consumos</p>
              <p className="text-2xl font-bold text-gray-900">{periodStats.totalConsumptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(periodStats.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Lista de consumos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay consumos registrados
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'No se encontraron consumos con ese término'
                : 'Los consumos de insumos aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((consumption) => (
              <div 
                key={consumption.id} 
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedConsumption(consumption)}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <TrendingDown className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {consumption.supplyName}
                        </h4>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                          <Calendar size={14} />
                          <span>{getRelativeTime(consumption.timestamp)}</span>
                        </div>
                      </div>

                      {/* Quantity and Value */}
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-gray-900">
                          {consumption.quantity} {consumption.unit || 'unidades'}
                        </div>
                        {consumption.unitPrice && (
                          <div className="text-sm text-gray-600">
                            {formatCurrency(consumption.quantity * consumption.unitPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles simplificado */}
      {selectedConsumption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Consumo</h3>
              <button
                onClick={() => setSelectedConsumption(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insumo</label>
                <p className="text-sm text-gray-900">{selectedConsumption.supplyName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <p className="text-sm text-gray-900">
                  {selectedConsumption.quantity} {selectedConsumption.unit || 'unidades'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedConsumption.timestamp).toLocaleString('es-PE')}
                </p>
              </div>
              
              {selectedConsumption.unitPrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(selectedConsumption.quantity * selectedConsumption.unitPrice)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionHistory;