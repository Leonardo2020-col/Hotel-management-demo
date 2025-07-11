import React, { useState, useEffect } from 'react';
import { Package, TrendingDown, AlertTriangle, ShoppingCart, DollarSign, Download } from 'lucide-react';
import Button from '../common/Button';

const SuppliesReport = ({ dateRange = {}, selectedPeriod = 'thisMonth' }) => {
  const [loading, setLoading] = useState(true);
  const [suppliesData, setSuppliesData] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    monthlyConsumption: 0,
    categories: [],
    lowStockAlerts: [],
    topConsumed: [],
    monthlyTrend: []
  });

  useEffect(() => {
    fetchSuppliesData();
  }, [dateRange?.startDate, dateRange?.endDate, selectedPeriod]);

  const fetchSuppliesData = async () => {
    setLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Datos simulados
      setSuppliesData({
        totalItems: 1247,
        lowStockItems: 23,
        totalValue: 45678.90,
        monthlyConsumption: 12450.30,
        categories: [
          { name: 'Amenities', items: 245, value: 8900, percentage: 19.5, lowStock: 8 },
          { name: 'Limpieza', items: 189, value: 15600, percentage: 34.1, lowStock: 7 },
          { name: 'Cocina', items: 156, value: 12300, percentage: 26.9, lowStock: 4 },
          { name: 'Mantenimiento', items: 98, value: 6800, percentage: 14.9, lowStock: 3 },
          { name: 'Oficina', items: 67, value: 2078, percentage: 4.6, lowStock: 1 }
        ],
        lowStockAlerts: [
          { item: 'Toallas de baño', category: 'Amenities', current: 15, minimum: 50, status: 'Crítico' },
          { item: 'Detergente industrial', category: 'Limpieza', current: 8, minimum: 25, status: 'Crítico' },
          { item: 'Papel higiénico', category: 'Amenities', current: 45, minimum: 100, status: 'Bajo' },
          { item: 'Desinfectante', category: 'Limpieza', current: 12, minimum: 30, status: 'Crítico' },
          { item: 'Aceite de cocina', category: 'Cocina', current: 18, minimum: 40, status: 'Bajo' }
        ],
        topConsumed: [
          { item: 'Papel higiénico', category: 'Amenities', consumed: 350, cost: 1400 },
          { item: 'Toallas', category: 'Amenities', consumed: 280, cost: 2240 },
          { item: 'Detergente', category: 'Limpieza', consumed: 120, cost: 960 },
          { item: 'Jabón líquido', category: 'Amenities', consumed: 145, cost: 580 },
          { item: 'Desinfectante', category: 'Limpieza', consumed: 89, cost: 712 }
        ],
        monthlyTrend: [
          { month: 'Ene', consumption: 11200, cost: 8900 },
          { month: 'Feb', consumption: 10800, cost: 8650 },
          { month: 'Mar', consumption: 12100, cost: 9400 },
          { month: 'Abr', consumption: 11900, cost: 9200 },
          { month: 'May', consumption: 12800, cost: 9800 },
          { month: 'Jun', consumption: 12450, cost: 9650 }
        ]
      });
    } catch (error) {
      console.error('Error fetching supplies data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Lógica para exportar reporte
    console.log('Exportando reporte de suministros...');
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'Crítico': return 'bg-red-100 text-red-800 border-red-200';
      case 'Bajo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockIcon = (status) => {
    switch (status) {
      case 'Crítico': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Bajo': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Package className="w-4 h-4 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg h-64">
                <div className="h-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reporte de Suministros</h2>
            <p className="text-gray-600">
              Período: {dateRange?.startDate?.toLocaleDateString('es-PE') || 'No definido'} - {dateRange?.endDate?.toLocaleDateString('es-PE') || 'No definido'}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={Download}
          onClick={exportReport}
        >
          Exportar
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{suppliesData.totalItems.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-3xl font-bold text-red-600">{suppliesData.lowStockItems}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600">Requieren atención inmediata</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total Inventario</p>
              <p className="text-3xl font-bold text-gray-900">S/ {suppliesData.totalValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consumo Mensual</p>
              <p className="text-3xl font-bold text-gray-900">S/ {suppliesData.monthlyConsumption.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">-3.2% vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Alertas de stock bajo */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Alertas de Stock Bajo</h3>
          </div>
          <Button variant="outline" size="sm" icon={ShoppingCart}>
            Generar Orden de Compra
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliesData.lowStockAlerts.map((alert, index) => (
            <div key={index} className={`border-2 rounded-lg p-4 ${getStockStatusColor(alert.status)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{alert.item}</h4>
                  <p className="text-sm text-gray-600">{alert.category}</p>
                </div>
                {getStockIcon(alert.status)}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Stock actual:</span>
                  <span className="font-medium">{alert.current}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Stock mínimo:</span>
                  <span className="font-medium">{alert.minimum}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${alert.status === 'Crítico' ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ width: `${(alert.current / alert.minimum) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categorías de suministros */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventario por Categoría</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % del Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Bajo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliesData.categories.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    S/ {category.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span>{category.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.lowStock > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {category.lowStock} items
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top items consumidos y tendencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top items más consumidos */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Items Más Consumidos</h3>
          </div>
          <div className="space-y-3">
            {suppliesData.topConsumed.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.item}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{item.consumed}</p>
                  <p className="text-sm text-gray-600">S/ {item.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendencia mensual */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tendencia de Consumo</h3>
          </div>
          <div className="space-y-3">
            {suppliesData.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(month.cost / Math.max(...suppliesData.monthlyTrend.map(m => m.cost))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 w-16 text-right">
                    S/ {(month.cost / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliesReport;