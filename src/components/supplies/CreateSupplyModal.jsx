import React, { useState } from 'react';
import { X, Package, Plus, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';

const schema = yup.object().shape({
  name: yup.string().required('El nombre del insumo es obligatorio'),
  description: yup.string().required('La descripción es obligatoria'),
  sku: yup.string(), // Ahora opcional
  category: yup.string().required('La categoría es obligatoria'),
  supplier: yup.string(), // Ahora opcional
  unit: yup.string().required('La unidad de medida es obligatoria'),
  unitPrice: yup.number().min(0, 'El precio debe ser positivo').required('El precio unitario es obligatorio'),
  currentStock: yup.number().min(0, 'El stock debe ser positivo').required('El stock inicial es obligatorio'),
  minStock: yup.number().min(0, 'El stock mínimo debe ser positivo').required('El stock mínimo es obligatorio'),
  maxStock: yup.number().min(0, 'El stock máximo debe ser positivo').required('El stock máximo es obligatorio')
});

const CreateSupplyModal = ({ isOpen, onClose, onSubmit, categories, suppliers }) => {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      unit: 'unidad',
      currentStock: 0,
      minStock: 1,
      maxStock: 100
    }
  });

  const watchedMinStock = watch('minStock');
  const watchedMaxStock = watch('maxStock');
  const watchedCurrentStock = watch('currentStock');
  const watchedUnitPrice = watch('unitPrice');

  const onFormSubmit = async (data) => {
    try {
      const supplyData = {
        ...data,
        category: showNewCategory ? newCategory : data.category,
        supplier: showNewSupplier ? newSupplier : data.supplier,
        totalValue: data.currentStock * data.unitPrice,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      await onSubmit(supplyData);
      handleClose();
    } catch (error) {
      console.error('Error creating supply:', error);
    }
  };

  const handleClose = () => {
    reset();
    setShowNewCategory(false);
    setShowNewSupplier(false);
    setNewCategory('');
    setNewSupplier('');
    onClose();
  };

  const units = [
    'unidad', 'kg', 'gramos', 'litros', 'ml', 'metros', 'cm', 
    'caja', 'paquete', 'docena', 'par', 'rollo', 'botella'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nuevo Insumo</h2>
            <p className="text-gray-600 mt-1">Agregar un nuevo insumo al inventario</p>
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Toallas de baño blancas"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU / Código <span className="text-gray-500">(opcional)</span>
                </label>
                <input
                  type="text"
                  {...register('sku')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: TOA-BLA-001"
                />
                {errors.sku && (
                  <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Medida *
                </label>
                <select
                  {...register('unit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-600 text-sm mt-1">{errors.unit.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                {!showNewCategory ? (
                  <div className="flex space-x-2">
                    <select
                      {...register('category')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => setShowNewCategory(true)}
                    >
                      Nueva
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Nueva categoría"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCategory(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
                {errors.category && !showNewCategory && (
                  <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor <span className="text-gray-500">(opcional)</span>
                </label>
                {!showNewSupplier ? (
                  <div className="flex space-x-2">
                    <select
                      {...register('supplier')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar proveedor</option>
                      {suppliers.map(supplier => (
                        <option key={supplier} value={supplier}>
                          {supplier}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => setShowNewSupplier(true)}
                    >
                      Nuevo
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSupplier}
                      onChange={(e) => setNewSupplier(e.target.value)}
                      placeholder="Nuevo proveedor"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewSupplier(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
                {errors.supplier && !showNewSupplier && (
                  <p className="text-red-600 text-sm mt-1">{errors.supplier.message}</p>
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
                placeholder="Describe las características del insumo..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Stock and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Unitario (S/) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('unitPrice')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.unitPrice && (
                  <p className="text-red-600 text-sm mt-1">{errors.unitPrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Inicial *
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('currentStock')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.currentStock && (
                  <p className="text-red-600 text-sm mt-1">{errors.currentStock.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('minStock')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.minStock && (
                  <p className="text-red-600 text-sm mt-1">{errors.minStock.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Máximo *
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('maxStock')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.maxStock && (
                  <p className="text-red-600 text-sm mt-1">{errors.maxStock.message}</p>
                )}
              </div>
            </div>

            {/* Validation Warnings */}
            {(watchedMinStock >= watchedMaxStock && watchedMinStock > 0 && watchedMaxStock > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    El stock mínimo debe ser menor que el stock máximo
                  </p>
                </div>
              </div>
            )}

            {(watchedCurrentStock < watchedMinStock && watchedCurrentStock >= 0 && watchedMinStock > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    El stock inicial está por debajo del mínimo recomendado
                  </p>
                </div>
              </div>
            )}

            {/* Preview */}
            {watchedUnitPrice > 0 && watchedCurrentStock >= 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Resumen</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Valor total del stock:</span>
                    <span className="font-semibold text-blue-900 ml-2">
                      S/ {(watchedCurrentStock * watchedUnitPrice).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Estado inicial:</span>
                    <span className={`font-semibold ml-2 ${
                      watchedCurrentStock === 0 ? 'text-red-600' :
                      watchedCurrentStock <= watchedMinStock ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {watchedCurrentStock === 0 ? 'Sin stock' :
                       watchedCurrentStock <= watchedMinStock ? 'Stock bajo' : 'Stock OK'}
                    </span>
                  </div>
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
              icon={Package}
              disabled={
                (showNewCategory && !newCategory) || 
                (watchedMinStock >= watchedMaxStock && watchedMinStock > 0 && watchedMaxStock > 0)
              }
            >
              Crear Insumo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplyModal;