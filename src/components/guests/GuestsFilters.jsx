import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Star } from 'lucide-react';

const GuestsFilters = ({ filters, onFiltersChange, guests, loading }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      vipLevel: 'all',
      country: 'all',
      search: '',
      dateRange: 'all'
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    return value !== '' && value !== 'all';
  });

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'checked-out', label: 'Check-out realizado' },
    { value: 'blacklisted', label: 'Lista negra' }
  ];

  const vipOptions = [
    { value: 'all', label: 'Todos los niveles' },
    { value: 'none', label: 'Sin VIP' },
    { value: 'silver', label: 'VIP Silver' },
    { value: 'gold', label: 'VIP Gold' },
    { value: 'platinum', label: 'VIP Platinum' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Todas las fechas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'year', label: 'Este año' }
  ];

  // Obtener países únicos de los huéspedes
  const countries = [...new Set(guests.map(guest => guest.country))].sort();
  const countryOptions = [
    { value: 'all', label: 'Todos los países' },
    ...countries.map(country => ({ value: country, label: country }))
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
      {/* Header con botón para mostrar filtros en móvil */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Activos
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
              <span className="hidden sm:inline">Limpiar filtros</span>
            </button>
          )}
          
          {/* Botón toggle para móvil */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
          >
            <span>{showFilters ? 'Ocultar' : 'Mostrar'}</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Search bar - Siempre visible */}
      <div className="mb-4 lg:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar huéspedes..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Filtros - Colapsables en móvil */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Search - Desktop */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar huéspedes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* VIP Level Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">
              Nivel VIP
            </label>
            <select
              value={filters.vipLevel}
              onChange={(e) => handleFilterChange('vipLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {vipOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">
              País
            </label>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {countryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">
              Período
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de acción en móvil */}
        <div className="flex justify-between items-center mt-4 lg:hidden">
          <span className="text-sm text-gray-600">
            {hasActiveFilters ? 'Filtros aplicados' : 'Sin filtros'}
          </span>
          <div className="flex space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Resumen de filtros activos en móvil */}
      {hasActiveFilters && !showFilters && (
        <div className="mt-3 lg:hidden">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === 'all') return null;
              
              let displayValue = value;
              if (key === 'vipLevel' && value !== 'none') {
                displayValue = `VIP ${value.charAt(0).toUpperCase() + value.slice(1)}`;
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, key === 'search' ? '' : 'all')}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('vipLevel', 'gold')}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
        >
          <Star size={12} className="mr-1" />
          VIP Gold
        </button>
        <button
          onClick={() => handleFilterChange('status', 'active')}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
        >
          Activos
        </button>
        <button
          onClick={() => handleFilterChange('dateRange', 'month')}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
        >
          Este mes
        </button>
      </div>
    </div>
  );
};

export default GuestsFilters;