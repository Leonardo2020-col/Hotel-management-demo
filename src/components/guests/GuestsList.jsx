import React from 'react';
import { 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, getRelativeTime } from '../../utils/formatters';
import classNames from 'classnames';

const GuestsList = ({ 
  guests, 
  loading, 
  selectedGuests, 
  onSelectGuest,
  onEdit,
  onDelete,
  onViewProfile,
  reservations
}) => {

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-600';
      case 'checked-out':
        return 'text-blue-600';
      case 'blacklisted':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'inactive':
      case 'checked-out':
        return Users;
      case 'blacklisted':
        return XCircle;
      default:
        return Users;
    }
  };

  const getVipBadge = (vipLevel) => {
    switch (vipLevel) {
      case 'gold':
        return { label: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
      case 'silver':
        return { label: 'Silver', color: 'bg-gray-100 text-gray-800' };
      case 'platinum':
        return { label: 'Platinum', color: 'bg-purple-100 text-purple-800' };
      default:
        return null;
    }
  };

  const handleSelectGuest = (guestId) => {
    onSelectGuest(prev => 
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
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
                  checked={selectedGuests.length === guests.length && guests.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectGuest(guests.map(g => g.id));
                    } else {
                      onSelectGuest([]);
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Huésped
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VIP
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Visita
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guests.map((guest) => {
              const StatusIcon = getStatusIcon(guest.status);
              const isSelected = selectedGuests.includes(guest.id);
              const vipBadge = getVipBadge(guest.vipLevel);

              return (
                <tr 
                  key={guest.id} 
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
                      onChange={() => handleSelectGuest(guest.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {/* Guest Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {guest.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {guest.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {guest.country}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{guest.email}</div>
                    <div className="text-sm text-gray-500">{guest.phone}</div>
                  </td>

                  {/* Document */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{guest.documentType}</div>
                    <div className="text-sm text-gray-500">{guest.documentNumber}</div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon className={`flex-shrink-0 mr-1.5 h-4 w-4 ${getStatusColor(guest.status)}`} />
                      <span className={`text-sm font-medium capitalize ${getStatusColor(guest.status)}`}>
                        {guest.status}
                      </span>
                    </div>
                  </td>

                  {/* VIP Level */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vipBadge ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vipBadge.color}`}>
                        <Star size={12} className="mr-1" />
                        {vipBadge.label}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>

                  {/* Statistics */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {guest.totalVisits || 0} visitas
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(guest.totalSpent || 0)} gastado
                    </div>
                  </td>

                  {/* Last Visit */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {guest.lastVisit ? getRelativeTime(guest.lastVisit) : 'Primera visita'}
                    </div>
                    {guest.rating && (
                      <div className="flex items-center">
                        <Star size={12} className="text-yellow-400 fill-current mr-1" />
                        <span className="text-xs text-gray-500">{guest.rating}/5</span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => onViewProfile(guest)}
                        className="text-xs"
                      >
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Edit}
                        onClick={() => onEdit(guest)}
                        className="text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => onDelete(guest.id)}
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
      {guests.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron huéspedes
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default GuestsList;