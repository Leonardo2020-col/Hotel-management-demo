import React from 'react';
import { 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import Button from '../common/Button';
import { RESERVATION_STATUS } from '../../utils/reservationMockData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import classNames from 'classnames';

const ReservationList = ({ 
  reservations, 
  loading, 
  onStatusChange,
  onDelete 
}) => {

  const getStatusColor = (status) => {
    switch (status) {
      case RESERVATION_STATUS.CONFIRMED:
        return 'bg-green-100 text-green-800 border-green-200';
      case RESERVATION_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case RESERVATION_STATUS.CHECKED_IN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case RESERVATION_STATUS.CHECKED_OUT:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case RESERVATION_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const StatusActions = ({ reservation }) => {
    const availableActions = [];

    switch (reservation.status) {
      case RESERVATION_STATUS.PENDING:
        availableActions.push(
          { 
            label: 'Confirmar', 
            action: () => onStatusChange(reservation.id, RESERVATION_STATUS.CONFIRMED),
            icon: CheckCircle,
            color: 'success'
          },
          { 
            label: 'Cancelar', 
            action: () => onStatusChange(reservation.id, RESERVATION_STATUS.CANCELLED),
            icon: XCircle,
            color: 'danger'
          }
        );
        break;
      case RESERVATION_STATUS.CONFIRMED:
        availableActions.push(
          { 
            label: 'Check-in', 
            action: () => onStatusChange(reservation.id, RESERVATION_STATUS.CHECKED_IN),
            icon: CheckCircle,
            color: 'primary'
          }
        );
        break;
      case RESERVATION_STATUS.CHECKED_IN:
        availableActions.push(
          { 
            label: 'Check-out', 
            action: () => onStatusChange(reservation.id, RESERVATION_STATUS.CHECKED_OUT),
            icon: CheckCircle,
            color: 'success'
          }
        );
        break;
    }

    return (
      <div className="flex space-x-2">
        {availableActions.map((action, index) => (
          <Button
            key={index}
            size="sm"
            variant={action.color}
            onClick={action.action}
            icon={action.icon}
            className="text-xs px-3 py-1"
          >
            {action.label}
          </Button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-900">
          {reservations.length} reserva{reservations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reservations List */}
      <div className="divide-y divide-gray-200">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              {/* Guest Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {reservation.guest.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Guest Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.guest.name}
                      </h3>
                      <span className={classNames(
                        'px-3 py-1 rounded-full text-xs font-semibold border',
                        getStatusColor(reservation.status)
                      )}>
                        {reservation.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        #{reservation.confirmationCode}
                      </span>
                    </div>

                    {/* Reservation Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>Habitación {reservation.room.number}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>{formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User size={16} />
                        <span>{reservation.guests} huésped{reservation.guests > 1 ? 'es' : ''}</span>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="mb-4">
                      <span className="text-lg font-semibold text-gray-900">
                        Total: {formatCurrency(reservation.totalAmount)}
                      </span>
                    </div>

                    {/* Status Actions */}
                    <StatusActions reservation={reservation} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => console.log('View reservation', reservation.id)}
                    >
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={() => onDelete(reservation.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationList;