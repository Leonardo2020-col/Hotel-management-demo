import React, { useState, useEffect } from 'react';
import { X, TrendingDown, AlertTriangle, Plus, Minus } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

const consumptionSchema = yup.object().shape({
  consumptions: yup.array().of(
    yup.object().shape({
      supplyId: yup.string().required('Selecciona un insumo'),
      quantity: yup.number()
        .min(0.1, 'La cantidad debe ser mayor a 0')
        .required('La cantidad es obligatoria')
    })
  ).min(1, 'Debe registrar al menos un consumo')
});

const ConsumptionModal = ({ isOpen, onClose, onSubmit, supply, supplies }) => {
  const [totalValue, setTotalValue] = useState(0);

  // Asegurar que supplies sea un array válido
  const safeSupplies = supplies || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(consumptionSchema),
    defaultValues: {
      consumptions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'consumptions'
  });

  const watchedConsumptions = watch('consumptions');

  // Calcular valor total
  useEffect(() => {
    if (watchedConsumptions && safeSupplies.length > 0) {
      const total = watchedConsumptions.reduce((sum, consumption) => {
        const supplyData = safeSupplies.find(s => s.id === consumption.supplyId);
        if (supplyData && consumption.quantity) {
          return sum + (consumption.quantity * supplyData.unitPrice);
        }
        return sum;
      }, 0);
      setTotalValue(total);
    }
  }, [watchedConsumptions, safeSupplies]);

  // Inicializar con insumos seleccionados
  useEffect(() => {
    if (isOpen) {
      let initialConsumptions = [];
      
      if (supply) {
        // Consumo de un solo insumo
        initialConsumptions = [{
          supplyId: supply.id,
          quantity: 1
        }];
      } else if (safeSupplies.length > 0) {
        // Consumo múltiple
        initialConsumptions = safeSupplies.map(supply => ({
          supplyId: supply.id,
          quantity: 1
        }));
      } else {
        // Consumo vacío
        initialConsumptions = [{
          supplyId: '',
          quantity: 1
        }];
      }
      
      reset({
        consumptions: initialConsumptions
      });
    }
  }, [isOpen, supply, safeSupplies, reset]);

  const onFormSubmit = async (data) => {
    try {
      const consumptionsToSubmit = data.consumptions.map(consumption => {
        const supplyData = safeSupplies.find(s => s.id === consumption.supplyId);
        return {
          ...consumption,
          supplyName: supplyData?.name || '',
          unitPrice: supplyData?.unitPrice || 0,
          unit: supplyData?.unit || '',
          timestamp: new Date().toISOString(),
          type: 'consumption'
        };
      });

      // Enviar cada consumo individualmente
      for (const consumption of consumptionsToSubmit) {
        await onSubmit(consumption);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error recording consumption:', error);
    }
  };

  const handleClose = () => {
    reset();
    setTotalValue(0);
    onClose();
  };

  const addConsumption = () => {
    append({
      supplyId: '',
      quantity: 1
    });
  };

  const getAvailableSupplies = (currentIndex) => {
    // Si hay supplies predefinidos, usar esos
    if (safeSupplies.length > 0) {
      return safeSupplies;
    }
    
    // Si no, filtrar los ya usados
    const usedSupplyIds = watchedConsumptions
      ?.map((c, index) => index !== currentIndex ? c.supplyId : null)
      .filter(Boolean) || [];
    
    return safeSupplies.filter(supply => !usedSupplyIds.includes(supply.id));
  };

  const getSupplyInfo = (supplyId) => {
    return safeSupplies.find(s => s.id === supplyId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrar Consumo</h2>
            <p className="text-gray-600 mt-1">
              {supply ? `Consumo de: ${supply.name}` : 
               safeSupplies.length > 1 ? `Registro de ${safeSupplies.length} insumos` :
               'Registro de consumo de insumos'}
            </p>
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
            
            {/* Consumptions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Insumos a Consumir</h3>
                {!supply && safeSupplies.length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={addConsumption}
                  >
                    Agregar Insumo
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const supplyInfo = getSupplyInfo(watchedConsumptions[index]?.supplyId);
                  const maxQuantity = supplyInfo?.currentStock || 0;
                  const currentQuantity = watchedConsumptions[index]?.quantity || 0;

                  return (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Consumo #{index + 1}</h4>
                        {fields.length > 1 && !supply && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            icon={X}
                            onClick={() => remove(index)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Supply Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Insumo *
                          </label>
                          <select
                            {...register(`consumptions.${index}.supplyId`)}
                            disabled={!!supply || safeSupplies.length > 0}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">Seleccionar insumo</option>
                            {getAvailableSupplies(index).map(supply => (
                              <option key={supply.id} value={supply.id}>
                                {supply.name} (Stock: {supply.currentStock} {supply.unit})
                              </option>
                            ))}
                          </select>
                          {errors.consumptions?.[index]?.supplyId && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.consumptions[index].supplyId.message}
                            </p>
                          )}
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad *
                          </label>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = Math.max(0, currentQuantity - 1);
                                setValue(`consumptions.${index}.quantity`, newValue);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded border border-gray-300 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={maxQuantity}
                              step="0.1"
                              {...register(`consumptions.${index}.quantity`)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = Math.min(maxQuantity, currentQuantity + 1);
                                setValue(`consumptions.${index}.quantity`, newValue);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded border border-gray-300 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {supplyInfo && (
                            <p className="text-xs text-gray-500 mt-1">
                              Disponible: {maxQuantity} {supplyInfo.unit}
                            </p>
                          )}
                          {errors.consumptions?.[index]?.quantity && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.consumptions[index].quantity.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Supply Info - Como en la segunda imagen */}
                      {supplyInfo && (
                        <div className="bg-gray-50 rounded-lg p-3 border-t border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Stock actual:</span>
                              <span className="font-semibold ml-1 text-gray-900">
                                {supplyInfo.currentStock} {supplyInfo.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Precio unitario:</span>
                              <span className="font-semibold ml-1 text-gray-900">
                                {formatCurrency(supplyInfo.unitPrice)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Valor consumo:</span>
                              <span className="font-semibold text-blue-600 ml-1">
                                {formatCurrency(currentQuantity * supplyInfo.unitPrice)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Stock restante:</span>
                              <span className={`font-semibold ml-1 ${
                                (supplyInfo.currentStock - currentQuantity) <= supplyInfo.minStock 
                                  ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {supplyInfo.currentStock - currentQuantity} {supplyInfo.unit}
                              </span>
                            </div>
                          </div>

                          {/* Warning if consumption exceeds stock */}
                          {currentQuantity > supplyInfo.currentStock && (
                            <div className="mt-3 flex items-center text-red-600">
                              <AlertTriangle size={16} className="mr-2" />
                              <span className="text-sm">La cantidad excede el stock disponible</span>
                            </div>
                          )}

                          {/* Warning if resulting stock is below minimum */}
                          {(supplyInfo.currentStock - currentQuantity) <= supplyInfo.minStock && 
                           (supplyInfo.currentStock - currentQuantity) >= 0 && (
                            <div className="mt-3 flex items-center text-yellow-600">
                              <AlertTriangle size={16} className="mr-2" />
                              <span className="text-sm">El stock resultante estará por debajo del mínimo</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {errors.consumptions && (
                <p className="text-red-600 text-sm mt-1">{errors.consumptions.message}</p>
              )}
            </div>


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
              icon={TrendingDown}
              disabled={watchedConsumptions?.some(c => {
                const supplyInfo = getSupplyInfo(c.supplyId);
                return c.quantity > (supplyInfo?.currentStock || 0);
              })}
            >
              Registrar Consumo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumptionModal;