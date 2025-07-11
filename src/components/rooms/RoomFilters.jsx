import React from 'react';
import { Search, Filter, X, Grid, List } from 'lucide-react';
import { ROOM_STATUS, CLEANING_STATUS } from '../../utils/roomMockData';
import Button from '../common/Button';

const RoomFilters = ({ 
  filters, 
  onFiltersChange, 
  roomTypes, 
  viewMode, 
  onViewModeChange, 
  loading 
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      type: 'all',
      floor: 'all',
      cleaningStatus: 'all',
      search: ''
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value !== '';
    return value !== 'all';
  });

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    ...Object.values(ROOM_STATUS).map(status => ({
      value: status,
      label: status
    }))
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    ...roomTypes.map(type => ({
      value: type.name,
      label: type.name
    }))
  ];

  const floorOptions = [
    { value: 'all', label: 'Todos los pisos' },
    { value: '1', label: 'Piso 1' },
    { value: '2', label: 'Piso 2' },
    { value: '3', label: 'Piso 3' },
    { value: '4', label: 'Piso 4' },
    { value: '5', label: 'Piso 5' }
  ];

  const cleaningStatusOptions = [
    { value: 'all', label: 'Todos los estados de limpieza' },
    ...Object.values(CLEANING_STATUS).map(status => ({
      value: status,
      label: status
    }))
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
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
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Activos
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={16} />
              <span>Limpiar filtros</span>
            </button>
          )}
          
          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                icon={Grid}
                onClick={() => onViewModeChange('grid')}
                className="px-3 py-1.5"
              >
                Cuadrícula
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                icon={List}
                onClick={() => onViewModeChange('list')}
                className="px-3 py-1.5"
              >
                Lista
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar habitaciones..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={filters.type || 'all'}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {typeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Floor Filter */}
        <select
          value={filters.floor || 'all'}
          onChange={(e) => handleFilterChange('floor', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {floorOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Cleaning Status Filter */}
        <select
          value={filters.cleaningStatus || 'all'}
          onChange={(e) => handleFilterChange('cleaningStatus', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {cleaningStatusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RoomFilters;