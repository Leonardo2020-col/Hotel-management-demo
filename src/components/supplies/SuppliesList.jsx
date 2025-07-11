import React from 'react';
import { 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Minus,
  Plus,
  TrendingDown,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, getRelativeTime } from '../../utils/formatters';
import classNames from 'classnames';

const SuppliesList = ({ 
  supplies, 
  loading, 
  selectedSupplies, 
  onSelectSupply,
  onEdit,
  onDelete,
  onRecordConsumption,
  onAdjustStock
}) => {

  const getStockStatus = (supply) => {
    if (supply.currentStock === 0) {
      return { status: 'out', color: 'text-red-600', label: 'Sin Stock' };
    } else if (supply.currentStock <= supply.minStock) {
      return { status: 'low', color: 'text-yellow-600', label: 'Stock Bajo' };
    } else {
      return { status: 'ok', color: 'text-green-600', label: 'Stock OK' };
    }
  };

  const getStockIcon = (status) => {
    switch (status) {
      case 'out':
        return AlertTriangle;
      case 'low':
        return AlertTriangle;
      case 'ok':
        return CheckCircle;
      default:
        return Package;
    }
  };

  const handleSelectSupply = (supplyId) => {
    onSelectSupply(prev => 
      prev.includes(supplyId)
        ? prev.filter(id => id !== supplyId)
        : [...prev, supplyId]
    );
  };

  const handleStockAdjustment = (supply, adjustment) => {
    const newStock = Math.max(0, supply.currentStock + adjustment);
    onAdjustStock(supply.id, { 
      newStock, 
      reason: adjustment > 0 ? 'Ajuste de inventario (entrada)' : 'Ajuste de inventario (salida)',
      adjustmentType: adjustment > 0 ? 'increase' : 'decrease',
      quantity: Math.abs(adjustment)
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(8)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedSupplies.length === supplies.length && supplies.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectSupply(supplies.map(s => s.id));
                    } else {
                      onSelectSupply([]);
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Insumo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {supplies.map((supply) => {
              const stockInfo = getStockStatus(supply);
              const StockIcon = getStockIcon(stockInfo.status);
              const isSelected = selectedSupplies.includes(supply.id);

              return (
                <tr 
                  key={supply.id} 
                  className={classNames(
                    'hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-blue-50'
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectSupply(supply.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {/* Supply Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {supply.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {supply.sku}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {supply.category}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStockAdjustment(supply, -1)}
                          disabled={supply.currentStock === 0}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reducir stock"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                          {supply.currentStock} {supply.unit}
                        </span>
                        <button
                          onClick={() => handleStockAdjustment(supply, 1)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Aumentar stock"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Mín: {supply.minStock} | Máx: {supply.maxStock}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StockIcon className={`flex-shrink-0 mr-1.5 h-4 w-4 ${stockInfo.color}`} />
                      <span className={`text-sm font-medium ${stockInfo.color}`}>
                        {stockInfo.label}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(supply.unitPrice)}
                  </td>

                  {/* Total Value */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(supply.currentStock * supply.unitPrice)}
                  </td>

                  {/* Supplier */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {supply.supplier}
                    </div>
                    <div className="text-xs text-gray-500">
                      Actualizado: {getRelativeTime(supply.lastUpdated)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={TrendingDown}
                        onClick={() => onRecordConsumption(supply)}
                        disabled={supply.currentStock === 0}
                        className="text-xs"
                      >
                        Consumir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Edit}
                        onClick={() => onEdit(supply)}
                        className="text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => onDelete(supply.id)}
                        className="text-xs"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {supplies.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron insumos
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default SuppliesList;