// src/hooks/useInventory.js - Hook unificado que reemplaza useInventory.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext, PERMISSIONS } from './useAuth';
import { useBranch } from './useBranch';
import toast from 'react-hot-toast';

export const INVENTORY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued'
};

export const INVENTORY_CATEGORIES = {
  FRUTAS: 'frutas',
  BEBIDAS: 'bebidas',
  SNACKS: 'snacks',
  POSTRES: 'postres',
  DULCES: 'dulces',
  LACTEOS: 'lacteos',
  LIMPIEZA: 'limpieza',
  AMENITIES: 'amenities',
  MANTENIMIENTO: 'mantenimiento'
};

// Hook unificado que combina funcionalidades de inventory y supplies
export const useInventory = (initialFilters = {}) => {
  const { hasPermission } = useAuthContext();
  const { selectedBranch } = useBranch();
  
  // Estados principales
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [consumptionHistory, setConsumptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    lowStock: false,
    search: '',
    supplier: '',
    ...initialFilters
  });
  
  // Paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Calcular categorías y proveedores únicos
  const categories = useMemo(() => {
    return [...new Set(inventory.map(item => item.category))].filter(Boolean);
  }, [inventory]);

  const suppliers = useMemo(() => {
    return [...new Set(inventory.map(item => item.supplier))].filter(Boolean);
  }, [inventory]);

  // Estadísticas automáticas (compatible con useInventory)
  const suppliesStats = useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return {
        totalSupplies: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0,
        monthlyConsumption: 0,
        categoriesCount: 0,
        suppliersCount: 0,
        recentConsumptions: 0
      };
    }

    const totalSupplies = inventory.length;
    const lowStockItems = inventory.filter(s => s.isLowStock).length;
    const outOfStockItems = inventory.filter(s => s.isOutOfStock).length;
    const totalValue = inventory.reduce((sum, s) => sum + s.totalValue, 0);
    
    // Calcular consumo mensual basado en historial
    const monthlyConsumption = consumptionHistory
      .filter(consumption => {
        const consumptionDate = new Date(consumption.timestamp);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return consumptionDate >= monthStart;
      })
      .reduce((sum, consumption) => sum + consumption.totalValue, 0);

    return {
      totalSupplies,
      lowStockItems,
      outOfStockItems,
      totalValue,
      monthlyConsumption,
      categoriesCount: categories.length,
      suppliersCount: suppliers.length,
      recentConsumptions: consumptionHistory.length
    };
  }, [inventory, consumptionHistory, categories, suppliers]);

  // Alias para compatibilidad con useInventory
  const supplies = inventory;

  // Cargar inventario desde Supabase
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedBranch) {
        setInventory([]);
        setFilteredInventory([]);
        return [];
      }

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .order('name');

      if (error) throw error;

      const transformedInventory = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        sku: item.sku,
        category: item.category,
        supplier: item.supplier,
        unit: item.unit,
        currentStock: item.current_stock,
        minStock: item.min_stock,
        maxStock: item.max_stock,
        unitCost: parseFloat(item.unit_cost || 0),
        totalValue: parseFloat(item.total_value || 0),
        location: item.location,
        expiryDate: item.expiry_date,
        status: item.status,
        branchId: item.branch_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        // Campos calculados
        isLowStock: item.current_stock <= item.min_stock,
        isOutOfStock: item.current_stock === 0,
        isExpiring: item.expiry_date && new Date(item.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        stockLevel: item.max_stock > 0 ? (item.current_stock / item.max_stock) * 100 : 0,
        // Aliases para compatibilidad con useInventory
        current_stock: item.current_stock,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        unit_cost: parseFloat(item.unit_cost || 0),
        expiry_date: item.expiry_date
      }));

      setInventory(transformedInventory);
      return transformedInventory;
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message);
      toast.error('Error al cargar inventario');
      return [];
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  // Alias para compatibilidad con useInventory
  const loadSupplies = fetchInventory;

  // Cargar historial de consumo
  const loadConsumptionHistory = useCallback(async () => {
    try {
      if (!selectedBranch) return [];

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_services (
            quantity,
            unit_price,
            total_price,
            services (
              id,
              name
            )
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const consumptions = [];
      (orders || []).forEach(order => {
        order.order_services?.forEach(service => {
          consumptions.push({
            id: `${order.id}-${service.services.id}`,
            supplyId: service.services.id,
            supplyName: service.services.name,
            quantity: service.quantity,
            unitPrice: parseFloat(service.unit_price),
            totalValue: parseFloat(service.total_price),
            consumedBy: order.guest_name,
            department: 'Habitaciones',
            timestamp: order.check_out_time || order.created_at,
            orderId: order.id,
            roomNumber: order.room_number
          });
        });
      });

      setConsumptionHistory(consumptions);
      return consumptions;
    } catch (error) {
      console.error('Error loading consumption history:', error);
      return [];
    }
  }, [selectedBranch]);

  // Filtrar inventario
  useEffect(() => {
    let filtered = [...inventory];

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.lowStock) {
      filtered = filtered.filter(item => item.isLowStock);
    }

    if (filters.supplier) {
      filtered = filtered.filter(item => 
        item.supplier?.toLowerCase().includes(filters.supplier.toLowerCase())
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.sku?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredInventory(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, page: 1 }));
  }, [inventory, filters]);

  // Cargar datos inicialmente
  useEffect(() => {
    if (selectedBranch) {
      fetchInventory();
      loadConsumptionHistory();
    }
  }, [fetchInventory, loadConsumptionHistory, selectedBranch]);

  // Crear nuevo item (compatible con ambas interfaces)
  const createInventoryItem = useCallback(async (itemData) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_INVENTORY)) {
        throw new Error('No tienes permisos para crear items de inventario');
      }

      if (!selectedBranch) {
        throw new Error('No hay sucursal seleccionada');
      }

      const insertData = {
        name: itemData.name,
        description: itemData.description,
        sku: itemData.sku,
        category: itemData.category,
        supplier: itemData.supplier,
        unit: itemData.unit || 'unit',
        current_stock: itemData.currentStock || itemData.current_stock || 0,
        min_stock: itemData.minStock || itemData.min_stock || 0,
        max_stock: itemData.maxStock || itemData.max_stock || 100,
        unit_cost: itemData.unitCost || itemData.unit_cost || 0,
        location: itemData.location,
        expiry_date: itemData.expiryDate || itemData.expiry_date,
        status: itemData.status || INVENTORY_STATUS.ACTIVE,
        branch_id: selectedBranch.id
      };

      const { data, error } = await supabase
        .from('inventory')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      await fetchInventory();
      toast.success('Item de inventario creado exitosamente');
      return { success: true, data };
    } catch (err) {
      console.error('Error creating inventory item:', err);
      toast.error('Error al crear item: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [hasPermission, selectedBranch, fetchInventory]);

  // Alias para compatibilidad
  const createSupply = createInventoryItem;

  // Actualizar item
  const updateInventoryItem = useCallback(async (id, updates) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_INVENTORY)) {
        throw new Error('No tienes permisos para actualizar inventario');
      }

      const dbUpdates = {
        name: updates.name,
        description: updates.description,
        sku: updates.sku,
        category: updates.category,
        supplier: updates.supplier,
        unit: updates.unit,
        current_stock: updates.currentStock || updates.current_stock,
        min_stock: updates.minStock || updates.min_stock,
        max_stock: updates.maxStock || updates.max_stock,
        unit_cost: updates.unitCost || updates.unit_cost,
        location: updates.location,
        expiry_date: updates.expiryDate || updates.expiry_date,
        status: updates.status,
        updated_at: new Date().toISOString()
      };

      // Remover campos undefined
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) delete dbUpdates[key];
      });

      const { data, error } = await supabase
        .from('inventory')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchInventory();
      toast.success('Item actualizado exitosamente');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating inventory item:', err);
      toast.error('Error al actualizar item: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [hasPermission, fetchInventory]);

  // Alias para compatibilidad
  const updateSupply = updateInventoryItem;

  // Ajustar stock
  const adjustStock = useCallback(async (id, adjustmentData) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_INVENTORY)) {
        throw new Error('No tienes permisos para ajustar stock');
      }

      const newStock = adjustmentData.newStock || adjustmentData.quantity || 0;

      const { error } = await supabase
        .from('inventory')
        .update({ 
          current_stock: parseInt(newStock),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchInventory();
      toast.success('Stock ajustado exitosamente');
      return { success: true };
    } catch (err) {
      console.error('Error adjusting stock:', err);
      toast.error('Error al ajustar stock: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [hasPermission, fetchInventory]);

  // Eliminar item
  const deleteInventoryItem = useCallback(async (id) => {
    try {
      if (!hasPermission(PERMISSIONS.MANAGE_INVENTORY)) {
        throw new Error('No tienes permisos para eliminar items');
      }

      const { error } = await supabase
        .from('inventory')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchInventory();
      toast.success('Item eliminado exitosamente');
      return { success: true };
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      toast.error('Error al eliminar item: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [hasPermission, fetchInventory]);

  // Alias para compatibilidad
  const deleteSupply = deleteInventoryItem;

  // Funciones de utilidad (compatibles con useInventory)
  const getLowStockSupplies = useCallback(() => {
    return inventory.filter(item => item.isLowStock && item.status === INVENTORY_STATUS.ACTIVE);
  }, [inventory]);

  const getOutOfStockSupplies = useCallback(() => {
    return inventory.filter(item => item.isOutOfStock && item.status === INVENTORY_STATUS.ACTIVE);
  }, [inventory]);

  const getExpiringSupplies = useCallback((daysAhead = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return inventory.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= futureDate && expiryDate > new Date();
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [inventory]);

  const getStatsByCategory = useCallback(() => {
    const categoryStats = {};
    
    inventory.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          count: 0,
          totalValue: 0,
          lowStock: 0,
          outOfStock: 0,
          totalStock: 0
        };
      }
      
      categoryStats[item.category].count++;
      categoryStats[item.category].totalValue += item.totalValue;
      categoryStats[item.category].totalStock += item.currentStock;
      
      if (item.isOutOfStock) {
        categoryStats[item.category].outOfStock++;
      } else if (item.isLowStock) {
        categoryStats[item.category].lowStock++;
      }
    });
    
    return categoryStats;
  }, [inventory]);

  const searchSupplies = useCallback((searchTerm) => {
    if (!searchTerm) return inventory;
    
    const term = searchTerm.toLowerCase();
    return inventory.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.supplier?.toLowerCase().includes(term)
    );
  }, [inventory]);

  // Funciones de estadísticas
  const getInventoryStats = useCallback(() => suppliesStats, [suppliesStats]);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchInventory(),
        loadConsumptionHistory()
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchInventory, loadConsumptionHistory]);

  // Paginación
  const getPaginatedInventory = useCallback(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredInventory.slice(startIndex, endIndex);
  }, [filteredInventory, pagination]);

  // Configurar actualizaciones en tiempo real
  useEffect(() => {
    if (!selectedBranch) return;

    const subscription = supabase
      .channel(`inventory_changes_${selectedBranch.id}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'inventory',
          filter: `branch_id=eq.${selectedBranch.id}`
        },
        (payload) => {
          console.log('Inventory change detected:', payload);
          fetchInventory();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Orders change detected:', payload);
          loadConsumptionHistory();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [selectedBranch, fetchInventory, loadConsumptionHistory]);

  return {
    // Datos principales (useInventory)
    inventory: getPaginatedInventory(),
    allInventory: filteredInventory,
    loading,
    error,

    // Datos para compatibilidad (useInventory)
    supplies,
    categories,
    suppliers,
    suppliesStats,
    consumptionHistory,

    // Filtros y paginación
    filters,
    setFilters,
    pagination,
    setPagination,

    // Acciones CRUD (useInventory)
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,

    // Acciones CRUD (useInventory - alias)
    createSupply,
    updateSupply,
    deleteSupply,

    // Utilidades (useInventory)
    getInventoryStats,

    // Utilidades (useInventory - compatibilidad)
    getLowStockSupplies,
    getOutOfStockSupplies,
    getExpiringSupplies,
    getStatsByCategory,
    searchSupplies,

    // Funciones de recarga
    refreshData,
    refreshInventory: fetchInventory,
    loadSupplies,
    loadCategories: () => categories,
    loadSuppliers: () => suppliers,
    loadConsumptionHistory,

    // Constantes
    INVENTORY_STATUS,
    INVENTORY_CATEGORIES
  };
};