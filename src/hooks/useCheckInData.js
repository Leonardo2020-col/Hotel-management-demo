// src/hooks/useCheckInData.js - VERSIÓN CORREGIDA COMPLETA
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, safeQuery, handleAuthError } from '../lib/supabase';

export const useCheckInData = () => {
  // Estados para datos dinámicos de Supabase
  const [floorRooms, setFloorRooms] = useState({});
  const [snackTypes, setSnackTypes] = useState([]);
  const [snackItems, setSnackItems] = useState({});
  const [roomPrices, setRoomPrices] = useState({});
  const [savedOrders, setSavedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIX: Función para datos de fallback memoizada
  const getFallbackData = useCallback(() => ({
    rooms: {
      1: Array.from({length: 12}, (_, i) => ({ 
        number: 101 + i, 
        status: i === 2 ? 'occupied' : i === 6 ? 'checkout' : 'available',
        type: 'standard',
        price: 80.00
      })),
      2: Array.from({length: 12}, (_, i) => ({ 
        number: 201 + i, 
        status: i === 1 || i === 8 ? 'occupied' : i === 4 ? 'checkout' : 'available',
        type: 'deluxe', 
        price: 95.00
      })),
      3: Array.from({length: 12}, (_, i) => ({ 
        number: 301 + i, 
        status: i === 3 ? 'occupied' : i === 5 ? 'checkout' : 'available',
        type: 'suite',
        price: 110.00
      }))
    },
    types: [
      { id: 'frutas', name: 'FRUTAS', description: 'Frutas frescas y naturales' },
      { id: 'bebidas', name: 'BEBIDAS', description: 'Bebidas frías y calientes' },
      { id: 'snacks', name: 'SNACKS', description: 'Bocadillos y aperitivos' },
      { id: 'postres', name: 'POSTRES', description: 'Dulces y postres' }
    ],
    items: {
      frutas: [
        { id: 1, name: 'Manzana', price: 2.50, stock: 50, description: 'Manzana roja fresca' },
        { id: 2, name: 'Plátano', price: 1.50, stock: 30, description: 'Plátano maduro' },
        { id: 3, name: 'Naranja', price: 2.00, stock: 40, description: 'Naranja jugosa' },
        { id: 4, name: 'Uvas', price: 4.00, stock: 25, description: 'Uvas verdes sin pepas' }
      ],
      bebidas: [
        { id: 6, name: 'Agua', price: 1.00, stock: 100, description: 'Agua mineral 500ml' },
        { id: 7, name: 'Coca Cola', price: 2.50, stock: 80, description: 'Gaseosa 350ml' },
        { id: 8, name: 'Jugo de naranja', price: 3.00, stock: 60, description: 'Jugo natural 300ml' },
        { id: 9, name: 'Café', price: 2.00, stock: 45, description: 'Café instantáneo' }
      ],
      snacks: [
        { id: 11, name: 'Papas fritas', price: 3.50, stock: 40, description: 'Papas fritas clásicas' },
        { id: 12, name: 'Galletas', price: 2.00, stock: 35, description: 'Galletas de chocolate' },
        { id: 13, name: 'Nueces', price: 4.50, stock: 30, description: 'Mix de nueces' },
        { id: 14, name: 'Chocolate', price: 3.00, stock: 25, description: 'Chocolate premium' }
      ],
      postres: [
        { id: 16, name: 'Helado', price: 4.00, stock: 30, description: 'Helado de vainilla' },
        { id: 17, name: 'Torta', price: 5.50, stock: 18, description: 'Porción de torta' },
        { id: 18, name: 'Flan', price: 3.50, stock: 22, description: 'Flan de caramelo' },
        { id: 19, name: 'Brownie', price: 4.50, stock: 20, description: 'Brownie con nueces' }
      ]
    }
  }), []);

  // FIX: Fallback para habitaciones memoizada
  const getFallbackRooms = useCallback(() => {
    const fallbackData = getFallbackData();
    const fallbackRooms = fallbackData.rooms;
    const fallbackPrices = { 1: 80.00, 2: 95.00, 3: 110.00 };
    
    setFloorRooms(fallbackRooms);
    setRoomPrices(fallbackPrices);
    return { grouped: fallbackRooms, prices: fallbackPrices };
  }, [getFallbackData]);

  // FIX: Cargar habitaciones desde Supabase con fallback robusto - MEMOIZADA
  const loadRooms = useCallback(async () => {
    try {
      const result = await safeQuery(async () => {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('number');
        
        if (error) throw error;
        return { data, error: null };
      });

      if (result.error || !result.data) {
        console.warn('Error loading rooms from Supabase, using fallback:', result.error);
        return getFallbackRooms();
      }

      // Agrupar habitaciones por piso y crear estructura de precios
      const grouped = {};
      const prices = {};
      
      (result.data || []).forEach(room => {
        if (!grouped[room.floor]) {
          grouped[room.floor] = [];
        }
        
        grouped[room.floor].push({
          number: room.number,
          status: room.status,
          type: room.type,
          price: parseFloat(room.price)
        });
        
        // Agrupar precios por piso
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
      return getFallbackRooms();
    }
  }, [getFallbackRooms]);

  // FIX: Fallback para tipos de snacks memoizada
  const getFallbackSnackTypes = useCallback(() => {
    const fallbackData = getFallbackData();
    const fallbackTypes = fallbackData.types;
    setSnackTypes(fallbackTypes);
    return fallbackTypes;
  }, [getFallbackData]);

  // FIX: Cargar tipos de servicios desde Supabase con fallback - MEMOIZADA
  const loadSnackTypes = useCallback(async () => {
    try {
      const result = await safeQuery(async () => {
        const { data, error } = await supabase
          .from('service_types')
          .select('*')
          .eq('active', true)
          .order('name');
        
        if (error) throw error;
        return { data, error: null };
      });

      if (result.error || !result.data) {
        console.warn('Error loading service types, using fallback:', result.error);
        return getFallbackSnackTypes();
      }

      const formattedTypes = (result.data || []).map(type => ({
        id: type.id,
        name: type.name,
        description: type.description || type.name
      }));

      setSnackTypes(formattedTypes);
      return formattedTypes;
    } catch (error) {
      console.error('Error cargando tipos de servicios:', error);
      setError(error.message);
      return getFallbackSnackTypes();
    }
  }, [getFallbackSnackTypes]);

  // FIX: Fallback para items de snacks memoizada
  const getFallbackSnackItems = useCallback(() => {
    const fallbackData = getFallbackData();
    const fallbackItems = fallbackData.items;
    setSnackItems(fallbackItems);
    return fallbackItems;
  }, [getFallbackData]);

  // FIX: Cargar servicios/snacks desde Supabase con fallback - MEMOIZADA
  const loadSnackItems = useCallback(async () => {
    try {
      const result = await safeQuery(async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('available', true)
          .gt('stock_quantity', 0)
          .order('category, name');
        
        if (error) throw error;
        return { data, error: null };
      });

      if (result.error || !result.data) {
        console.warn('Error loading services, using fallback:', result.error);
        return getFallbackSnackItems();
      }

      // Agrupar por categoría/tipo
      const groupedItems = {};
      
      (result.data || []).forEach(item => {
        const categoryKey = item.type_id || item.category || 'otros';
        
        if (!groupedItems[categoryKey]) {
          groupedItems[categoryKey] = [];
        }
        
        groupedItems[categoryKey].push({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          cost: parseFloat(item.cost || 0),
          description: item.description,
          stock: item.stock_quantity,
          minStock: item.min_stock || 0,
          unit: item.unit,
          category: item.category,
          type_id: item.type_id,
          stockLevel: item.stock_quantity <= (item.min_stock || 0) ? 'LOW' : 
                     item.stock_quantity <= (item.min_stock || 0) * 1.5 ? 'MEDIUM' : 'HIGH'
        });
      });

      setSnackItems(groupedItems);
      return groupedItems;
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setError(error.message);
      return getFallbackSnackItems();
    }
  }, [getFallbackSnackItems]);

  // FIX: Cargar órdenes activas desde Supabase con fallback - MEMOIZADA
  const loadActiveOrders = useCallback(async () => {
    try {
      const result = await safeQuery(async () => {
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
        return { data, error: null };
      });

      if (result.error || !result.data) {
        console.warn('Error loading orders, using empty state:', result.error);
        setSavedOrders({});
        return {};
      }

      // Convertir a formato esperado por la aplicación
      const ordersMap = {};
      
      (result.data || []).forEach(order => {
        const snacks = order.order_services?.map(os => ({
          id: os.services?.id,
          name: os.services?.name,
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
  }, []);

  // FIX: Función para crear nueva orden en Supabase con manejo robusto - MEMOIZADA
  const createOrder = useCallback(async (orderData) => {
    try {
      // Intentar obtener guest_id si existe el huésped
      let guestId = null;
      try {
        const guestResult = await safeQuery(async () => {
          const { data, error } = await supabase
            .from('guests')
            .select('id')
            .eq('full_name', orderData.guestName)
            .single();
          return { data, error };
        });
        
        if (guestResult.data) {
          guestId = guestResult.data.id;
        }
      } catch (guestError) {
        console.warn('Could not find guest, proceeding without guest_id:', guestError);
      }

      // Crear la orden principal
      const orderResult = await safeQuery(async () => {
        const { data, error } = await supabase
          .from('orders')
          .insert([{
            room_number: orderData.room.number,
            guest_name: orderData.guestName,
            guest_id: guestId,
            room_price: orderData.roomPrice,
            services_total: orderData.total - orderData.roomPrice,
            total: orderData.total,
            check_in_date: orderData.checkInDate,
            check_in_time: new Date().toISOString(),
            status: 'active'
          }])
          .select()
          .single();
        
        return { data, error };
      });

      if (orderResult.error) {
        console.warn('Could not create order in database:', orderResult.error);
        return createLocalOrder(orderData);
      }

      const newOrder = orderResult.data;

      // Crear los servicios de la orden si hay snacks
      if (orderData.snacks && orderData.snacks.length > 0) {
        try {
          const serviceEntries = orderData.snacks.map(snack => ({
            order_id: newOrder.id,
            service_id: snack.id,
            quantity: snack.quantity,
            unit_price: snack.price,
            total_price: snack.price * snack.quantity
          }));

          const servicesResult = await safeQuery(async () => {
            const { error } = await supabase
              .from('order_services')
              .insert(serviceEntries);
            return { data: null, error };
          });

          if (servicesResult.error) {
            console.warn('Could not create order services:', servicesResult.error);
          }

          // Actualizar stock de servicios
          for (const snack of orderData.snacks) {
            await updateServiceStock(snack.id, -snack.quantity);
          }
        } catch (servicesError) {
          console.warn('Error creating services for order:', servicesError);
        }
      }

      // Actualizar estado de la habitación
      try {
        await safeQuery(async () => {
          const { error } = await supabase
            .from('rooms')
            .update({ status: 'occupied' })
            .eq('number', orderData.room.number);
          return { data: null, error };
        });
      } catch (roomError) {
        console.warn('Could not update room status:', roomError);
      }

      // Recargar datos
      await Promise.all([
        loadActiveOrders(),
        loadRooms(),
        loadSnackItems()
      ]);

      return { success: true, data: newOrder };
    } catch (error) {
      console.error('Error creando orden:', error);
      return createLocalOrder(orderData);
    }
  }, [loadActiveOrders, loadRooms, loadSnackItems]);

  // FIX: Crear orden local cuando Supabase no está disponible - MEMOIZADA
  const createLocalOrder = useCallback((orderData) => {
    const localOrder = {
      id: Date.now(),
      room_number: orderData.room.number,
      guest_name: orderData.guestName,
      room_price: orderData.roomPrice,
      total: orderData.total,
      check_in_date: orderData.checkInDate,
      status: 'active'
    };

    // Actualizar estado local
    setSavedOrders(prev => ({
      ...prev,
      [orderData.room.number]: {
        room: orderData.room,
        roomPrice: orderData.roomPrice,
        snacks: orderData.snacks,
        total: orderData.total,
        checkInDate: orderData.checkInDate,
        guestName: orderData.guestName,
        orderId: localOrder.id
      }
    }));

    return { success: true, data: localOrder, local: true };
  }, []);

  // FIX: Función para actualizar stock de servicios con manejo robusto - MEMOIZADA
  const updateServiceStock = useCallback(async (serviceId, quantityChange) => {
    try {
      const serviceResult = await safeQuery(async () => {
        const { data, error } = await supabase
          .from('services')
          .select('stock_quantity, name')
          .eq('id', serviceId)
          .single();
        return { data, error };
      });

      if (serviceResult.error) {
        console.warn('Could not get service stock:', serviceResult.error);
        return { success: false, error: serviceResult.error };
      }

      const service = serviceResult.data;
      const newStock = service.stock_quantity + quantityChange;
      
      // Verificar que no sea negativo
      if (newStock < 0) {
        throw new Error(`Stock insuficiente para ${service.name}. Stock actual: ${service.stock_quantity}, solicitado: ${Math.abs(quantityChange)}`);
      }

      // Actualizar stock
      const updateResult = await safeQuery(async () => {
        const { error } = await supabase
          .from('services')
          .update({ stock_quantity: newStock })
          .eq('id', serviceId);
        return { data: null, error };
      });

      if (updateResult.error) {
        console.warn('Could not update service stock:', updateResult.error);
        return { success: false, error: updateResult.error };
      }

      return { success: true, newStock };
    } catch (error) {
      console.error('Error actualizando stock de servicio:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // FIX: Función para completar checkout con manejo robusto - MEMOIZADA
  const completeCheckout = useCallback(async (roomNumber, paymentMethod) => {
    try {
      // Completar la orden
      const orderResult = await safeQuery(async () => {
        const { error } = await supabase
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
        return { data: null, error };
      });

      if (orderResult.error) {
        console.warn('Could not complete order in database:', orderResult.error);
        return completeLocalCheckout(roomNumber, paymentMethod);
      }

      // Actualizar estado de la habitación a checkout
      try {
        await safeQuery(async () => {
          const { error } = await supabase
            .from('rooms')
            .update({ status: 'checkout' })
            .eq('number', roomNumber);
          return { data: null, error };
        });
      } catch (roomError) {
        console.warn('Could not update room status:', roomError);
      }

      // Recargar datos
      await Promise.all([
        loadActiveOrders(),
        loadRooms()
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error completando checkout:', error);
      return completeLocalCheckout(roomNumber, paymentMethod);
    }
  }, [loadActiveOrders, loadRooms]);

  // FIX: Completar checkout local cuando Supabase no está disponible - MEMOIZADA
  const completeLocalCheckout = useCallback((roomNumber, paymentMethod) => {
    // Actualizar estado local
    setSavedOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[roomNumber];
      return newOrders;
    });

    // Actualizar estado de habitación localmente
    setFloorRooms(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(floor => {
        updated[floor] = updated[floor].map(room => 
          room.number === roomNumber 
            ? { ...room, status: 'checkout' }
            : room
        );
      });
      return updated;
    });

    return { success: true, local: true };
  }, []);

  // FIX: Función para verificar disponibilidad de stock - MEMOIZADA
  const checkStockAvailability = useCallback((serviceId, requestedQuantity) => {
    for (const categoryItems of Object.values(snackItems)) {
      const item = categoryItems.find(item => item.id === serviceId);
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
    // Si no se encuentra el item, asumir que está disponible (modo fallback)
    return { available: true, currentStock: 100, requested: requestedQuantity, shortfall: 0 };
  }, [snackItems]);

  // FIX: Función para obtener productos con stock bajo - MEMOIZADA
  const getLowStockItems = useCallback(() => {
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
  }, [snackItems]);

  // FIX: Función de inicialización memoizada
  const initializeData = useCallback(async () => {
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
      console.error('Error loading from Supabase:', error);
      setError(error.message);
      // Usar datos de fallback
      const fallbackData = getFallbackData();
      setFloorRooms(fallbackData.rooms);
      setSnackTypes(fallbackData.types);
      setSnackItems(fallbackData.items);
    } finally {
      setLoading(false);
    }
  }, [loadRooms, loadSnackTypes, loadSnackItems, loadActiveOrders, getFallbackData]);

  // FIX: Función para refrescar todos los datos - MEMOIZADA
  const refreshData = useCallback(async () => {
    return initializeData();
  }, [initializeData]);

  // Función para actualizar stock de inventario (alias para compatibilidad)
  const updateInventoryStock = updateServiceStock;

  // FIX: useEffect con dependencias correctas
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // FIX: Suscripción a cambios en tiempo real (con manejo de errores y cleanup)
  useEffect(() => {
    let roomsChannel, servicesChannel, ordersChannel;

    try {
      // Canal para habitaciones
      roomsChannel = supabase
        .channel('rooms_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'rooms' },
          (payload) => {
            console.log('Cambio en habitaciones:', payload);
            loadRooms();
          }
        )
        .subscribe();

      // Canal para servicios
      servicesChannel = supabase
        .channel('services_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'services' },
          (payload) => {
            console.log('Cambio en servicios:', payload);
            loadSnackItems();
          }
        )
        .subscribe();

      // Canal para órdenes
      ordersChannel = supabase
        .channel('orders_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('Cambio en órdenes:', payload);
            loadActiveOrders();
          }
        )
        .subscribe();
    } catch (realtimeError) {
      console.warn('Could not setup realtime subscriptions:', realtimeError);
    }

    // Cleanup
    return () => {
      try {
        if (roomsChannel) supabase.removeChannel(roomsChannel);
        if (servicesChannel) supabase.removeChannel(servicesChannel);
        if (ordersChannel) supabase.removeChannel(ordersChannel);
      } catch (cleanupError) {
        console.warn('Error cleaning up subscriptions:', cleanupError);
      }
    };
  }, [loadRooms, loadSnackItems, loadActiveOrders]);

  // FIX: Retornar objeto memoizado para evitar re-renders innecesarios
  return useMemo(() => ({
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
  }), [
    floorRooms,
    snackTypes,
    snackItems,
    roomPrices,
    savedOrders,
    loading,
    error,
    createOrder,
    completeCheckout,
    updateInventoryStock,
    checkStockAvailability,
    getLowStockItems,
    refreshData,
    loadRooms,
    loadSnackTypes,
    loadSnackItems,
    loadActiveOrders
  ]);
};