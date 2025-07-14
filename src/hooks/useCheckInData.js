// src/hooks/useCheckInData.js - SNACKS DESDE TABLA INVENTORY
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useCheckInData = () => {
  // Estados para datos dinámicos de Supabase
  const [floorRooms, setFloorRooms] = useState({});
  const [snackTypes, setSnackTypes] = useState([]);
  const [snackItems, setSnackItems] = useState({});
  const [roomPrices, setRoomPrices] = useState({});
  const [savedOrders, setSavedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar habitaciones desde Supabase
  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');

      if (error) throw error;

      // Agrupar habitaciones por piso y crear estructura de precios
      const grouped = {};
      const prices = {};
      
      data.forEach(room => {
        if (!grouped[room.floor]) {
          grouped[room.floor] = [];
        }
        
        grouped[room.floor].push({
          number: room.number,
          status: room.status,
          type: room.type,
          price: parseFloat(room.price)
        });
        
        // Agrupar precios por piso (tomar el promedio si hay diferentes precios)
        if (!prices[room.floor]) {
          prices[room.floor] = parseFloat(room.price);
        }
      });

      setFloorRooms(grouped);
      setRoomPrices(prices);
      return { grouped, prices };
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      setError(error.message);
      
      // Fallback a datos estáticos
      const fallbackRooms = {
        1: Array.from({length: 12}, (_, i) => ({ 
          number: 101 + i, 
          status: i === 2 ? 'occupied' : i === 6 ? 'checkout' : 'available' 
        })),
        2: Array.from({length: 12}, (_, i) => ({ 
          number: 201 + i, 
          status: i === 1 || i === 8 ? 'occupied' : i === 4 ? 'checkout' : 'available' 
        })),
        3: Array.from({length: 12}, (_, i) => ({ 
          number: 301 + i, 
          status: i === 3 ? 'occupied' : i === 5 ? 'checkout' : 'available' 
        }))
      };
      const fallbackPrices = { 1: 80.00, 2: 95.00, 3: 110.00 };
      
      setFloorRooms(fallbackRooms);
      setRoomPrices(fallbackPrices);
      return { grouped: fallbackRooms, prices: fallbackPrices };
    }
  };

  // Cargar categorías de insumos como tipos de snacks
  const loadSnackTypes = async () => {
    try {
      // Obtener categorías únicas de la tabla inventory que podrían ser snacks
      const { data, error } = await supabase
        .from('inventory')
        .select('category')
        .eq('status', 'active')
        .gt('current_stock', 0)
        .order('category');

      if (error) throw error;

      // Obtener categorías únicas
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      
      // Mapear categorías a formato esperado
      const categoryMapping = {
        'frutas': { name: 'FRUTAS', description: 'Frutas frescas y naturales' },
        'bebidas': { name: 'BEBIDAS', description: 'Bebidas frías y calientes' },
        'snacks': { name: 'SNACKS', description: 'Bocadillos y aperitivos' },
        'postres': { name: 'POSTRES', description: 'Dulces y postres' },
        'comida': { name: 'COMIDA', description: 'Comidas y platos' },
        'dulces': { name: 'DULCES', description: 'Dulces y golosinas' },
        'lacteos': { name: 'LÁCTEOS', description: 'Productos lácteos' }
      };

      const formattedTypes = uniqueCategories.map(category => ({
        id: category.toLowerCase(),
        name: categoryMapping[category.toLowerCase()]?.name || category.toUpperCase(),
        description: categoryMapping[category.toLowerCase()]?.description || `Productos de ${category}`
      }));

      setSnackTypes(formattedTypes);
      return formattedTypes;
    } catch (error) {
      console.error('Error cargando categorías de insumos:', error);
      setError(error.message);
      
      // Fallback a datos estáticos
      const fallbackTypes = [
        { id: 'frutas', name: 'FRUTAS', description: 'Frutas frescas y naturales' },
        { id: 'bebidas', name: 'BEBIDAS', description: 'Bebidas frías y calientes' },
        { id: 'snacks', name: 'SNACKS', description: 'Bocadillos y aperitivos' },
        { id: 'postres', name: 'POSTRES', description: 'Dulces y postres' }
      ];
      setSnackTypes(fallbackTypes);
      return fallbackTypes;
    }
  };

  // Cargar insumos disponibles como snacks desde Supabase
  const loadSnackItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('status', 'active')
        .gt('current_stock', 0)
        .order('category, name');

      if (error) throw error;

      // Agrupar por categoría
      const groupedItems = {};
      
      data.forEach(item => {
        const categoryKey = item.category.toLowerCase();
        
        if (!groupedItems[categoryKey]) {
          groupedItems[categoryKey] = [];
        }
        
        // Calcular precio de venta (cost + margen de ganancia)
        // Si no hay precio definido, usar cost * 1.5 como precio de venta
        const sellingPrice = item.unit_cost ? parseFloat(item.unit_cost) * 1.5 : 0;
        
        groupedItems[categoryKey].push({
          id: item.id,
          name: item.name,
          price: sellingPrice, // Precio de venta calculado
          cost: parseFloat(item.unit_cost || 0),
          description: item.description,
          stock: item.current_stock,
          minStock: item.min_stock,
          maxStock: item.max_stock,
          unit: item.unit,
          sku: item.sku,
          supplier: item.supplier,
          location: item.location,
          expiryDate: item.expiry_date,
          stockLevel: item.current_stock <= item.min_stock ? 'LOW' : 
                     item.current_stock <= item.min_stock * 1.5 ? 'MEDIUM' : 'HIGH'
        });
      });

      setSnackItems(groupedItems);
      return groupedItems;
    } catch (error) {
      console.error('Error cargando insumos:', error);
      setError(error.message);
      
      // Fallback a datos estáticos
      const fallbackItems = {
        frutas: [
          { id: 'fallback-1', name: 'Manzana', price: 2.50, stock: 0 },
          { id: 'fallback-2', name: 'Plátano', price: 1.50, stock: 0 }
        ],
        bebidas: [
          { id: 'fallback-3', name: 'Agua', price: 1.00, stock: 0 },
          { id: 'fallback-4', name: 'Coca Cola', price: 2.50, stock: 0 }
        ],
        snacks: [
          { id: 'fallback-5', name: 'Papas fritas', price: 3.50, stock: 0 }
        ],
        postres: [
          { id: 'fallback-6', name: 'Helado', price: 4.00, stock: 0 }
        ]
      };
      setSnackItems(fallbackItems);
      return fallbackItems;
    }
  };

  // Cargar órdenes activas desde Supabase
  const loadActiveOrders = async () => {
    try {
      const { data, error } = await supabase
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
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convertir a formato esperado por la aplicación
      const ordersMap = {};
      
      data.forEach(order => {
        const snacks = order.order_services?.map(os => ({
          id: os.services.id,
          name: os.services.name,
          price: parseFloat(os.unit_price),
          quantity: os.quantity
        })) || [];

        ordersMap[order.room_number] = {
          room: { number: order.room_number, status: 'occupied' },
          roomPrice: parseFloat(order.room_price),
          snacks: snacks,
          total: parseFloat(order.total),
          checkInDate: order.check_in_date,
          guestName: order.guest_name,
          orderId: order.id
        };
      });

      setSavedOrders(ordersMap);
      return ordersMap;
    } catch (error) {
      console.error('Error cargando órdenes activas:', error);
      setError(error.message);
      
      // Mantener órdenes por defecto o vacías
      setSavedOrders({});
      return {};
    }
  };

  // Función para crear nueva orden en Supabase
  const createOrder = async (orderData) => {
    try {
      // Crear la orden principal
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          room_number: orderData.room.number,
          guest_name: orderData.guestName,
          room_price: orderData.roomPrice,
          total: orderData.total,
          check_in_date: orderData.checkInDate,
          check_in_time: new Date().toISOString(),
          status: 'active'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear los servicios de la orden si hay snacks
      if (orderData.snacks && orderData.snacks.length > 0) {
        // Primero, crear entradas en services para los insumos si no existen
        const serviceEntries = [];
        
        for (const snack of orderData.snacks) {
          // Verificar si ya existe un service para este insumo
          const { data: existingService, error: serviceCheckError } = await supabase
            .from('services')
            .select('id')
            .eq('name', snack.name)
            .single();

          let serviceId;
          
          if (serviceCheckError && serviceCheckError.code === 'PGRST116') {
            // No existe, crear nuevo service
            const { data: newService, error: newServiceError } = await supabase
              .from('services')
              .insert([{
                name: snack.name,
                description: snack.description || `${snack.name} del inventario`,
                price: snack.price,
                cost: snack.cost || 0,
                type_id: 'inventory', // Tipo especial para items del inventario
                category: 'inventory_item',
                available: true,
                stock_quantity: snack.stock
              }])
              .select('id')
              .single();

            if (newServiceError) throw newServiceError;
            serviceId = newService.id;
          } else if (existingService) {
            serviceId = existingService.id;
          } else {
            throw serviceCheckError;
          }

          serviceEntries.push({
            order_id: newOrder.id,
            service_id: serviceId,
            quantity: snack.quantity,
            unit_price: snack.price,
            total_price: snack.price * snack.quantity
          });
        }

        // Insertar servicios de la orden
        const { error: servicesError } = await supabase
          .from('order_services')
          .insert(serviceEntries);

        if (servicesError) throw servicesError;

        // Actualizar stock de inventario
        for (const snack of orderData.snacks) {
          await updateInventoryStock(snack.id, -snack.quantity);
        }
      }

      // Actualizar estado de la habitación
      await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('number', orderData.room.number);

      // Recargar datos
      await Promise.all([
        loadActiveOrders(),
        loadRooms(),
        loadSnackItems()
      ]);

      return { success: true, data: newOrder };
    } catch (error) {
      console.error('Error creando orden:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para actualizar stock de inventario
  const updateInventoryStock = async (inventoryId, quantityChange) => {
    try {
      // Obtener stock actual
      const { data: item, error: getError } = await supabase
        .from('inventory')
        .select('current_stock, name')
        .eq('id', inventoryId)
        .single();

      if (getError) throw getError;

      const newStock = item.current_stock + quantityChange;
      
      // Verificar que no sea negativo
      if (newStock < 0) {
        throw new Error(`Stock insuficiente para ${item.name}. Stock actual: ${item.current_stock}, solicitado: ${Math.abs(quantityChange)}`);
      }

      // Actualizar stock
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ current_stock: newStock })
        .eq('id', inventoryId);

      if (updateError) throw updateError;

      return { success: true, newStock };
    } catch (error) {
      console.error('Error actualizando stock de inventario:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para completar checkout
  const completeCheckout = async (roomNumber, paymentMethod) => {
    try {
      // Completar la orden
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          check_out_date: new Date().toISOString().split('T')[0],
          check_out_time: new Date().toISOString(),
          payment_method: paymentMethod,
          payment_status: 'paid'
        })
        .eq('room_number', roomNumber)
        .eq('status', 'active');

      if (orderError) throw orderError;

      // Actualizar estado de la habitación a checkout
      await supabase
        .from('rooms')
        .update({ status: 'checkout' })
        .eq('number', roomNumber);

      // Recargar datos
      await Promise.all([
        loadActiveOrders(),
        loadRooms()
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error completando checkout:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para verificar disponibilidad de stock en inventario
  const checkStockAvailability = (inventoryId, requestedQuantity) => {
    for (const categoryItems of Object.values(snackItems)) {
      const item = categoryItems.find(item => item.id === inventoryId);
      if (item) {
        return {
          available: item.stock >= requestedQuantity,
          currentStock: item.stock,
          requested: requestedQuantity,
          shortfall: Math.max(0, requestedQuantity - item.stock),
          name: item.name
        };
      }
    }
    return { available: false, currentStock: 0, requested: requestedQuantity, shortfall: requestedQuantity };
  };

  // Función para obtener productos con stock bajo
  const getLowStockItems = () => {
    const lowStockItems = [];
    
    Object.values(snackItems).forEach(categoryItems => {
      categoryItems.forEach(item => {
        if (item.stockLevel === 'LOW') {
          lowStockItems.push({
            ...item,
            category: Object.keys(snackItems).find(key => 
              snackItems[key].some(i => i.id === item.id)
            )
          });
        }
      });
    });
    
    return lowStockItems;
  };

  // Función para refrescar todos los datos
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadRooms(),
        loadSnackTypes(),
        loadSnackItems(),
        loadActiveOrders()
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
    // Canal para habitaciones
    const roomsChannel = supabase
      .channel('rooms_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          console.log('Cambio en habitaciones:', payload);
          loadRooms();
        }
      )
      .subscribe();

    // Canal para inventario
    const inventoryChannel = supabase
      .channel('inventory_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          console.log('Cambio en inventario:', payload);
          loadSnackItems();
          loadSnackTypes();
        }
      )
      .subscribe();

    // Canal para órdenes
    const ordersChannel = supabase
      .channel('orders_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Cambio en órdenes:', payload);
          loadActiveOrders();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // Datos principales
    floorRooms,
    snackTypes,
    snackItems,
    roomPrices,
    savedOrders,
    setSavedOrders,
    
    // Estados
    loading,
    error,
    
    // Funciones de gestión
    createOrder,
    completeCheckout,
    updateInventoryStock,
    checkStockAvailability,
    getLowStockItems,
    refreshData,
    
    // Funciones de recarga individual
    loadRooms,
    loadSnackTypes,
    loadSnackItems,
    loadActiveOrders
  };
};