import React, { useState, useMemo } from 'react';
import { Package, Plus, Search, Filter, TrendingDown, AlertTriangle, FileText } from 'lucide-react';
import { useSupplies } from '../../hooks/useSupplies';
import Button from '../../components/common/Button';
import SuppliesStats from '../../components/supplies/SuppliesStats';
import SuppliesFilters from '../../components/supplies/SuppliesFilters';
import SuppliesGrid from '../../components/supplies/SuppliesGrid';
import SuppliesList from '../../components/supplies/SuppliesList';
import ConsumptionHistory from '../../components/supplies/ConsumptionHistory';
import CreateSupplyModal from '../../components/supplies/CreateSupplyModal';
import EditSupplyModal from '../../components/supplies/EditSupplyModal';
import ConsumptionModal from '../../components/supplies/ConsumptionModal';

const Supplies = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('inventory');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [selectedSupplies, setSelectedSupplies] = useState([]);
  
  // Filtros corregidos
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    supplier: 'all',
    search: '',
    lowStock: false
  });

  // Hook personalizado para datos de insumos
  const {
    supplies,
    categories,
    suppliers,
    suppliesStats,
    consumptionHistory,
    loading,
    error,
    createSupply,
    updateSupply,
    deleteSupply,
    recordConsumption,
    adjustStock
  } = useSupplies();

  // Configuración de tabs
  const tabs = [
    { 
      id: 'inventory', 
      label: 'Inventario', 
      shortLabel: 'Inventario',
      icon: Package 
    },
    { 
      id: 'consumption', 
      label: 'Historial de Consumo', 
      shortLabel: 'Consumo',
      icon: TrendingDown 
    }
  ];

  // Handlers
  const handleCreateSupply = async (supplyData) => {
    try {
      await createSupply(supplyData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating supply:', error);
    }
  };

  const handleEditSupply = async (supplyData) => {
    try {
      await updateSupply(selectedSupply.id, supplyData);
      setShowEditModal(false);
      setSelectedSupply(null);
    } catch (error) {
      console.error('Error updating supply:', error);
    }
  };

  const handleDeleteSupply = async (supplyId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este insumo?')) {
      try {
        await deleteSupply(supplyId);
        // Remover de selección si estaba seleccionado
        setSelectedSupplies(prev => prev.filter(id => id !== supplyId));
      } catch (error) {
        console.error('Error deleting supply:', error);
      }
    }
  };

  const handleRecordConsumption = async (consumptionData) => {
    try {
      await recordConsumption(consumptionData);
      setShowConsumptionModal(false);
      setSelectedSupply(null);
      setSelectedSupplies([]); // Limpiar selección después del consumo
    } catch (error) {
      console.error('Error recording consumption:', error);
    }
  };

  const handleAdjustStock = async (supplyId, adjustment) => {
    try {
      await adjustStock(supplyId, adjustment);
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const openEditModal = (supply) => {
    setSelectedSupply(supply);
    setShowEditModal(true);
  };

  const openConsumptionModal = (supply) => {
    setSelectedSupply(supply);
    setShowConsumptionModal(true);
  };

  // Función de filtrado mejorada
  const filteredSupplies = useMemo(() => {
    if (!supplies) return [];

    return supplies.filter(supply => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          supply.name.toLowerCase().includes(searchTerm) ||
          supply.description.toLowerCase().includes(searchTerm) ||
          supply.sku.toLowerCase().includes(searchTerm) ||
          supply.category.toLowerCase().includes(searchTerm) ||
          supply.supplier.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Filtro por categoría
      if (filters.category !== 'all' && supply.category !== filters.category) return false;
      
      // Filtro por proveedor
      if (filters.supplier !== 'all' && supply.supplier !== filters.supplier) return false;
      
      // Filtro por estado de stock
      if (filters.status !== 'all') {
        if (filters.status === 'ok' && (supply.currentStock === 0 || supply.currentStock <= supply.minStock)) return false;
        if (filters.status === 'low' && (supply.currentStock === 0 || supply.currentStock > supply.minStock)) return false;
        if (filters.status === 'out' && supply.currentStock !== 0) return false;
      }
      
      // Filtro solo stock bajo
      if (filters.lowStock && supply.currentStock > supply.minStock) return false;
      
      return true;
    });
  }, [supplies, filters]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Gestión de Insumos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Administra inventario y controla el consumo de insumos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {selectedSupplies.length > 0 && activeTab === 'inventory' && (
            <div className="flex items-center justify-between sm:justify-start sm:space-x-2 p-3 bg-blue-50 rounded-lg sm:bg-transparent sm:p-0">
              <span className="text-xs sm:text-sm text-gray-600">
                {selectedSupplies.length} seleccionado{selectedSupplies.length > 1 ? 's' : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={TrendingDown}
                onClick={() => setShowConsumptionModal(true)}
                className="ml-2 sm:ml-0"
              >
                <span className="hidden sm:inline">Registrar Consumo</span>
                <span className="sm:hidden">Consumir</span>
              </Button>
            </div>
          )}
          
          {activeTab === 'inventory' && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Nuevo Insumo</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Statistics */}
          <SuppliesStats 
            stats={suppliesStats} 
            loading={loading} 
          />

          {/* Filters */}
          <SuppliesFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories || []}
            suppliers={suppliers || []}
            loading={loading}
          />

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {filteredSupplies.length} insumo{filteredSupplies.length !== 1 ? 's' : ''} encontrado{filteredSupplies.length !== 1 ? 's' : ''}
              </span>
              {filters.lowStock && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertTriangle size={12} className="mr-1" />
                  Stock bajo
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Vista:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Package size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FileText size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Supplies Display */}
          {viewMode === 'grid' ? (
            <SuppliesGrid
              supplies={filteredSupplies}
              loading={loading}
              selectedSupplies={selectedSupplies}
              onSelectSupply={setSelectedSupplies}
              onEdit={openEditModal}
              onDelete={handleDeleteSupply}
              onRecordConsumption={openConsumptionModal}
              onAdjustStock={handleAdjustStock}
            />
          ) : (
            <SuppliesList
              supplies={filteredSupplies}
              loading={loading}
              selectedSupplies={selectedSupplies}
              onSelectSupply={setSelectedSupplies}
              onEdit={openEditModal}
              onDelete={handleDeleteSupply}
              onRecordConsumption={openConsumptionModal}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {/* Empty State para insumos filtrados */}
          {!loading && filteredSupplies.length === 0 && supplies && supplies.length > 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron insumos
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta ajustar los filtros de búsqueda
              </p>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  category: 'all',
                  status: 'all',
                  supplier: 'all',
                  search: '',
                  lowStock: false
                })}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'consumption' && (
        <ConsumptionHistory
          history={consumptionHistory}
          supplies={supplies}
          loading={loading}
        />
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Reportes de Insumos
            </h3>
            <p className="text-gray-600 mb-4">
              Próximamente: reportes detallados de consumo, costos y tendencias
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm">
                Reporte de Stock Bajo
              </Button>
              <Button variant="outline" size="sm">
                Análisis de Consumo
              </Button>
              <Button variant="outline" size="sm">
                Valorización de Inventario
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateSupplyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSupply}
          categories={categories || []}
          suppliers={suppliers || []}
        />
      )}

      {showEditModal && selectedSupply && (
        <EditSupplyModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSupply(null);
          }}
          onSubmit={handleEditSupply}
          supply={selectedSupply}
          categories={categories || []}
          suppliers={suppliers || []}
        />
      )}

      {showConsumptionModal && (
        <ConsumptionModal
          isOpen={showConsumptionModal}
          onClose={() => {
            setShowConsumptionModal(false);
            setSelectedSupply(null);
          }}
          onSubmit={handleRecordConsumption}
          supply={selectedSupply}
          supplies={selectedSupplies.length > 0 ? 
            supplies?.filter(s => selectedSupplies.includes(s.id)) : 
            selectedSupply ? [selectedSupply] : []
          }
        />
      )}
    </div>
  );
};

export default Supplies;