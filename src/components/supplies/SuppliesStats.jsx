import React from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const SuppliesStats = ({ stats, loading }) => {
  const safeStats = stats || {
    totalSupplies: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    monthlyConsumption: 0,
    categoriesCount: 0,
    suppliersCount: 0,
    recentConsumptions: 0
  };

  const mainStats = [
    {
      title: 'Total Insumos',
      value: safeStats.totalSupplies,
      icon: Package,
      color: 'blue',
      description: 'Items en inventario'
    },
    {
      title: 'Stock Bajo',
      value: safeStats.lowStockItems,
      icon: AlertTriangle,
      color: 'yellow',
      description: 'Requieren reposición'
    },
    {
      title: 'Sin Stock',
      value: safeStats.outOfStockItems,
      icon: AlertTriangle,
      color: 'red',
      description: 'Items agotados'
    },
    {
      title: 'Valor Total',
      value: formatCurrency(safeStats.totalValue),
      icon: DollarSign,
      color: 'green',
      description: 'Valor del inventario'
    },
    {
      title: 'Consumo Mensual',
      value: formatCurrency(safeStats.monthlyConsumption),
      icon: TrendingDown,
      color: 'purple',
      description: 'Gasto del mes'
    },
    {
      title: 'Categorías',
      value: safeStats.categoriesCount,
      icon: Package,
      color: 'indigo',
      description: 'Tipos de insumos'
    },
    {
      title: 'Proveedores',
      value: safeStats.suppliersCount,
      icon: TrendingUp,
      color: 'gray',
      description: 'Proveedores activos'
    },
    {
      title: 'Movimientos Hoy',
      value: safeStats.recentConsumptions,
      icon: Calendar,
      color: 'orange',
      description: 'Consumos registrados'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      orange: 'text-orange-600 bg-orange-50',
      red: 'text-red-600 bg-red-50',
      indigo: 'text-indigo-600 bg-indigo-50',
      gray: 'text-gray-600 bg-gray-50'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-16 sm:w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${colorClasses}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas importantes */}
      {(safeStats.lowStockItems > 0 || safeStats.outOfStockItems > 0) && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
            Alertas de Inventario
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeStats.lowStockItems > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="font-semibold text-yellow-800">Stock Bajo</p>
                    <p className="text-sm text-yellow-700">
                      {safeStats.lowStockItems} insumo{safeStats.lowStockItems > 1 ? 's' : ''} necesita{safeStats.lowStockItems > 1 ? 'n' : ''} reposición
                    </p>
                  </div>
                </div>
              </div>
            )}
            {safeStats.outOfStockItems > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="font-semibold text-red-800">Sin Stock</p>
                    <p className="text-sm text-red-700">
                      {safeStats.outOfStockItems} insumo{safeStats.outOfStockItems > 1 ? 's' : ''} agotado{safeStats.outOfStockItems > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumen de costos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen Financiero</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-1">Valor Total Inventario</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(safeStats.totalValue)}
            </p>
            <p className="text-xs text-green-700 mt-1">Al costo actual</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-800 mb-1">Consumo Este Mes</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {formatCurrency(safeStats.monthlyConsumption)}
            </p>
            <p className="text-xs text-purple-700 mt-1">Gastos del período</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Promedio Diario</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {formatCurrency(safeStats.monthlyConsumption / 30)}
            </p>
            <p className="text-xs text-blue-700 mt-1">Consumo estimado</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!loading && safeStats.totalSupplies === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            No hay insumos registrados
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Comienza agregando tu primer insumo al inventario
          </p>
        </div>
      )}
    </div>
  );
};

export default SuppliesStats;