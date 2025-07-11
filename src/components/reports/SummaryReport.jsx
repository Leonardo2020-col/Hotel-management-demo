import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Bed, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Package,
  Download
} from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

const SummaryReport = ({ dateRange = {}, selectedPeriod = 'thisMonth' }) => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    revenue: {
      total: 0,
      growth: 0,
      trend: 'up'
    },
    occupancy: {
      rate: 0,
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0
    },
    guests: {
      total: 0,
      new: 0,
      returning: 0,
      avgStay: 0
    },
    operations: {
      maintenanceIssues: 0,
      lowStockItems: 0,
      staffEfficiency: 0
    },
    financialMetrics: {
      adr: 0,
      revpar: 0,
      expenses: 0,
      profit: 0
    },
    alerts: []
  });

  useEffect(() => {
    fetchSummaryData();
  }, [dateRange?.startDate, dateRange?.endDate, selectedPeriod]);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSummaryData({
        revenue: {
          total: 245000.00,
          growth: 8.5,
          trend: 'up'
        },
        occupancy: {
          rate: 81.7,
          totalRooms: 120,
          occupiedRooms: 98,
          availableRooms: 22
        },
        guests: {
          total: 1247,
          new: 856,
          returning: 391,
          avgStay: 3.2
        },
        operations: {
          maintenanceIssues: 4,
          lowStockItems: 23,
          staffEfficiency: 94.2
        },
        financialMetrics: {
          adr: 285.50,
          revpar: 233.20,
          expenses: 178000.00,
          profit: 67000.00
        },
        alerts: [
          { type: 'warning', message: '23 items con stock bajo requieren atención', category: 'Suministros' },
          { type: 'info', message: '4 habitaciones en mantenimiento programado', category: 'Operaciones' },
          { type: 'success', message: 'Ocupación 8.5% por encima del objetivo mensual', category: 'Rendimiento' }
        ]
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    console.log('Exportando resumen general...');
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'info': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resumen General</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ingresos */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold">{formatCurrency(summaryData.revenue.total)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+{summaryData.revenue.growth}% vs anterior</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Ocupación */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Ocupación</p>
              <p className="text-2xl font-bold">{formatPercentage(summaryData.occupancy.rate)}</p>
              <p className="text-sm text-blue-100 mt-2">
                {summaryData.occupancy.occupiedRooms}/{summaryData.occupancy.totalRooms} habitaciones
              </p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Bed className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Huéspedes */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Huéspedes</p>
              <p className="text-2xl font-bold">{formatNumber(summaryData.guests.total)}</p>
              <p className="text-sm text-purple-100 mt-2">
                {formatNumber(summaryData.guests.new)} nuevos huéspedes
              </p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Rentabilidad */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Ganancia Neta</p>
              <p className="text-2xl font-bold">{formatCurrency(summaryData.financialMetrics.profit)}</p>
              <p className="text-sm text-orange-100 mt-2">
                {formatPercentage((summaryData.financialMetrics.profit / summaryData.revenue.total) * 100)} margen
              </p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas financieras detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">ADR (Tarifa Promedio)</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryData.financialMetrics.adr)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">RevPAR</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryData.financialMetrics.revpar)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estadía Promedio</p>
              <p className="text-xl font-bold text-gray-900">{summaryData.guests.avgStay} días</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Eficiencia Personal</p>
              <p className="text-xl font-bold text-gray-900">{formatPercentage(summaryData.operations.staffEfficiency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado operacional y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado operacional */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado Operacional</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bed className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Habitaciones Disponibles</p>
                  <p className="text-sm text-gray-600">Para check-in inmediato</p>
                </div>
              </div>
              <span className="text-xl font-bold text-blue-600">{summaryData.occupancy.availableRooms}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Issues de Mantenimiento</p>
                  <p className="text-sm text-gray-600">Requieren atención</p>
                </div>
              </div>
              <span className="text-xl font-bold text-orange-600">{summaryData.operations.maintenanceIssues}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Package className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Stock Bajo</p>
                  <p className="text-sm text-gray-600">Items críticos</p>
                </div>
              </div>
              <span className="text-xl font-bold text-red-600">{summaryData.operations.lowStockItems}</span>
            </div>
          </div>
        </div>

        {/* Alertas y notificaciones */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Importantes</h3>
          <div className="space-y-3">
            {summaryData.alerts.map((alert, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {alert.category}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" className="w-full">
              Ver Todas las Alertas
            </Button>
          </div>
        </div>
      </div>

      {/* Análisis comparativo */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Análisis Comparativo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-full h-full rounded-full bg-gray-200">
                <div 
                  className="w-full h-full rounded-full bg-green-500 flex items-center justify-center text-white font-bold"
                  style={{ 
                    background: `conic-gradient(#10b981 0deg ${summaryData.occupancy.rate * 3.6}deg, #e5e7eb ${summaryData.occupancy.rate * 3.6}deg 360deg)` 
                  }}
                >
                  {formatPercentage(summaryData.occupancy.rate)}
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Ocupación Actual</p>
            <p className="text-xs text-gray-600">vs 75% objetivo</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-full h-full rounded-full bg-gray-200">
                <div 
                  className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold"
                  style={{ 
                    background: `conic-gradient(#3b82f6 0deg ${(summaryData.guests.new / summaryData.guests.total) * 360}deg, #e5e7eb ${(summaryData.guests.new / summaryData.guests.total) * 360}deg 360deg)` 
                  }}
                >
                  {formatPercentage((summaryData.guests.new / summaryData.guests.total) * 100)}
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Huéspedes Nuevos</p>
            <p className="text-xs text-gray-600">del total de huéspedes</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-full h-full rounded-full bg-gray-200">
                <div 
                  className="w-full h-full rounded-full bg-purple-500 flex items-center justify-center text-white font-bold"
                  style={{ 
                    background: `conic-gradient(#8b5cf6 0deg ${summaryData.operations.staffEfficiency * 3.6}deg, #e5e7eb ${summaryData.operations.staffEfficiency * 3.6}deg 360deg)` 
                  }}
                >
                  {formatPercentage(summaryData.operations.staffEfficiency)}
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Eficiencia Personal</p>
            <p className="text-xs text-gray-600">vs 90% objetivo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;