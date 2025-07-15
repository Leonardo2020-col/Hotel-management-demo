// src/pages/CheckIn/CheckIn.jsx - CORREGIDO PARA EVITAR LOADING INFINITO
import React, { useState, useEffect, useMemo } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import Button from '../../components/common/Button';
import RoomGrid from '../../components/checkin/RoomGrid';
import SnackSelection from '../../components/checkin/SnackSelection';
import CheckoutSummary from '../../components/checkin/CheckoutSummary';
import { useCheckInData } from '../../hooks/useCheckInData';
import { supabase } from '../../lib/supabase';

const CheckIn = () => {
  // Estados principales
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [orderStep, setOrderStep] = useState(0);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [selectedSnackType, setSelectedSnackType] = useState(null);
  const [selectedSnacks, setSelectedSnacks] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Hook personalizado para datos
  const {
    floorRooms,
    snackTypes,
    snackItems,
    roomPrices,
    savedOrders,
    setSavedOrders,
    loading: dataLoading,
    error: dataError,
    createOrder,
    completeCheckout,
    checkStockAvailability,
    updateInventoryStock
  } = useCheckInData();

  // FIX: Estado para manejar habitaciones que necesitan limpieza - INICIALIZADO SIMPLE
  const [roomsNeedingCleaning, setRoomsNeedingCleaning] = useState(new Set());

  // Estado para habitaciones que han sido limpiadas (disponibles)
  const [cleanedRooms, setCleanedRooms] = useState(new Set());

  // FIX: useEffect para inicializar roomsNeedingCleaning cuando floorRooms esté disponible
  useEffect(() => {
    if (floorRooms && typeof floorRooms === 'object') {
      const cleaningRooms = new Set();
      
      Object.values(floorRooms).forEach(floor => {
        if (Array.isArray(floor)) {
          floor.forEach(room => {
            if (room && room.status === 'checkout') {
              cleaningRooms.add(room.number);
            }
          });
        }
      });
      
      // Solo actualizar si hay cambios
      setRoomsNeedingCleaning(prev => {
        const prevArray = Array.from(prev).sort();
        const newArray = Array.from(cleaningRooms).sort();
        
        if (JSON.stringify(prevArray) !== JSON.stringify(newArray)) {
          return cleaningRooms;
        }
        return prev;
      });
    }
  }, [floorRooms]); // Solo depende de floorRooms

  // Función para mostrar notificaciones estilizadas
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // FIX: Memoizar función para determinar el estado real de la habitación
  const getRoomActualStatus = useMemo(() => {
    return (room) => {
      if (!room) return 'available';
      
      if (cleanedRooms.has(room.number)) {
        return 'available';
      }
      
      if (roomsNeedingCleaning.has(room.number)) {
        return 'cleaning';
      }
      
      // Manejar estado 'checkout' de Supabase como 'cleaning'
      if (room.status === 'checkout') {
        return 'cleaning';
      }
      
      if (savedOrders && savedOrders[room.number]) {
        return 'occupied';
      }
      
      return room.status || 'available';
    };
  }, [cleanedRooms, roomsNeedingCleaning, savedOrders]);

  // Handlers para RoomGrid
  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);
    setSelectedRoom(null);
  };

  // Handler para click en habitación
  const handleRoomClick = (room) => {
    if (!room) return;
    
    const actualStatus = getRoomActualStatus(room);
    
    if (checkoutMode) {
      if (savedOrders && savedOrders[room.number]) {
        setSelectedRoom(room);
        setCurrentOrder(savedOrders[room.number]);
        setOrderStep(1);
        setSelectedSnacks(savedOrders[room.number].snacks || []);
      }
    } else {
      if (actualStatus === 'cleaning') {
        handleRoomCleaned(room.number);
      } else if (actualStatus === 'available') {
        setSelectedRoom(room);
        const roomPrice = roomPrices && roomPrices[selectedFloor] ? roomPrices[selectedFloor] : 80;
        setCurrentOrder({
          room: room,
          roomPrice: roomPrice,
          snacks: [],
          total: roomPrice
        });
        setOrderStep(1);
      }
    }
  };

  // Función para manejar limpieza completada
  const handleRoomCleaned = async (roomNumber) => {
    // Remover de habitaciones que necesitan limpieza
    setRoomsNeedingCleaning(prev => {
      const newSet = new Set(prev);
      newSet.delete(roomNumber);
      return newSet;
    });
    
    setCleanedRooms(prev => {
      const newSet = new Set(prev);
      newSet.add(roomNumber);
      return newSet;
    });
    
    // Actualizar estado en Supabase
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'available' })
        .eq('number', roomNumber);
      
      if (error) {
        console.error('Error actualizando estado de habitación:', error);
      }
      
      showNotification(
        `Habitación ${roomNumber} marcada como limpia y disponible`,
        'info'
      );
    } catch (error) {
      console.error('Error actualizando habitación:', error);
      showNotification(
        `Habitación ${roomNumber} marcada como limpia localmente`,
        'info'
      );
    }
  };

  const handleCheckOutClick = () => {
    setCheckoutMode(true);
    setSelectedRoom(null);
    setOrderStep(0);
  };

  const handleCheckInClick = () => {
    setCheckoutMode(false);
    setSelectedRoom(null);
    setOrderStep(0);
  };

  // Handlers para SnackSelection
  const handleSnackTypeSelect = (typeId) => {
    setSelectedSnackType(typeId);
  };

  const handleSnackSelect = (snack) => {
    if (!snack) return;
    
    // Verificar disponibilidad de stock
    const stockCheck = checkStockAvailability(snack.id, 1);
    if (!stockCheck.available) {
      showNotification(
        `Stock insuficiente para ${snack.name}. Stock actual: ${stockCheck.currentStock}`,
        'error'
      );
      return;
    }
    
    const existingSnack = selectedSnacks.find(s => s.id === snack.id);
    if (existingSnack) {
      const newQuantity = existingSnack.quantity + 1;
      const newStockCheck = checkStockAvailability(snack.id, newQuantity);
      
      if (!newStockCheck.available) {
        showNotification(
          `Stock insuficiente para ${snack.name}. Stock actual: ${newStockCheck.currentStock}`,
          'error'
        );
        return;
      }
      
      setSelectedSnacks(selectedSnacks.map(s => 
        s.id === snack.id 
          ? { ...s, quantity: newQuantity }
          : s
      ));
    } else {
      setSelectedSnacks([...selectedSnacks, { ...snack, quantity: 1 }]);
    }
  };

  const handleSnackRemove = (snackId) => {
    setSelectedSnacks(selectedSnacks.filter(s => s.id !== snackId));
  };

  const handleQuantityUpdate = (snackId, newQuantity) => {
    if (newQuantity <= 0) {
      handleSnackRemove(snackId);
    } else {
      // Verificar disponibilidad de stock para la nueva cantidad
      const stockCheck = checkStockAvailability(snackId, newQuantity);
      if (!stockCheck.available) {
        const snack = selectedSnacks.find(s => s.id === snackId);
        showNotification(
          `Stock insuficiente para ${snack?.name}. Stock actual: ${stockCheck.currentStock}`,
          'error'
        );
        return;
      }
      
      setSelectedSnacks(selectedSnacks.map(s => 
        s.id === snackId 
          ? { ...s, quantity: newQuantity }
          : s
      ));
    }
  };

  // Función única para confirmar check-in
  const handleConfirmCheckIn = async () => {
    if (!currentOrder) return;
    
    const snacksTotal = selectedSnacks.reduce((total, snack) => total + (snack.price * snack.quantity), 0);
    const finalOrder = {
      room: currentOrder.room,
      roomPrice: currentOrder.roomPrice,
      snacks: selectedSnacks,
      total: currentOrder.roomPrice + snacksTotal,
      guestName: `Huésped ${currentOrder.room.number}`,
      checkInDate: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toISOString()
    };
    
    // Usar la función createOrder del hook
    const result = await createOrder(finalOrder);
    
    if (result.success) {
      showNotification(
        `Check-in completado exitosamente!\nHabitación ${finalOrder.room.number} - Total: ${finalOrder.total.toFixed(2)}`,
        'success'
      );
      
      // Limpiar estado de habitación limpiada al hacer check-in
      setCleanedRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(finalOrder.room.number);
        return newSet;
      });
      
      resetOrder();
    } else {
      showNotification(
        `Error en check-in: ${result.error}`,
        'error'
      );
    }
  };

  // Función para proceder al pago en checkout
  const handleProceedToPayment = () => {
    if (!currentOrder) return;
    
    // Actualizar la orden actual con snacks adicionales
    const additionalSnacksTotal = selectedSnacks.reduce((total, snack) => total + (snack.price * snack.quantity), 0);
    const originalSnacksTotal = (currentOrder.snacks || []).reduce((total, snack) => total + (snack.price * snack.quantity), 0);
    const allSnacks = [...(currentOrder.snacks || []), ...selectedSnacks];
    
    const updatedOrder = {
      ...currentOrder,
      snacks: allSnacks,
      total: currentOrder.roomPrice + originalSnacksTotal + additionalSnacksTotal
    };
    
    setCurrentOrder(updatedOrder);
    setOrderStep(2);
  };

  // Función para procesar pago
  const handleProcessPayment = async (paymentMethod) => {
    if (!currentOrder) return;
    
    const result = await completeCheckout(currentOrder.room.number, paymentMethod);
    
    if (result.success) {
      showNotification(
        `Pago procesado exitosamente!\nHabitación: ${currentOrder.room.number}\nTotal: ${currentOrder.total.toFixed(2)}\nMétodo: ${paymentMethod}`,
        'success'
      );
      
      setCleanedRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentOrder.room.number);
        return newSet;
      });
      
      setRoomsNeedingCleaning(prev => new Set(prev).add(currentOrder.room.number));
      
      resetOrder();
    } else {
      showNotification(
        `Error procesando pago: ${result.error}`,
        'error'
      );
    }
  };

  const resetOrder = () => {
    setOrderStep(0);
    setSelectedSnackType(null);
    setSelectedSnacks([]);
    setCurrentOrder(null);
    setSelectedRoom(null);
    setCheckoutMode(false);
  };

  // FIX: Agregar verificación adicional para evitar renders innecesarios
  const hasValidData = useMemo(() => {
    return floorRooms && 
           typeof floorRooms === 'object' && 
           Object.keys(floorRooms).length > 0;
  }, [floorRooms]);

  // FIX: Mostrar loading solo cuando realmente esté cargando
  if (dataLoading || !hasValidData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {dataLoading ? 'Cargando datos desde Supabase...' : 'Cargando datos...'}
          </p>
          {dataError && (
            <p className="text-red-600 text-sm mt-2">Error: {dataError}</p>
          )}
        </div>
      </div>
    );
  }

  // FIX: Mostrar error específico si hay problemas
  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error de Conexión</h3>
            <p className="text-red-600 text-sm mb-4">{dataError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Reception Panel</h1>
        </div>

        {/* Componente de Notificación */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : notification.type === 'info'
              ? 'bg-blue-50 border-blue-500 text-blue-800'
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {notification.type === 'success' && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {notification.type === 'info' && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm whitespace-pre-line">{notification.message}</div>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons - Solo mostrar en paso 0 */}
        {orderStep === 0 && (
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant={!checkoutMode ? "primary" : "outline"}
              size="lg"
              icon={LogIn}
              onClick={handleCheckInClick}
              className="px-8 py-4 text-lg"
            >
              Check In
            </Button>
            
            <Button
              variant={checkoutMode ? "danger" : "outline"}
              size="lg"
              icon={LogOut}
              onClick={handleCheckOutClick}
              className="px-8 py-4 text-lg"
            >
              Check Out
            </Button>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="bg-white rounded-lg shadow-lg p-6">

          {/* Paso 0: Grid de Habitaciones */}
          {orderStep === 0 && (
            <RoomGrid
              floorRooms={floorRooms || {}}
              selectedFloor={selectedFloor}
              selectedRoom={selectedRoom}
              checkoutMode={checkoutMode}
              savedOrders={savedOrders || {}}
              roomsNeedingCleaning={roomsNeedingCleaning}
              cleanedRooms={cleanedRooms}
              onFloorChange={handleFloorChange}
              onRoomClick={handleRoomClick}
              onNext={() => {}}
            />
          )}

          {/* Paso 1: Selección de Snacks */}
          {orderStep === 1 && (
            <SnackSelection
              currentOrder={currentOrder}
              selectedSnackType={selectedSnackType}
              selectedSnacks={selectedSnacks}
              snackTypes={snackTypes || []}
              snackItems={snackItems || {}}
              checkoutMode={checkoutMode}
              onBack={() => setOrderStep(0)}
              onSnackTypeSelect={handleSnackTypeSelect}
              onSnackSelect={handleSnackSelect}
              onSnackRemove={handleSnackRemove}
              onQuantityUpdate={handleQuantityUpdate}
              onConfirmOrder={handleConfirmCheckIn}
              onConfirmRoomOnly={handleConfirmCheckIn}
              onCancelOrder={resetOrder}
              onProceedToPayment={handleProceedToPayment}
            />
          )}

          {/* Paso 2: Resumen de Check Out */}
          {orderStep === 2 && checkoutMode && (
            <CheckoutSummary
              currentOrder={currentOrder}
              onBack={() => setOrderStep(1)}
              onProcessPayment={handleProcessPayment}
              onCancel={resetOrder}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default CheckIn;