// src/hooks/useCheckInData.js - CORREGIDO PARA USAR TABLA SERVICES
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

  // Cargar tipos de servicios desde Supabase
  const loadSnackTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;

      const formattedTypes = data.map(type => ({
        id: type.id,
        name: type.name,
        description: type.description || type.name
      }));

      setSnackTypes(formattedTypes);
      return formattedTypes;
    } catch (error) {
      console.error('Error cargando tipos de servicios:', error);
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

  // Cargar servicios/snacks desde Supabase
  const loadSnackItems = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('available', true)
        .gt('stock_quantity', 0)
        .order('category, name');

      if (error) throw error;

      // Agrupar por categoría/tipo
      const groupedItems = {};
      
      data.forEach(item => {
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
      
      // Fallback a datos estáticos
      const fallbackItems = {
        frutas: [
          { id: 1, name: 'Manzana', price: 2.50, stock: 50 },
          { id: 2, name: 'Plátano', price: 1.50, stock: 30 }
        ],
        bebidas: [
          { id: 6, name: 'Agua', price: 1.00, stock: 100 },
          { id: 7, name: 'Coca Cola', price: 2.50, stock: 80 }
        ],
        snacks: [
          { id: 11, name: 'Papas fritas', price: 3.50, stock: 40 }
        ],
        postres: [
          { id: 16, name: 'Helado', price: 4.00, stock: 30 }
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
      // Obtener guest_id si existe el huésped
      let guestId = null;
      const { data: guestData } = await supabase
        .from('guests')
        .select('id')
        .eq('full_name', orderData.guestName)
        .single();
      
      if (guestData) {
        guestId = guestData.id;
      }

      // Crear la orden principal
      const { data: newOrder, error: orderError } = await supabase
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

      if (orderError) throw orderError;

      // Crear los servicios de la orden si hay snacks
      if (orderData.snacks && orderData.snacks.length > 0) {
        const serviceEntries = orderData.snacks.map(snack => ({
          order_id: newOrder.id,
          service_id: snack.id,
          quantity: snack.quantity,
          unit_price: snack.price,
          total_price: snack.price * snack.quantity
        }));

        const { error: servicesError } = await supabase
          .from('order_services')
          .insert(serviceEntries);

        if (servicesError) throw servicesError;

        // Actualizar stock de servicios
        for (const snack of orderData.snacks) {
          await updateServiceStock(snack.id, -snack.quantity);
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

  // Función para actualizar stock de servicios
  const updateServiceStock = async (serviceId, quantityChange) => {
    try {
      // Obtener stock actual
      const { data: service, error: getError } = await supabase
        .from('services')
        .select('stock_quantity, name')
        .eq('id', serviceId)
        .single();

      if (getError) throw getError;

      const newStock = service.stock_quantity + quantityChange;
      
      // Verificar que no sea negativo
      if (newStock < 0) {
        throw new Error(`Stock insuficiente para ${service.name}. Stock actual: ${service.stock_quantity}, solicitado: ${Math.abs(quantityChange)}`);
      }

      // Actualizar stock
      const { error: updateError } = await supabase
        .from('services')
        .update({ stock_quantity: newStock })
        .eq('id', serviceId);

      if (updateError) throw updateError;

      return { success: true, newStock };
    } catch (error) {
      console.error('Error actualizando stock de servicio:', error);
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

  // Función para verificar disponibilidad de stock
  const checkStockAvailability = (serviceId, requestedQuantity) => {
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

  // Función para actualizar stock de inventario (alias para compatibilidad)
  const updateInventoryStock = updateServiceStock;

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

    // Canal para servicios
    const servicesChannel = supabase
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
      supabase.removeChannel(servicesChannel);
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