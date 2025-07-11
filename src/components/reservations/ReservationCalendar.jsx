import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import classNames from 'classnames';
import { RESERVATION_STATUS } from '../../utils/reservationMockData';

const ReservationCalendar = ({ reservations, loading, onSelectReservation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Agrupar reservas por fecha
  const reservationsByDate = useMemo(() => {
    const grouped = {};
    
    reservations.forEach(reservation => {
      const checkInDate = new Date(reservation.checkIn);
      const checkOutDate = new Date(reservation.checkOut);
      
      // Crear rango de fechas para la reserva
      const dateRange = eachDayOfInterval({ start: checkInDate, end: checkOutDate });
      
      dateRange.forEach((date, index) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        
        grouped[dateKey].push({
          ...reservation,
          isCheckIn: index === 0,
          isCheckOut: index === dateRange.length - 1,
          isStay: index > 0 && index < dateRange.length - 1
        });
      });
    });
    
    return grouped;
  }, [reservations]);

  const getReservationsForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return reservationsByDate[dateKey] || [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RESERVATION_STATUS.CONFIRMED:
        return 'bg-green-500';
      case RESERVATION_STATUS.PENDING:
        return 'bg-yellow-500';
      case RESERVATION_STATUS.CHECKED_IN:
        return 'bg-blue-500';
      case RESERVATION_STATUS.CHECKED_OUT:
        return 'bg-gray-500';
      case RESERVATION_STATUS.CANCELLED:
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const ReservationDot = ({ reservation, type }) => (
    <div
      className={classNames(
        'w-2 h-2 rounded-full',
        getStatusColor(reservation.status),
        type === 'checkIn' && 'ring-2 ring-white',
        type === 'checkOut' && 'ring-2 ring-gray-300'
      )}
      title={`${reservation.guest.name} - ${reservation.status}`}
    />
  );

  const DayCell = ({ date }) => {
    const dayReservations = getReservationsForDate(date);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentDay = isToday(date);

    return (
      <div
        className={classNames(
          'min-h-[120px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors',
          !isCurrentMonth && 'bg-gray-50 text-gray-400',
          isSelected && 'bg-blue-50 border-blue-300',
          isCurrentDay && 'bg-yellow-50'
        )}
        onClick={() => setSelectedDate(date)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={classNames(
            'text-sm font-medium',
            isCurrentDay && 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
          )}>
            {format(date, 'd')}
          </span>
          {dayReservations.length > 0 && (
            <span className="text-xs text-gray-500">
              {dayReservations.length}
            </span>
          )}
        </div>

        <div className="space-y-1">
          {dayReservations.slice(0, 3).map((reservationData, index) => {
            const { reservation, isCheckIn, isCheckOut, isStay } = reservationData;
            
            return (
              <div
                key={`${reservation.id}-${index}`}
                className={classNames(
                  'text-xs p-1 rounded cursor-pointer hover:opacity-75',
                  getStatusColor(reservation.status).replace('bg-', 'bg-opacity-20 bg-'),
                  'text-gray-800 border-l-2',
                  getStatusColor(reservation.status).replace('bg-', 'border-')
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectReservation(reservation);
                }}
              >
                <div className="flex items-center space-x-1">
                  {isCheckIn && <span className="text-green-600 font-bold">→</span>}
                  {isCheckOut && <span className="text-red-600 font-bold">←</span>}
                  <span className="truncate">
                    {reservation.guest.name} - {reservation.room.number}
                  </span>
                </div>
              </div>
            );
          })}
          
          {dayReservations.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{dayReservations.length - 3} más
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 mt-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Confirmada</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Pendiente</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Check-in</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Check-out</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-green-600 font-bold">→</span>
            <span>Llegada</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-red-600 font-bold">←</span>
            <span>Salida</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month start */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[120px]"></div>
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map(date => (
            <DayCell key={format(date, 'yyyy-MM-dd')} date={date} />
          ))}
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
          </h3>
          
          {getReservationsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getReservationsForDate(selectedDate).map((reservationData, index) => {
                const { reservation, isCheckIn, isCheckOut } = reservationData;
                
                return (
                  <div 
                    key={`${reservation.id}-${index}`}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={classNames(
                        'w-3 h-3 rounded-full',
                        getStatusColor(reservation.status)
                      )}></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reservation.guest.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Habitación {reservation.room.number} - {reservation.room.type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {isCheckIn && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Llegada
                          </span>
                        )}
                        {isCheckOut && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Salida
                          </span>
                        )}
                        <span className={classNames(
                          'text-xs px-2 py-1 rounded',
                          getStatusColor(reservation.status).replace('bg-', 'bg-opacity-20 bg-')
                        )}>
                          {reservation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No hay reservas para esta fecha</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationCalendar;