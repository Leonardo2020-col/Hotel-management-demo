// src/hooks/useSupplies.js - CONECTADO CON SUPABASE
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export const useSupplies = () => {
  const [supplies, setSupplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [consumptionHistory, setConsumptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calcular estadísticas automáticamente cuando cambien los datos
  const suppliesStats = useMemo(() => {
    if (!supplies || supplies.length === 0) {
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

    const totalSupplies = supplies.length;
    const lowStockItems = supplies.filter(s => s.current_stock <= s.min_stock && s.current_stock > 0).length;
    const outOfStockItems = supplies.filter(s => s.current_stock === 0).length;
    const totalValue = supplies.reduce((sum, s) => sum + (s.current_stock * s.unit_cost), 0);
    
    // Calcular consumo mensual basado en las órdenes completadas
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    // Simular consumo mensual por ahora (en el futuro se puede calcular desde order_services)
    const monthlyConsumption = totalValue * 0.15; // Estimado 15% del inventario

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
  }, [supplies, consumptionHistory, categories, suppliers]);

  // Cargar insumos desde Supabase
  const loadSupplies = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      setSupplies(data || []);
      return data;
    } catch (error) {
      console.error('Error cargando insumos:', error);
      setError(error.message);
      return [];
    }
  };

  // Cargar categorías únicas desde Supabase
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('category')
        .eq('status', 'active');

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
      setCategories(uniqueCategories);
      return uniqueCategories;
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setError(error.message);
      return [];
    }
  };

  // Cargar proveedores únicos desde Supabase
  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('supplier')
        .eq('status', 'active');

      if (error) throw error;

      const uniqueSuppliers = [...new Set(data.map(item => item.supplier))].filter(Boolean);
      setSuppliers(uniqueSuppliers);
      return uniqueSuppliers;
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      setError(error.message);
      return [];
    }
  };

  // Cargar historial de consumo (simulado por ahora)
  const loadConsumptionHistory = async () => {
    try {
      // Por ahora, crear historial simulado basado en las órdenes
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
        .limit(50);

      if (error) throw error;

      // Convertir órdenes a historial de consumo
      const consumptions = [];
      orders.forEach(order => {
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
      console.error('Error cargando historial de consumo:', error);
      setError(error.message);
      return [];
    }
  };

  // Crear nuevo insumo
  const createSupply = async (supplyData) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          name: supplyData.name,
          description: supplyData.description,
          sku: supplyData.sku,
          category: supplyData.category,
          supplier: supplyData.supplier,
          unit: supplyData.unit,
          current_stock: parseInt(supplyData.currentStock),
          min_stock: parseInt(supplyData.minStock),
          max_stock: parseInt(supplyData.maxStock),
          unit_cost: parseFloat(supplyData.unitCost),
          location: supplyData.location,
          expiry_date: supplyData.expiryDate,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Recargar datos
      await loadSupplies();
      await loadCategories();
      await loadSuppliers();

      return { success: true, data };
    } catch (error) {
      console.error('Error creando insumo:', error);
      return { success: false, error: error.message };
    }
  };

  // Actualizar insumo
  const updateSupply = async (supplyId, updateData) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          name: updateData.name,
          description: updateData.description,
          sku: updateData.sku,
          category: updateData.category,
          supplier: updateData.supplier,
          unit: updateData.unit,
          current_stock: parseInt(updateData.currentStock),
          min_stock: parseInt(updateData.minStock),
          max_stock: parseInt(updateData.maxStock),
          unit_cost: parseFloat(updateData.unitCost),
          location: updateData.location,
          expiry_date: updateData.expiryDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplyId);

      if (error) throw error;

      // Recargar datos
      await loadSupplies();

      return { success: true };
    } catch (error) {
      console.error('Error actualizando insumo:', error);
      return { success: false, error: error.message };
    }
  };

  // Eliminar insumo (cambiar estado a inactive)
  const deleteSupply = async (supplyId) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', supplyId);

      if (error) throw error;

      // Recargar datos
      await loadSupplies();

      return { success: true };
    } catch (error) {
      console.error('Error eliminando insumo:', error);
      return { success: false, error: error.message };
    }
  };

  // Ajustar stock
  const adjustStock = async (supplyId, adjustmentData) => {
    try {
      const supply = supplies.find(s => s.id === supplyId);
      if (!supply) throw new Error('Insumo no encontrado');

      // Actualizar stock en la base de datos
      const { error } = await supabase
        .from('inventory')
        .update({ 
          current_stock: parseInt(adjustmentData.newStock),
          updated_at: new Date().toISOString()
        })
        .eq('id', supplyId);

      if (error) throw error;

      // Recargar datos
      await loadSupplies();

      return { success: true };
    } catch (error) {
      console.error('Error ajustando stock:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtener insumos con stock bajo
  const getLowStockSupplies = () => {
    return supplies.filter(supply => 
      supply.current_stock <= supply.min_stock && supply.current_stock > 0
    );
  };

  // Obtener insumos sin stock
  const getOutOfStockSupplies = () => {
    return supplies.filter(supply => supply.current_stock === 0);
  };

  // Obtener estadísticas por categoría
  const getStatsByCategory = () => {
    const categoryStats = {};
    
    supplies.forEach(supply => {
      if (!categoryStats[supply.category]) {
        categoryStats[supply.category] = {
          count: 0,
          totalValue: 0,
          lowStock: 0,
          outOfStock: 0,
          totalStock: 0
        };
      }
      
      categoryStats[supply.category].count++;
      categoryStats[supply.category].totalValue += supply.current_stock * supply.unit_cost;
      categoryStats[supply.category].totalStock += supply.current_stock;
      
      if (supply.current_stock === 0) {
        categoryStats[supply.category].outOfStock++;
      } else if (supply.current_stock <= supply.min_stock) {
        categoryStats[supply.category].lowStock++;
      }
    });
    
    return categoryStats;
  };

  // Obtener insumos próximos a vencer
  const getExpiringSupplies = (daysAhead = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return supplies.filter(supply => {
      if (!supply.expiry_date) return false;
      const expiryDate = new Date(supply.expiry_date);
      return expiryDate <= futureDate && expiryDate > new Date();
    }).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  };

  // Buscar insumos
  const searchSupplies = (searchTerm) => {
    if (!searchTerm) return supplies;
    
    const term = searchTerm.toLowerCase();
    return supplies.filter(supply => 
      supply.name.toLowerCase().includes(term) ||
      supply.description?.toLowerCase().includes(term) ||
      supply.sku?.toLowerCase().includes(term) ||
      supply.category.toLowerCase().includes(term) ||
      supply.supplier?.toLowerCase().includes(term)
    );
  };

  // Refrescar todos los datos
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadSupplies(),
        loadCategories(),
        loadSuppliers(),
        loadConsumptionHistory()
      ]);
    } catch (error) {
      console.error('Error refrescando datos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    // Canal para inventory
    const inventoryChannel = supabase
      .channel('inventory_supplies_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          console.log('Cambio en inventario:', payload);
          loadSupplies();
          loadCategories();
          loadSuppliers();
        }
      )
      .subscribe();

    // Canal para orders (para actualizar historial de consumo)
    const ordersChannel = supabase
      .channel('orders_supplies_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Cambio en órdenes:', payload);
          loadConsumptionHistory();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // Datos
    supplies,
    categories,
    suppliers,
    suppliesStats,
    consumptionHistory,
    loading,
    error,
    
    // Métodos CRUD
    createSupply,
    updateSupply,
    deleteSupply,
    adjustStock,
    
    // Métodos de análisis
    getLowStockSupplies,
    getOutOfStockSupplies,
    getStatsByCategory,
    getExpiringSupplies,
    searchSupplies,
    refreshData,
    
    // Funciones de recarga individual
    loadSupplies,
    loadCategories,
    loadSuppliers,
    loadConsumptionHistory
  };
};