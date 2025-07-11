import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PieChart as PieChartIcon, Download } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

const RevenueReport = ({ dateRange = {}, selectedPeriod = 'thisMonth' }) => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    mainSource: '',
    mainSourcePercentage: 0,
    categories: [],
    growth: 0
  });

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange?.startDate, dateRange?.endDate, selectedPeriod]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setRevenueData({
        totalRevenue: 245000.00,
        mainSource: 'Habitaciones',
        mainSourcePercentage: 75.5,
        categories: [
          { name: 'Habitaciones', amount: 185000.00, percentage: 75.5, color: '#1e40af' },
          { name: 'Restaurante', amount: 32000.00, percentage: 13.1, color: '#7c3aed' },
          { name: 'Spa', amount: 17850.00, percentage: 7.3, color: '#059669' },
          { name: 'Servicios Adicionales', amount: 10150.00, percentage: 4.1, color: '#dc2626' }
        ],
        growth: 8.5
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    console.log('Exportando reporte de ingresos...');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg h-96">
            <div className="h-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reporte de Ingresos</h2>
            <p className="text-gray-600">Análisis detallado de ingresos por categoría</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl lg:text-2xl font-bold text-green-600">{formatCurrency(revenueData.totalRevenue)}</p>
          </div>
          <Button
            variant="primary"
            icon={Download}
            onClick={exportReport}
            className="flex-shrink-0"
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-green-800 font-medium mb-1">Ingresos Totales</p>
              <p className="text-xl font-bold text-green-900 truncate">{formatCurrency(revenueData.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">Principal Fuente</p>
              <p className="text-lg font-bold text-blue-900 truncate">{revenueData.mainSource}</p>
              <p className="text-xs text-blue-700">{revenueData.mainSourcePercentage}% del total</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <PieChartIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-purple-800 font-medium mb-1">Diversificación</p>
              <p className="text-xl font-bold text-purple-900">{revenueData.categories.length}</p>
              <p className="text-xs text-purple-700">categorías activas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de ingresos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Distribución de Ingresos</h3>
          <p className="text-sm text-gray-600">
            Período: {dateRange?.startDate?.toLocaleDateString('es-PE') || 'No definido'} - {dateRange?.endDate?.toLocaleDateString('es-PE') || 'No definido'}
          </p>
        </div>

        {/* Lista de categorías con barras de progreso */}
        <div className="space-y-4">
          {revenueData.categories.map((category, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-semibold text-gray-900">{category.name}</span>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(category.amount)}</p>
                  <p className="text-sm text-gray-600">{category.percentage}% del total</p>
                </div>
              </div>
              
              {/* Barra de progreso mejorada */}
              <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div 
                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparación por categorías - Gráfico de barras horizontal */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparación por Categorías</h3>
        <div className="space-y-6">
          {revenueData.categories.map((category, index) => {
            const maxAmount = Math.max(...revenueData.categories.map(c => c.amount));
            const widthPercentage = (category.amount / maxAmount) * 100;
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-base font-medium text-gray-700">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(category.amount)}</p>
                    <p className="text-sm text-gray-600">{category.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className="h-6 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${widthPercentage}%`,
                      backgroundColor: category.color 
                    }}
                  >
                    {widthPercentage > 25 && `${category.percentage}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Análisis de rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Análisis de Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Ingresos por habitación</span>
                <p className="text-xs text-gray-500 mt-1">Promedio por habitación disponible</p>
              </div>
              <span className="text-xl font-semibold text-green-600">
                {formatCurrency(3700.00)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Crecimiento vs mes anterior</span>
                <p className="text-xs text-gray-500 mt-1">Tendencia positiva</p>
              </div>
              <span className="text-xl font-semibold text-blue-600">+{revenueData.growth}%</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Ingresos no-habitaciones</span>
                <p className="text-xs text-gray-500 mt-1">Diversificación de ingresos</p>
              </div>
              <span className="text-xl font-semibold text-purple-600">24.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Oportunidades de Mejora</h3>
          <div className="space-y-4">
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">Servicios Adicionales</p>
                  <p className="text-xs text-yellow-700">
                    Solo representa 4.1% de ingresos. Potencial de crecimiento.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Spa</p>
                  <p className="text-xs text-blue-700">
                    Buen rendimiento (7.3%). Considerar expansión de servicios.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">Habitaciones</p>
                  <p className="text-xs text-green-700">
                    Fuente principal sólida (75.5%). Mantener calidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas financieras adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">ADR (Tarifa Promedio)</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(285.50)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">RevPAR</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(233.20)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Margen de Ganancia</p>
              <p className="text-xl font-bold text-gray-900">27.3%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <PieChartIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos por Día</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(8166.67)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proyecciones y metas */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Proyecciones y Metas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white p-6">
            <p className="text-green-100 text-sm mb-2">Proyección Mes Siguiente</p>
            <p className="text-2xl font-bold mb-1">{formatCurrency(revenueData.totalRevenue * 1.05)}</p>
            <p className="text-green-100 text-xs">+5% estimado</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white p-6">
            <p className="text-blue-100 text-sm mb-2">Meta Trimestral</p>
            <p className="text-2xl font-bold mb-1">{formatCurrency(revenueData.totalRevenue * 3.2)}</p>
            <p className="text-blue-100 text-xs">+6.7% vs actual</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white p-6">
            <p className="text-purple-100 text-sm mb-2">Potencial Anual</p>
            <p className="text-2xl font-bold mb-1">{formatCurrency(revenueData.totalRevenue * 12.8)}</p>
            <p className="text-purple-100 text-xs">Con optimizaciones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;