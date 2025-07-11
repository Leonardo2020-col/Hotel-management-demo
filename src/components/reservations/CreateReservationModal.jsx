import React, { useState } from 'react';
import { X, User, Calendar, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';
import { RESERVATION_STATUS } from '../../utils/reservationMockData';

const schema = yup.object().shape({
  // Guest Information
  guestName: yup.string().required('El nombre es obligatorio'),
  guestEmail: yup.string().email('Email inválido'),
  guestPhone: yup.string(),
  guestDocument: yup.string().required('El documento es obligatorio'),
  
  // Reservation Details
  roomId: yup.number().required('Selecciona una habitación'),
  checkIn: yup.date().required('La fecha de entrada es obligatoria'),
  checkOut: yup.date().required('La fecha de salida es obligatoria')
    .min(yup.ref('checkIn'), 'La fecha de salida debe ser posterior a la entrada')
});

const CreateReservationModal = ({ isOpen, onClose, onSubmit, availableRooms }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  const watchedValues = watch();

  // Actualizar habitación seleccionada
  React.useEffect(() => {
    if (watchedValues.roomId && availableRooms) {
      const room = availableRooms.find(r => r.id === parseInt(watchedValues.roomId));
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [watchedValues.roomId, availableRooms]);

  const onFormSubmit = async (data) => {
    try {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      const reservationData = {
        guest: {
          name: data.guestName,
          email: data.guestEmail || '',
          phone: data.guestPhone || '',
          document: data.guestDocument
        },
        room: selectedRoom,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        nights,
        guests: 1, // Valor por defecto
        status: RESERVATION_STATUS.PENDING
      };

      await onSubmit(reservationData);
      reset();
      setCurrentStep(1);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    reset();
    setCurrentStep(1);
    setSelectedRoom(null);
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: 'Información del Huésped', icon: User },
    { number: 2, title: 'Detalles de la Reserva', icon: Calendar },
    { number: 3, title: 'Confirmación', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nueva Reserva</h2>
            <p className="text-gray-600 mt-1">Crear una nueva reserva para el hotel</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      Paso {step.number}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-6 rounded-full ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Guest Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-6">
                  <User className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Información del Huésped</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      {...register('guestName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Juan Pérez García"
                    />
                    {errors.guestName && (
                      <p className="text-red-600 text-sm mt-1">{errors.guestName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-gray-500">(opcional)</span>
                    </label>
                    <input
                      type="email"
                      {...register('guestEmail')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ejemplo@email.com"
                    />
                    {errors.guestEmail && (
                      <p className="text-red-600 text-sm mt-1">{errors.guestEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono <span className="text-gray-500">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      {...register('guestPhone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+34 600 123 456"
                    />
                    {errors.guestPhone && (
                      <p className="text-red-600 text-sm mt-1">{errors.guestPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documento de Identidad *
                    </label>
                    <input
                      type="text"
                      {...register('guestDocument')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DNI, Pasaporte, etc."
                    />
                    {errors.guestDocument && (
                      <p className="text-red-600 text-sm mt-1">{errors.guestDocument.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Reservation Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Detalles de la Reserva</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Habitación *
                    </label>
                    <select
                      {...register('roomId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar habitación</option>
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Habitación {room.number} - {room.type}
                        </option>
                      ))}
                    </select>
                    {errors.roomId && (
                      <p className="text-red-600 text-sm mt-1">{errors.roomId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Entrada *
                    </label>
                    <input
                      type="date"
                      {...register('checkIn')}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.checkIn && (
                      <p className="text-red-600 text-sm mt-1">{errors.checkIn.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Salida *
                    </label>
                    <input
                      type="date"
                      {...register('checkOut')}
                      min={watchedValues.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.checkOut && (
                      <p className="text-red-600 text-sm mt-1">{errors.checkOut.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Confirmación de Reserva</h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Información del Huésped</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Nombre:</span> <span className="font-medium">{watchedValues.guestName}</span></p>
                      {watchedValues.guestEmail && (
                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{watchedValues.guestEmail}</span></p>
                      )}
                      {watchedValues.guestPhone && (
                        <p><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{watchedValues.guestPhone}</span></p>
                      )}
                      <p><span className="text-gray-600">Documento:</span> <span className="font-medium">{watchedValues.guestDocument}</span></p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Detalles de la Reserva</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Habitación:</span> <span className="font-medium">{selectedRoom?.number} - {selectedRoom?.type}</span></p>
                      <p><span className="text-gray-600">Check-in:</span> <span className="font-medium">{watchedValues.checkIn && new Date(watchedValues.checkIn).toLocaleDateString('es-ES')}</span></p>
                      <p><span className="text-gray-600">Check-out:</span> <span className="font-medium">{watchedValues.checkOut && new Date(watchedValues.checkOut).toLocaleDateString('es-ES')}</span></p>
                      {watchedValues.checkIn && watchedValues.checkOut && (
                        <p><span className="text-gray-600">Noches:</span> <span className="font-medium">{Math.ceil((new Date(watchedValues.checkOut) - new Date(watchedValues.checkIn)) / (1000 * 60 * 60 * 24))}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                >
                  Crear Reserva
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReservationModal;