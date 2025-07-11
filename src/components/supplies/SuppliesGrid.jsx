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
  User
} from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, getRelativeTime } from '../../utils/formatters';
import classNames from 'classnames';

const SuppliesGrid = ({ 
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
      return { status: 'out', color: 'bg-red-100 text-red-800 border-red-200', label: 'Sin Stock' };
    } else if (supply.currentStock <= supply.minStock) {
      return { status: 'low', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Stock Bajo' };
    } else {
      return { status: 'ok', color: 'bg-green-100 text-green-800 border-green-200', label: 'Stock OK' };
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="mt-4 flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {supplies.map((supply) => {
        const stockInfo = getStockStatus(supply);
        const StockIcon = getStockIcon(stockInfo.status);
        const isSelected = selectedSupplies.includes(supply.id);

        return (
          <div
            key={supply.id}
            className={classNames(
              'bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl relative overflow-hidden',
              isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
            )}
          >
            {/* Status Badge - Posición absoluta corregida */}
            <div className="absolute top-3 right-3 z-10">
              <span className={classNames(
                'px-2 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 shadow-sm',
                stockInfo.color
              )}>
                <StockIcon size={10} />
                <span className="whitespace-nowrap">{stockInfo.label}</span>
              </span>
            </div>

            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-start space-x-3 mb-3 pr-20"> {/* Agregado pr-20 para el badge */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectSupply(supply.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight break-words">
                    {supply.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{supply.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{supply.category}</span>
                  <span className="text-xs font-mono">#{supply.sku}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Stock Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Stock Actual</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {supply.currentStock}
                  </p>
                  <p className="text-xs text-gray-500">{supply.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Stock Mínimo</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {supply.minStock}
                  </p>
                  <p className="text-xs text-gray-500">{supply.unit}</p>
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Nivel de Stock</span>
                  <span>{Math.round((supply.currentStock / (supply.minStock * 2)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={classNames(
                      'h-2 rounded-full transition-all duration-300',
                      supply.currentStock === 0 ? 'bg-red-500' :
                      supply.currentStock <= supply.minStock ? 'bg-yellow-500' : 'bg-green-500'
                    )}
                    style={{ width: `${Math.min(100, Math.max(5, (supply.currentStock / (supply.minStock * 2)) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* Price & Value */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Precio Unitario</p>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(supply.unitPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Valor Total</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(supply.currentStock * supply.unitPrice)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supplier & Last Update */}
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <User size={12} />
                  <span className="truncate">Proveedor: {supply.supplier}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>Actualizado: {getRelativeTime(supply.lastUpdated)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStockAdjustment(supply, -1)}
                    disabled={supply.currentStock === 0}
                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Reducir stock"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xs text-gray-500 px-2 min-w-[2rem] text-center">{supply.currentStock}</span>
                  <button
                    onClick={() => handleStockAdjustment(supply, 1)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Aumentar stock"
                  >
                    <Plus size={16} />
                  </button>
                </div>

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
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit}
                  onClick={() => onEdit(supply)}
                  className="flex-1 text-xs"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => onDelete(supply.id)}
                  className="flex-1 text-xs"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SuppliesGrid;