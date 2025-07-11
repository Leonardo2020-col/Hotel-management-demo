// src/components/checkin/SnackSelection.jsx
import React from 'react';
import { ChevronLeft, Check, ShoppingCart } from 'lucide-react';
import Button from '../common/Button';

const SnackSelection = ({ 
  currentOrder,
  selectedSnackType,
  selectedSnacks,
  snackTypes,
  snackItems,
  onBack,
  onSnackTypeSelect,
  onSnackSelect,
  onSnackRemove,
  onQuantityUpdate,
  onConfirmOrder,
  onConfirmRoomOnly,
  onCancelOrder
}) => {

  const getTotalSnacks = () => {
    return selectedSnacks.reduce((total, snack) => total + (snack.price * snack.quantity), 0);
  };

  const getTotalOrder = () => {
    return currentOrder?.roomPrice + getTotalSnacks();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Habitación {currentOrder?.room.number} - Snacks (Opcional)
        </h2>
        <div className="flex items-center space-x-3">
          <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
            💡 Los snacks son opcionales
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            icon={ChevronLeft}
          >
            Volver
          </Button>
        </div>
      </div>

      {/* 3 Columnas Grid */}
      <div className="grid grid-cols-3 gap-6 h-[600px]">
        
        {/* Columna 1: Tipos de Snack */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">TIPOS DE SNACK</h3>
          <div className="space-y-4">
            {snackTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onSnackTypeSelect(type.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedSnackType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <h4 className="font-bold text-sm mb-1">{type.name}</h4>
                <p className="text-xs text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Columna 2: Lista de Snacks */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {selectedSnackType 
              ? snackTypes.find(t => t.id === selectedSnackType)?.name 
              : 'LISTA DE SNACKS'
            }
          </h3>
          
          {selectedSnackType ? (
            <div className="space-y-3 overflow-y-auto h-[500px]">
              {snackItems[selectedSnackType]?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSnackSelect(item)}
                  className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-green-600 font-bold text-sm">${item.price.toFixed(2)}</p>
                    </div>
                    {selectedSnacks.find(s => s.id === item.id) && (
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {selectedSnacks.find(s => s.id === item.id)?.quantity}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-gray-500">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Selecciona un tipo de snack para ver la lista</p>
              </div>
            </div>
          )}
        </div>

        {/* Columna 3: Resumen de la Orden */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">RESUMEN DE LA ORDEN</h3>
          
          <div className="bg-white rounded-lg p-4 h-[500px] overflow-y-auto">
            {/* Header de la habitación */}
            <div className="text-center mb-4 p-3 bg-blue-600 text-white rounded-lg">
              <h4 className="font-bold">Habitación {currentOrder?.room.number}</h4>
            </div>

            {/* Precio de la habitación */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-sm">Precio habitación</span>
                <span className="font-bold">${currentOrder?.roomPrice.toFixed(2)}</span>
              </div>

              {/* Snacks seleccionados */}
              {selectedSnacks.length > 0 ? (
                selectedSnacks.map((snack) => (
                  <div key={snack.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{snack.name}</span>
                        <button
                          onClick={() => onSnackRemove(snack.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onQuantityUpdate(snack.id, snack.quantity - 1)}
                          className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs w-6 text-center">{snack.quantity}</span>
                        <button
                          onClick={() => onQuantityUpdate(snack.id, snack.quantity + 1)}
                          className="w-5 h-5 bg-green-500 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-bold ml-2">
                      ${(snack.price * snack.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm mb-2">🍎 No hay snacks seleccionados</p>
                  <p className="text-xs text-gray-400">Puedes confirmar solo la habitación o agregar snacks</p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t-2 border-gray-300 pt-4 mb-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">
                  ${getTotalOrder().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              {/* Botón para solo habitación - siempre disponible */}
              <Button
                variant="success"
                onClick={onConfirmRoomOnly}
                className="w-full text-sm py-3"
              >
                ✅ Confirmar Solo Habitación
                <div className="text-xs opacity-90">${currentOrder?.roomPrice.toFixed(2)}</div>
              </Button>
              
              {/* Botón para habitación + snacks - solo si hay snacks */}
              {selectedSnacks.length > 0 && (
                <Button
                  variant="primary"
                  onClick={onConfirmOrder}
                  icon={Check}
                  className="w-full text-sm py-3"
                >
                  🛒 Confirmar con Snacks
                  <div className="text-xs opacity-90">${getTotalOrder().toFixed(2)} total</div>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={onCancelOrder}
                className="w-full text-sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SnackSelection;