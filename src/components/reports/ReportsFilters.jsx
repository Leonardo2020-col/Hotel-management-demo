import React from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import Button from '../common/Button';

const ReportsFilters = ({ 
  selectedPeriod, 
  onPeriodChange, 
  dateRange, 
  onDateRangeChange, 
  loading 
}) => {
  const predefinedPeriods = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'thisWeek', label: 'Esta Semana' },
    { value: 'lastWeek', label: 'Semana Pasada' },
    { value: 'thisMonth', label: 'Este Mes' },
    { value: 'lastMonth', label: 'Mes Pasado' },
    { value: 'thisQuarter', label: 'Este Trimestre' },
    { value: 'thisYear', label: 'Este Año' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const handlePeriodChange = (period) => {
    onPeriodChange(period);
    
    // Auto-calcular fechas para períodos predefinidos
    const now = new Date();
    let newDateRange = { ...dateRange };
    
    switch (period) {
      case 'today':
        newDateRange = {
          startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        };
        break;
      case 'yesterday':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        newDateRange = {
          startDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
          endDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
        };
        break;
      case 'thisWeek':
        const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
        newDateRange = {
          startDate: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate()),
          endDate: now
        };
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(now.getTime() - ((now.getDay() + 7) * 24 * 60 * 60 * 1000));
        const lastWeekEnd = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
        newDateRange = {
          startDate: new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate()),
          endDate: new Date(lastWeekEnd.getFullYear(), lastWeekEnd.getMonth(), lastWeekEnd.getDate(), 23, 59, 59)
        };
        break;
      case 'thisMonth':
        newDateRange = {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: now
        };
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        newDateRange = {
          startDate: lastMonth,
          endDate: lastMonthEnd
        };
        break;
      case 'thisQuarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        newDateRange = {
          startDate: quarterStart,
          endDate: now
        };
        break;
      case 'thisYear':
        newDateRange = {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: now
        };
        break;
      default:
        // Para 'custom', mantener las fechas actuales
        break;
    }
    
    if (period !== 'custom') {
      onDateRangeChange(newDateRange);
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (field, value) => {
    const newDate = new Date(value);
    onDateRangeChange({
      ...dateRange,
      [field]: newDate
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Período</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => window.location.reload()}
        >
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Período Predefinido */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {predefinedPeriods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha de Inicio - Solo visible si es personalizado */}
        <div className={selectedPeriod === 'custom' ? 'block' : 'hidden md:block'}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Inicio
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={formatDateForInput(dateRange.startDate)}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              disabled={selectedPeriod !== 'custom'}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Fecha de Fin - Solo visible si es personalizado */}
        <div className={selectedPeriod === 'custom' ? 'block' : 'hidden md:block'}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Fin
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={formatDateForInput(dateRange.endDate)}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              disabled={selectedPeriod !== 'custom'}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Información del período seleccionado */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-blue-900 font-medium">
              Período seleccionado:
            </span>
          </div>
          <span className="text-blue-800">
            {dateRange.startDate?.toLocaleDateString('es-PE')} - {dateRange.endDate?.toLocaleDateString('es-PE')}
          </span>
        </div>
        <div className="mt-1 text-xs text-blue-700">
          {Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24))} día(s) de datos
        </div>
      </div>

      {/* Filtros rápidos adicionales */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-2">Filtros rápidos:</span>
          <button
            onClick={() => handlePeriodChange('today')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => handlePeriodChange('thisWeek')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            Esta Semana
          </button>
          <button
            onClick={() => handlePeriodChange('thisMonth')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            Este Mes
          </button>
          <button
            onClick={() => handlePeriodChange('thisYear')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            Este Año
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;