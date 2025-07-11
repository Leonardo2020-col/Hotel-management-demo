import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  PieChart,
  Filter,
  Search,
  Plus,
  Eye
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import Button from '../../components/common/Button';
import ReportsFilters from '../../components/reports/ReportsFilters';
import OccupancyReport from '../../components/reports/OccupancyReport';
import RevenueReport from '../../components/reports/RevenueReport';
import GuestsReport from '../../components/reports/GuestsReport';
import RoomsReport from '../../components/reports/RoomsReport';
import SuppliesReport from '../../components/reports/SuppliesReport';
import CustomReport from '../../components/reports/CustomReport';
import GeneralSummaryReport from '../../components/reports/GeneralSummaryReport'; // NUEVA IMPORTACIÓN
import { formatCurrency, formatDate } from '../../utils/formatters';

const Reports = () => {
  // Estados principales
  const [activeCategory, setActiveCategory] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [showCustomReport, setShowCustomReport] = useState(false);
  
  // Filtros de fecha
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  // Hook personalizado para datos de reportes
  const {
    overviewStats,
    occupancyData,
    revenueData,
    guestsData,
    roomsData,
    suppliesData,
    loading,
    error,
    generateReport,
    exportReport
  } = useReports(dateRange, selectedPeriod);

  // Configuración de categorías de reportes
  const reportCategories = [
    {
      id: 'overview',
      label: 'Resumen General',
      icon: BarChart3,
      color: 'blue',
      description: 'Vista general de métricas clave'
    },
    {
      id: 'occupancy',
      label: 'Ocupación',
      icon: Calendar,
      color: 'green',
      description: 'Análisis de ocupación y disponibilidad'
    },
    {
      id: 'revenue',
      label: 'Ingresos',
      icon: DollarSign,
      color: 'purple',
      description: 'Reportes financieros y de ingresos'
    },
    {
      id: 'guests',
      label: 'Huéspedes',
      icon: Users,
      color: 'orange',
      description: 'Análisis de huéspedes y satisfacción'
    },
    {
      id: 'rooms',
      label: 'Habitaciones',
      icon: BarChart3,
      color: 'indigo',
      description: 'Rendimiento y estado de habitaciones'
    },
    {
      id: 'supplies',
      label: 'Insumos',
      icon: PieChart,
      color: 'red',
      description: 'Inventario y consumo de insumos'
    }
  ];

  // Reportes predefinidos
  const predefinedReports = [
    {
      id: 'daily_summary',
      name: 'Resumen Diario',
      description: 'Métricas diarias de operación',
      category: 'overview',
      icon: Calendar
    },
    {
      id: 'weekly_performance',
      name: 'Rendimiento Semanal',
      description: 'Análisis semanal de KPIs',
      category: 'overview',
      icon: TrendingUp
    },
    {
      id: 'monthly_financial',
      name: 'Informe Financiero Mensual',
      description: 'Estado financiero detallado',
      category: 'revenue',
      icon: DollarSign
    },
    {
      id: 'guest_satisfaction',
      name: 'Satisfacción de Huéspedes',
      description: 'Análisis de reviews y feedback',
      category: 'guests',
      icon: Users
    },
    {
      id: 'room_efficiency',
      name: 'Eficiencia de Habitaciones',
      description: 'Utilización y rentabilidad por habitación',
      category: 'rooms',
      icon: BarChart3
    },
    {
      id: 'inventory_valuation',
      name: 'Valorización de Inventario',
      description: 'Estado y valor del inventario',
      category: 'supplies',
      icon: PieChart
    }
  ];

  const handleExportReport = async (reportType, format = 'pdf') => {
    try {
      await exportReport(reportType, format, dateRange);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colorMap[color] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar reportes</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informes</h1>
          <p className="text-gray-600 mt-1">
            Reportes y análisis del hotel
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <Button
            variant="outline"
            icon={Plus}
            onClick={() => setShowCustomReport(true)}
          >
            Reporte Personalizado
          </Button>
          <Button
            variant="primary"
            icon={Download}
            onClick={() => handleExportReport('overview', 'pdf')}
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      <ReportsFilters
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        loading={loading}
      />

      {/* Stats Cards del Período Seleccionado */}
      {overviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ocupación Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{overviewStats.avgOccupancy}%</p>
                <p className="text-xs text-gray-500 mt-1">En el período</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(overviewStats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">En el período</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Huéspedes</p>
                <p className="text-2xl font-bold text-purple-600">{overviewStats.totalGuests}</p>
                <p className="text-xs text-gray-500 mt-1">En el período</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tarifa Promedio</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(overviewStats.avgRate)}</p>
                <p className="text-xs text-gray-500 mt-1">Por noche</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categorías de Reportes */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías de Reportes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 border-2 rounded-xl transition-all duration-200 text-left hover:shadow-md ${
                  isActive 
                    ? `border-${category.color}-300 bg-${category.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${getColorClasses(category.color)}`}>
                    <Icon size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-900">{category.label}</h4>
                </div>
                <p className="text-sm text-gray-600">{category.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reportes Predefinidos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reportes Predefinidos</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar reportes..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedReports
            .filter(report => activeCategory === 'overview' || report.category === activeCategory)
            .map((report) => {
              const Icon = report.icon;
              
              return (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Período: {selectedPeriod === 'thisMonth' ? 'Este mes' : 
                               selectedPeriod === 'lastMonth' ? 'Mes pasado' : 
                               'Personalizado'}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                      >
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Download}
                        onClick={() => handleExportReport(report.id)}
                      >
                        Exportar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Contenido del Reporte Activo */}
      <div className="min-h-[400px]">
        {activeCategory === 'overview' && (
          // CAMBIÉ ESTA PARTE: Ahora usa GeneralSummaryReport completo
          <GeneralSummaryReport 
            dateRange={dateRange} 
            selectedPeriod={selectedPeriod} 
          />
        )}
        
        {activeCategory === 'occupancy' && (
          <OccupancyReport data={occupancyData} loading={loading} detailed />
        )}
        
        {activeCategory === 'revenue' && (
          <RevenueReport 
            dateRange={dateRange} 
            selectedPeriod={selectedPeriod} 
          />
        )}
        
        {activeCategory === 'guests' && (
          <GuestsReport 
            dateRange={dateRange} 
            selectedPeriod={selectedPeriod} 
          />
        )}
        
        {activeCategory === 'rooms' && (
          <RoomsReport 
            dateRange={dateRange} 
            selectedPeriod={selectedPeriod} 
          />
        )}
        
        {activeCategory === 'supplies' && (
          <SuppliesReport 
            dateRange={dateRange} 
            selectedPeriod={selectedPeriod} 
          />
        )}
      </div>

      {/* Modal de Reporte Personalizado */}
      {showCustomReport && (
        <CustomReport
          dateRange={dateRange}
          selectedPeriod={selectedPeriod}
          onClose={() => setShowCustomReport(false)}
        />
      )}
    </div>
  );
};

export default Reports;