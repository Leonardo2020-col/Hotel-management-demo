// src/components/checkin/CheckoutSummary.jsx
import React, { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import Button from '../common/Button';

const CheckoutSummary = ({ 
  currentOrder, 
  onBack, 
  onProcessPayment, 
  onCancel 
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  const paymentMethods = [
    { id: 'card', name: 'Tarjeta', icon: '💳' },
    { id: 'cash', name: 'Efectivo', icon: '💵' },
    { id: 'digital', name: 'Digital', icon: '📱' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Resumen de Pago - Check Out</h2>
        <Button
          variant="outline"
          onClick={onBack}
          icon={ChevronLeft}
        >
          Volver
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          {/* Header del huésped */}
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg">
            <h3 className="text-2xl font-bold">Habitación {currentOrder?.room.number}</h3>
            <p className="text-blue-100 mt-1">Huésped: {currentOrder?.guestName}</p>
            <p className="text-blue-100 text-sm">Check-in: {currentOrder?.checkInDate}</p>
          </div>

          {/* Detalles de la cuenta */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Detalles de la Cuenta</h4>
              
              {/* Precio de habitación */}
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <span className="font-medium">Precio de habitación</span>
                  <p className="text-sm text-gray-600">Piso {Math.floor(currentOrder?.room.number / 100)}</p>
                </div>
                <span className="font-bold text-lg">${currentOrder?.roomPrice.toFixed(2)}</span>
              </div>

              {/* Servicios adicionales */}
              {currentOrder?.snacks.length > 0 && (
                <>
                  <div className="py-3">
                    <h5 className="font-medium text-gray-800 mb-2">Servicios Adicionales:</h5>
                    {currentOrder.snacks.map((snack, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">{snack.name}</span>
                          <span className="text-gray-500 text-sm">x{snack.quantity}</span>
                        </div>
                        <span className="font-medium">${(snack.price * snack.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Total */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">Total a Pagar:</span>
                <span className="text-3xl font-bold text-green-600">${currentOrder?.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Métodos de pago */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Método de Pago</h4>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`font-medium ${
                      selectedPaymentMethod === method.id ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {method.icon} {method.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              variant="success"
              onClick={() => onProcessPayment(selectedPaymentMethod)}
              icon={Check}
              className="w-full py-4 text-lg"
            >
              Procesar Pago y Completar Check-out
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;