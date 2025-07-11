// src/components/dashboard/QuickCheckInModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  User, 
  CreditCard, 
  Mail, 
  Phone, 
  ChevronRight,
  ChevronLeft,
  Home,
  Check,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Button from '../common/Button';

const QuickCheckInModal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1); // 1: Datos del huésped, 2: Selección de habitación
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const [guestData, setGuestData] = useState({
    fullName: '',
    documentId: '',
    email: '',
    phone: ''
  });

  // Datos mock de habitaciones por piso
  const floorData = {
    1: {
      name: 'Primer Piso',
      rooms: {
        top: [101, 102, 103, 104, 105],
        bottom: [106, 107, 108, 109, 110]
      }
    },
    2: {
      name: 'Segundo Piso', 
      rooms: {
        top: [201, 202, 203, 204, 205],
        bottom: [206, 207, 208, 209, 210]
      }
    },
    3: {
      name: 'Tercer Piso',
      rooms: {
        top: [301, 302, 303, 304, 305],
        bottom: [306, 307, 308, 309, 310]
      }
    }
  };

  // Estados de habitaciones (mock)
  const roomStatus = {
    101: 'available', 102: 'occupied', 103: 'available', 104: 'maintenance', 105: 'available',
    106: 'available', 107: 'available', 108: 'occupied', 109: 'available', 110: 'checkout',
    201: 'available', 202: 'available', 203: 'occupied', 204: 'available', 205: 'available',
    206: 'maintenance', 207: 'available', 208: 'available', 209: 'occupied', 210: 'available',
    301: 'available', 302: 'available', 303: 'available', 304: 'available', 305: 'occupied',
    306: 'available', 307: 'checkout', 308: 'available', 309: 'available', 310: 'available'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (step === 1 && guestData.fullName && guestData.documentId) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    if (selectedRoom && guestData.fullName && guestData.documentId) {
      onSubmit({
        guest: guestData,
        room: selectedRoom,
        floor: selectedFloor
      });
      onClose();
    }
  };

  const getRoomStatusColor = (room) => {
    const status = roomStatus[room];
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'occupied': return 'bg-red-500 text-white cursor-not-allowed';
      case 'maintenance': return 'bg-orange-500 text-white cursor-not-allowed';
      case 'checkout': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default: return 'bg-gray-300 text-gray-600 cursor-not-allowed';
    }
  };

  const getRoomStatusText = (room) => {
    const status = roomStatus[room];
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Ocupada';
      case 'maintenance': return 'Mantenimiento';
      case 'checkout': return 'Por limpiar';
      default: return 'No disponible';
    }
  };

  const isRoomSelectable = (room) => {
    const status = roomStatus[room];
    return status === 'available' || status === 'checkout';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Check-in Rápido</h2>
              <p className="text-sm text-gray-600">
                {step === 1 ? 'Paso 1: Datos del huésped' : 'Paso 2: Selección de habitación'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium">Datos del Huésped</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium">Selección de Habitación</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombres Completos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres Completos *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="fullName"
                      value={guestData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre y apellidos completos"
                      required
                    />
                  </div>
                </div>

                {/* Documento de Identidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento de Identidad *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="documentId"
                      value={guestData.documentId}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DNI, Pasaporte, etc."
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Opcional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={guestData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={guestData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Selector de Piso */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Piso</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.keys(floorData).map((floor) => (
                    <button
                      key={floor}
                      onClick={() => {
                        setSelectedFloor(parseInt(floor));
                        setSelectedRoom(null);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedFloor === parseInt(floor)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Home className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">{floorData[floor].name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mapa de Habitaciones */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Habitaciones - {floorData[selectedFloor].name}
                </h3>
                
                {/* Layout del Pasillo */}
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                  {/* Habitaciones Superiores */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <ArrowUp className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 font-medium">Lado Norte</span>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {floorData[selectedFloor].rooms.top.map((room) => (
                        <button
                          key={room}
                          onClick={() => isRoomSelectable(room) && setSelectedRoom(room)}
                          disabled={!isRoomSelectable(room)}
                          className={`
                            relative p-4 rounded-lg border-2 transition-all text-center font-medium
                            ${selectedRoom === room 
                              ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-200' 
                              : 'border-gray-300'
                            }
                            ${getRoomStatusColor(room)}
                          `}
                        >
                          <div className="text-lg font-bold">{room}</div>
                          <div className="text-xs mt-1">{getRoomStatusText(room)}</div>
                          {selectedRoom === room && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pasillo Central */}
                  <div className="my-6 bg-gray-200 h-16 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-medium">PASILLO CENTRAL</span>
                  </div>

                  {/* Habitaciones Inferiores */}
                  <div>
                    <div className="flex items-center mb-2">
                      <ArrowDown className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 font-medium">Lado Sur</span>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {floorData[selectedFloor].rooms.bottom.map((room) => (
                        <button
                          key={room}
                          onClick={() => isRoomSelectable(room) && setSelectedRoom(room)}
                          disabled={!isRoomSelectable(room)}
                          className={`
                            relative p-4 rounded-lg border-2 transition-all text-center font-medium
                            ${selectedRoom === room 
                              ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-200' 
                              : 'border-gray-300'
                            }
                            ${getRoomStatusColor(room)}
                          `}
                        >
                          <div className="text-lg font-bold">{room}</div>
                          <div className="text-xs mt-1">{getRoomStatusText(room)}</div>
                          {selectedRoom === room && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span>Por limpiar</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span>Ocupada</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                    <span>Mantenimiento</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {step === 2 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                icon={ChevronLeft}
              >
                Anterior
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            {step === 1 ? (
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={!guestData.fullName || !guestData.documentId}
                icon={ChevronRight}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!selectedRoom}
                icon={Check}
              >
                Completar Check-in
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCheckInModal;