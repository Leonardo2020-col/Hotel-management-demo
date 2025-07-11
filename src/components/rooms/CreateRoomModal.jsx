import React, { useState } from 'react';
import { X, Bed, Users, Maximize, DollarSign, MapPin, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';
import { ROOM_FEATURES } from '../../utils/roomMockData';

const schema = yup.object().shape({
  number: yup.string().required('El número de habitación es obligatorio'),
  floor: yup.number().min(1, 'El piso debe ser mayor a 0').required('El piso es obligatorio'),
  type: yup.string().required('El tipo es obligatorio'),
  capacity: yup.number().min(1, 'La capacidad debe ser mayor a 0').required('La capacidad es obligatoria'),
  size: yup.number().min(1, 'El tamaño debe ser mayor a 0').required('El tamaño es obligatorio'),
  rate: yup.number().min(0, 'La tarifa debe ser positiva').required('La tarifa es obligatoria'),
  description: yup.string().required('La descripción es obligatoria'),
  beds: yup.array().of(
    yup.object().shape({
      type: yup.string().required('Tipo de cama requerido'),
      count: yup.number().min(1, 'Cantidad debe ser mayor a 0').required('Cantidad requerida')
    })
  ).min(1, 'Debe tener al menos una cama'),
  features: yup.array().min(1, 'Debe seleccionar al menos una característica')
});

const CreateRoomModal = ({ isOpen, onClose, onSubmit, roomTypes }) => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      beds: [{ type: 'Doble', count: 1 }],
      features: []
    }
  });

  const { fields: bedFields, append: addBed, remove: removeBed } = useFieldArray({
    control,
    name: 'beds'
  });

  const watchedType = watch('type');

  // Auto-completar campos basado en tipo seleccionado
  React.useEffect(() => {
    if (watchedType && roomTypes) {
      const selectedType = roomTypes.find(type => type.name === watchedType);
      if (selectedType) {
        setValue('capacity', selectedType.capacity);
        setValue('size', selectedType.size);
        setValue('rate', selectedType.baseRate);
        setValue('description', selectedType.description);
        setSelectedFeatures(selectedType.features);
        setValue('features', selectedType.features);
      }
    }
  }, [watchedType, roomTypes, setValue]);

  const handleFeatureToggle = (feature) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    
    setSelectedFeatures(newFeatures);
    setValue('features', newFeatures);
  };

  const onFormSubmit = async (data) => {
    try {
      const roomData = {
        ...data,
        features: selectedFeatures
      };
      await onSubmit(roomData);
      handleClose();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedFeatures([]);
    onClose();
  };

  const bedTypeOptions = [
    'Individual',
    'Doble',
    'Queen',
    'King',
    'Sofá Cama',
    'Litera'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nueva Habitación</h2>
            <p className="text-gray-600 mt-1">Agregar una nueva habitación al inventario</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Habitación *
                </label>
                <input
                  type="text"
                  {...register('number')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 101, A-15"
                />
                {errors.number && (
                  <p className="text-red-600 text-sm mt-1">{errors.number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Piso *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  {...register('floor')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.floor && (
                  <p className="text-red-600 text-sm mt-1">{errors.floor.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Habitación *
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar tipo</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad (huéspedes) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  {...register('capacity')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.capacity && (
                  <p className="text-red-600 text-sm mt-1">{errors.capacity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño (m²) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  {...register('size')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.size && (
                  <p className="text-red-600 text-sm mt-1">{errors.size.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa por Noche (S/) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('rate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.rate && (
                  <p className="text-red-600 text-sm mt-1">{errors.rate.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe las características principales de la habitación..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Beds Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Configuración de Camas *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => addBed({ type: 'Individual', count: 1 })}
                >
                  Agregar Cama
                </Button>
              </div>

              <div className="space-y-3">
                {bedFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <select
                        {...register(`beds.${index}.type`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {bedTypeOptions.map(bedType => (
                          <option key={bedType} value={bedType}>
                            {bedType}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        {...register(`beds.${index}.count`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Cant."
                      />
                    </div>
                    {bedFields.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => removeBed(index)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.beds && (
                <p className="text-red-600 text-sm mt-1">{errors.beds.message}</p>
              )}
            </div>

            {/* Features Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Características y Amenidades *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(ROOM_FEATURES).map((feature) => (
                  <label 
                    key={feature}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">{feature}</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </label>
                ))}
              </div>
              {errors.features && (
                <p className="text-red-600 text-sm mt-1">{errors.features.message}</p>
              )}
              
              {selectedFeatures.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Características seleccionadas ({selectedFeatures.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeatures.map((feature) => (
                      <span 
                        key={feature}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Card */}
            {watch('number') && watch('type') && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Vista Previa</h4>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-lg font-bold text-gray-900">
                      Habitación {watch('number')}
                    </h5>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Disponible
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} />
                      <span>Piso {watch('floor')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Maximize size={14} />
                      <span>{watch('size')}m²</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={14} />
                      <span>Max {watch('capacity')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={14} />
                      <span className="font-semibold text-blue-600">S/ {watch('rate')}/noche</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">{watch('type')}</span>
                  </div>
                  
                  {watch('description') && (
                    <p className="text-sm text-gray-600 mb-3">{watch('description')}</p>
                  )}
                  
                  {bedFields.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Camas:</p>
                      <div className="flex flex-wrap gap-2">
                        {bedFields.map((bed, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center space-x-1"
                          >
                            <Bed size={12} />
                            <span>{watch(`beds.${index}.count`)} {watch(`beds.${index}.type`)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedFeatures.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Características:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedFeatures.slice(0, 4).map((feature) => (
                          <span 
                            key={feature}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {selectedFeatures.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{selectedFeatures.length - 4} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              icon={Bed}
            >
              Crear Habitación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;