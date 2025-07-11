// hooks/useSupplies.js
import { useState, useEffect, useMemo } from 'react';
import { suppliesMockData } from '../utils/suppliesMockData';

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
    const lowStockItems = supplies.filter(s => s.currentStock <= s.minStock && s.currentStock > 0).length;
    const outOfStockItems = supplies.filter(s => s.currentStock === 0).length;
    const totalValue = supplies.reduce((sum, s) => sum + (s.currentStock * s.unitPrice), 0);
    
    // Calcular consumo mensual
    const now = new Date();
    const monthlyConsumption = consumptionHistory
      .filter(c => {
        const date = new Date(c.timestamp);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, c) => sum + (c.quantity * (c.unitPrice || 0)), 0);

    // Consumos de hoy
    const today = new Date();
    const recentConsumptions = consumptionHistory.filter(c => {
      const date = new Date(c.timestamp);
      return date.toDateString() === today.toDateString();
    }).length;

    return {
      totalSupplies,
      lowStockItems,
      outOfStockItems,
      totalValue,
      monthlyConsumption,
      categoriesCount: categories.length,
      suppliersCount: suppliers.length,
      recentConsumptions
    };
  }, [supplies, consumptionHistory, categories, suppliers]);

  // Simular carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = suppliesMockData();
        
        setSupplies(data.supplies);
        setCategories(data.categories);
        setSuppliers(data.suppliers);
        setConsumptionHistory(data.consumptionHistory);
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos de insumos');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Crear nuevo insumo
  const createSupply = async (supplyData) => {
    try {
      const newSupply = {
        id: Date.now().toString(),
        ...supplyData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      setSupplies(prev => [...prev, newSupply]);
      
      // Actualizar categorías y proveedores si son nuevos
      if (!categories.includes(supplyData.category)) {
        setCategories(prev => [...prev, supplyData.category]);
      }
      if (!suppliers.includes(supplyData.supplier)) {
        setSuppliers(prev => [...prev, supplyData.supplier]);
      }
      
      return newSupply;
    } catch (error) {
      throw new Error('Error al crear el insumo');
    }
  };

  // Actualizar insumo
  const updateSupply = async (supplyId, updateData) => {
    try {
      setSupplies(prev => prev.map(supply => 
        supply.id === supplyId 
          ? { ...supply, ...updateData, lastUpdated: new Date().toISOString() }
          : supply
      ));
      
      return true;
    } catch (error) {
      throw new Error('Error al actualizar el insumo');
    }
  };

  // Eliminar insumo
  const deleteSupply = async (supplyId) => {
    try {
      setSupplies(prev => prev.filter(supply => supply.id !== supplyId));
      return true;
    } catch (error) {
      throw new Error('Error al eliminar el insumo');
    }
  };

  // Registrar consumo
  const recordConsumption = async (consumptionData) => {
    try {
      const consumption = {
        id: Date.now().toString(),
        ...consumptionData,
        timestamp: new Date().toISOString()
      };

      // Actualizar stock del insumo
      setSupplies(prev => prev.map(supply => {
        if (supply.id === consumptionData.supplyId) {
          return {
            ...supply,
            currentStock: Math.max(0, supply.currentStock - consumptionData.quantity),
            lastUpdated: new Date().toISOString()
          };
        }
        return supply;
      }));

      // Agregar al historial de consumo
      setConsumptionHistory(prev => [consumption, ...prev]);
      
      return consumption;
    } catch (error) {
      throw new Error('Error al registrar el consumo');
    }
  };

  // Ajustar stock
  const adjustStock = async (supplyId, adjustmentData) => {
    try {
      const supply = supplies.find(s => s.id === supplyId);
      if (!supply) throw new Error('Insumo no encontrado');

      const adjustment = {
        id: Date.now().toString(),
        supplyId,
        supplyName: supply.name,
        quantity: adjustmentData.quantity,
        unitPrice: supply.unitPrice,
        unit: supply.unit,
        reason: adjustmentData.reason,
        consumedBy: 'Sistema',
        department: 'Administración',
        timestamp: new Date().toISOString(),
        type: 'adjustment'
      };

      // Actualizar stock del insumo
      setSupplies(prev => prev.map(supply => {
        if (supply.id === supplyId) {
          return {
            ...supply,
            currentStock: adjustmentData.newStock,
            lastUpdated: new Date().toISOString()
          };
        }
        return supply;
      }));

      // Agregar al historial
      setConsumptionHistory(prev => [adjustment, ...prev]);
      
      return adjustment;
    } catch (error) {
      throw new Error('Error al ajustar el stock');
    }
  };

  // Obtener insumos con stock bajo
  const getLowStockSupplies = () => {
    return supplies.filter(supply => 
      supply.currentStock <= supply.minStock && supply.currentStock > 0
    );
  };

  // Obtener insumos sin stock
  const getOutOfStockSupplies = () => {
    return supplies.filter(supply => supply.currentStock === 0);
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
          outOfStock: 0
        };
      }
      
      categoryStats[supply.category].count++;
      categoryStats[supply.category].totalValue += supply.currentStock * supply.unitPrice;
      
      if (supply.currentStock === 0) {
        categoryStats[supply.category].outOfStock++;
      } else if (supply.currentStock <= supply.minStock) {
        categoryStats[supply.category].lowStock++;
      }
    });
    
    return categoryStats;
  };

  // Obtener top consumos del mes
  const getTopConsumptions = (limit = 10) => {
    const now = new Date();
    const thisMonth = consumptionHistory.filter(c => {
      const date = new Date(c.timestamp);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    // Agrupar por insumo y sumar cantidades
    const consumptionBySupply = {};
    thisMonth.forEach(consumption => {
      if (!consumptionBySupply[consumption.supplyId]) {
        consumptionBySupply[consumption.supplyId] = {
          supplyId: consumption.supplyId,
          supplyName: consumption.supplyName,
          totalQuantity: 0,
          totalValue: 0,
          transactions: 0
        };
      }
      
      consumptionBySupply[consumption.supplyId].totalQuantity += consumption.quantity;
      consumptionBySupply[consumption.supplyId].totalValue += consumption.quantity * (consumption.unitPrice || 0);
      consumptionBySupply[consumption.supplyId].transactions++;
    });

    return Object.values(consumptionBySupply)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit);
  };

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
    recordConsumption,
    adjustStock,
    
    // Métodos de análisis
    getLowStockSupplies,
    getOutOfStockSupplies,
    getStatsByCategory,
    getTopConsumptions
  };
};