// src/pages/CheckIn/CheckIn.jsx - CORREGIDO PARA TRABAJAR CON EL HOOK
import React, { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import Button from '../../components/common/Button';
import RoomGrid from '../../components/checkin/RoomGrid';
import SnackSelection from '../../components/checkin/SnackSelection';
import CheckoutSummary from '../../components/checkin/CheckoutSummary';
import { useCheckInData } from '../../hooks/useCheckInData';

const CheckIn = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [orderStep, setOrderStep] = useState(0);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [selectedSnackType, setSelectedSnackType] = useState(null);
  const [selectedSnacks, setSelectedSnacks] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  // NUEVO: Estado para manejar habitaciones que necesitan limpieza
  // Inicializar con habitaciones que ya tienen status 'checkout'
  const [roomsNeedingCleaning, setRoomsNeedingCleaning] = useState(() => {
    const cleaningRooms = new Set();
    Object.values(floorRooms).forEach(floor => {
      floor.forEach(room => {
        if (room.status === 'checkout') {
          cleaningRooms.add(room.number);
        }
      });
    });
    return cleaningRooms;
  });

  // Hook personalizado para datos
  const {
    floorRooms,
    snackTypes,
    snackItems,
    roomPrices,
    savedOrders,
    setSavedOrders
  } = useCheckInData();

  // NUEVA FUNCIÓN: Determinar el estado real de la habitación
  const getRoomActualStatus = (room) => {
    // Verificar si necesita limpieza (prioridad más alta)
    if (roomsNeedingCleaning.has(room.number)) {
      return 'cleaning';
    }
    
    // Verificar si está ocupada (tiene orden guardada)
    if (savedOrders[room.number]) {
      return 'occupied';
    }
    
    // Estado por defecto del hook
    return room.status || 'available';
  };

  // Handlers para RoomGrid
  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);
    setSelectedRoom(null);
  };

  // MODIFICADO: handleRoomClick simplificado
  const handleRoomClick = (room) => {
    if (checkoutMode) {
      // En modo checkout, solo habitaciones ocupadas
      if (savedOrders[room.number]) {
        setSelectedRoom(room);
        setCurrentOrder(savedOrders[room.number]);
        setOrderStep(2);
      }
    } else {
      // En modo checkin
      if (roomsNeedingCleaning.has(room.number)) {
        // Si la habitación necesita limpieza (amarilla), marcarla como disponible
        handleRoomCleaned(room.number);
      } else if (!savedOrders[room.number] && room.status !== 'occupied') {
        // Si está disponible (verde), iniciar check-in
        setSelectedRoom(room);
        setCurrentOrder({
          room: room,
          roomPrice: roomPrices[selectedFloor],
          snacks: [],
          total: roomPrices[selectedFloor]
        });
        setOrderStep(1);
      }
    }
  };

  // NUEVA FUNCIÓN: Manejar limpieza completada
  const handleRoomCleaned = (roomNumber) => {
    setRoomsNeedingCleaning(prev => {
      const newSet = new Set(prev);
      newSet.delete(roomNumber);
      return newSet;
    });
    
    alert(`Habitación ${roomNumber} marcada como limpia y disponible`);
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
    const existingSnack = selectedSnacks.find(s => s.id === snack.id);
    if (existingSnack) {
      setSelectedSnacks(selectedSnacks.map(s => 
        s.id === snack.id 
          ? { ...s, quantity: s.quantity + 1 }
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
      setSelectedSnacks(selectedSnacks.map(s => 
        s.id === snackId 
          ? { ...s, quantity: newQuantity }
          : s
      ));
    }
  };

  // Agregar orden a savedOrders al confirmar
  const handleConfirmOrder = () => {
    const snacksTotal = selectedSnacks.reduce((total, snack) => total + (snack.price * snack.quantity), 0);
    const finalOrder = {
      ...currentOrder,
      snacks: selectedSnacks,
      total: currentOrder.roomPrice + snacksTotal,
      guestName: `Huésped ${currentOrder.room.number}`,
      checkInDate: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toISOString()
    };
    
    // Guardar la orden para poder hacer checkout después
    setSavedOrders(prev => ({
      ...prev,
      [finalOrder.room.number]: finalOrder
    }));
    
    console.log('Orden confirmada:', finalOrder);
    alert(`Check-in completado!\nHabitación: ${finalOrder.room.number}\nPrecio habitación: $${finalOrder.roomPrice.toFixed(2)}\nSnacks: $${snacksTotal.toFixed(2)}\nTotal: $${finalOrder.total.toFixed(2)}`);
    resetOrder();
  };

  // Agregar orden a savedOrders al confirmar solo habitación
  const handleConfirmRoomOnly = () => {
    const finalOrder = {
      ...currentOrder,
      snacks: [],
      total: currentOrder.roomPrice,
      guestName: `Huésped ${currentOrder.room.number}`,
      checkInDate: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toISOString()
    };
    
    // Guardar la orden para poder hacer checkout después
    setSavedOrders(prev => ({
      ...prev,
      [finalOrder.room.number]: finalOrder
    }));
    
    console.log('Habitación confirmada sin snacks:', finalOrder);
    alert(`Check-in completado!\nHabitación: ${finalOrder.room.number}\nTotal: $${finalOrder.total.toFixed(2)}`);
    resetOrder();
  };

  // MODIFICADO: Manejar checkout y marcar habitación para limpieza
  const handleProcessPayment = (paymentMethod) => {
    if (currentOrder) {
      alert(`Pago procesado exitosamente!\nHabitación: ${currentOrder.room.number}\nHuésped: ${currentOrder.guestName}\nTotal: $${currentOrder.total.toFixed(2)}\nMétodo: ${paymentMethod}\n\nCheck-out completado.`);
      
      // Remover la orden guardada
      const newSavedOrders = { ...savedOrders };
      delete newSavedOrders[currentOrder.room.number];
      setSavedOrders(newSavedOrders);
      
      // NUEVO: Marcar habitación como necesitando limpieza
      setRoomsNeedingCleaning(prev => new Set(prev).add(currentOrder.room.number));
      
      resetOrder();
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Reception Panel</h1>
        </div>

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
              floorRooms={floorRooms}
              selectedFloor={selectedFloor}
              selectedRoom={selectedRoom}
              checkoutMode={checkoutMode}
              savedOrders={savedOrders}
              roomsNeedingCleaning={roomsNeedingCleaning}
              onFloorChange={handleFloorChange}
              onRoomClick={handleRoomClick}
              onNext={() => {}}
            />
          )}

          {/* Paso 1: Selección de Snacks */}
          {orderStep === 1 && !checkoutMode && (
            <SnackSelection
              currentOrder={currentOrder}
              selectedSnackType={selectedSnackType}
              selectedSnacks={selectedSnacks}
              snackTypes={snackTypes}
              snackItems={snackItems}
              onBack={() => setOrderStep(0)}
              onSnackTypeSelect={handleSnackTypeSelect}
              onSnackSelect={handleSnackSelect}
              onSnackRemove={handleSnackRemove}
              onQuantityUpdate={handleQuantityUpdate}
              onConfirmOrder={handleConfirmOrder}
              onConfirmRoomOnly={handleConfirmRoomOnly}
              onCancelOrder={resetOrder}
            />
          )}

          {/* Paso 2: Resumen de Check Out */}
          {orderStep === 2 && checkoutMode && (
            <CheckoutSummary
              currentOrder={currentOrder}
              onBack={() => setOrderStep(0)}
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