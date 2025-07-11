// src/components/checkin/RoomGrid.jsx - ACTUALIZADO CON LIMPIEZA
import React from 'react';
import { Bed, ShoppingCart, ChevronRight, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const RoomGrid = ({ 
  floorRooms, 
  selectedFloor, 
  selectedRoom, 
  checkoutMode, 
  savedOrders, 
  roomsNeedingCleaning, // NUEVO: Set de habitaciones que necesitan limpieza
  onFloorChange, 
  onRoomClick, 
  onNext 
}) => {
  
  // NUEVA FUNCIÓN: Determinar el estado real de la habitación
  const getRoomActualStatus = (room) => {
    // Verificar si necesita limpieza (prioridad más alta)
    if (roomsNeedingCleaning && roomsNeedingCleaning.has(room.number)) {
      return 'cleaning';
    }
    
    // Verificar si está ocupada (tiene orden guardada)
    if (savedOrders && savedOrders[room.number]) {
      return 'occupied';
    }
    
    // Estado por defecto del hook
    return room.status || 'available';
  };
  
  // MODIFICADA: Función para obtener colores según el estado real
  const getRoomStatusColor = (room) => {
    const actualStatus = getRoomActualStatus(room);
    
    switch (actualStatus) {
      case 'available': 
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'occupied': 
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'cleaning': 
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'checkout': 
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default: 
        return 'bg-gray-400 text-white cursor-not-allowed';
    }
  };

  // NUEVA FUNCIÓN: Verificar si la habitación es clickeable
  const isRoomClickable = (room) => {
    const actualStatus = getRoomActualStatus(room);
    
    if (checkoutMode) {
      // En modo checkout, solo habitaciones ocupadas son clickeables
      return actualStatus === 'occupied';
    } else {
      // En modo checkin, habitaciones disponibles y que necesitan limpieza son clickeables
      return actualStatus === 'available' || actualStatus === 'cleaning';
    }
  };

  // NUEVA FUNCIÓN: Obtener el ícono apropiado para cada habitación
  const getRoomIcon = (room) => {
    const actualStatus = getRoomActualStatus(room);
    
    if (actualStatus === 'cleaning') {
      return <Sparkles className="w-8 h-8 mx-auto mb-2" />;
    }
    return <Bed className="w-8 h-8 mx-auto mb-2" />;
  };

  // NUEVA FUNCIÓN: Obtener tooltip informativo
  const getRoomTooltip = (room) => {
    const actualStatus = getRoomActualStatus(room);
    
    if (checkoutMode) {
      return actualStatus === 'occupied' 
        ? 'Click para hacer check-out' 
        : 'No disponible para check-out';
    } else {
      switch (actualStatus) {
        case 'cleaning':
          return 'Click para marcar como limpia';
        case 'available':
          return 'Click para hacer check-in';
        case 'occupied':
          return 'Habitación ocupada';
        default:
          return 'Habitación no disponible';
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {checkoutMode ? 'Selecciona habitación para Check Out' : 'Habitaciones'}
        </h2>
        
        {/* Selector de Pisos */}
        <div className="flex space-x-2">
          {[1, 2, 3].map((floor) => (
            <button
              key={floor}
              onClick={() => onFloorChange(floor)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFloor === floor
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Piso {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje de modo */}
      {checkoutMode ? (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            🔴 Modo Check Out: Solo puedes seleccionar habitaciones ocupadas (rojas)
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            🟢 Modo Check In: Selecciona habitaciones verdes para check-in o amarillas para marcar como limpias
          </p>
        </div>
      )}

      {/* Grid de Habitaciones */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {floorRooms[selectedFloor].map((room) => {
          const isClickable = isRoomClickable(room);
          const hasOrder = savedOrders[room.number];
          const actualStatus = getRoomActualStatus(room);
          
          return (
            <button
              key={room.number}
              onClick={() => onRoomClick(room)}
              disabled={!isClickable}
              className={`
                relative p-6 rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-105
                ${getRoomStatusColor(room)}
                ${selectedRoom?.number === room.number ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
                ${!isClickable ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={getRoomTooltip(room)}
            >
              {getRoomIcon(room)}
              <div>{room.number}</div>
              
              {/* Indicador de orden guardada */}
              {hasOrder && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  <ShoppingCart size={12} />
                </div>
              )}

              {/* NUEVO: Indicador especial para habitaciones que necesitan limpieza */}
              {actualStatus === 'cleaning' && (
                <div className="absolute -top-2 -left-2 bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  <Sparkles size={12} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda ACTUALIZADA */}
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span>Ocupada</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span>Necesita Limpieza</span>
          </div>
          <div className="flex items-center">
            <ShoppingCart className="w-4 h-4 mr-2 text-blue-600" />
            <span>Con orden</span>
          </div>
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-600" />
            <span>Limpieza pendiente</span>
          </div>
        </div>

        {/* Botón Siguiente - MODIFICADO para no mostrar en modo limpieza */}
        {selectedRoom && getRoomActualStatus(selectedRoom) !== 'cleaning' && (
          <Button
            variant="primary"
            onClick={onNext}
            icon={ChevronRight}
            className="px-6 py-3"
          >
            {checkoutMode ? 'Ver Resumen de Pago' : 'Siguiente - Agregar Orden'}
          </Button>
        )}
      </div>
    </>
  );
};

export default RoomGrid;