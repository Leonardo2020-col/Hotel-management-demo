// src/pages/Reservations/Reservations.jsx - ACTUALIZADO CON RESTRICCIONES POR ROL
import React, { useState } from 'react';
import { Plus, Calendar, Filter, Download, Upload, Lock, AlertCircle } from 'lucide-react';
import { useReservations } from '../../hooks/useReservations';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import ReservationFilters from '../../components/reservations/ReservationFilters';
import ReservationList from '../../components/reservations/ReservationList';
import ReservationStats from '../../components/reservations/ReservationStats';
import CreateReservationModal from '../../components/reservations/CreateReservationModal';
import ReservationCalendar from '../../components/reservations/ReservationCalendar';

const Reservations = () => {
  const { hasPermission, hasRole } = useAuth();
  const canWrite = hasPermission('reservations', 'write');
  const isAdmin = hasRole('admin');

  const {
    reservations,
    allReservations,
    loading,
    filters,
    setFilters,
    pagination,
    setPagination,
    createReservation,
    updateReservation,
    deleteReservation,
    changeReservationStatus,
    getReservationStats,
    availableRooms
  } = useReservations();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [selectedReservation, setSelectedReservation] = useState(null);

  const stats = getReservationStats();

  // Filtrar reservas según el rol
  const getFilteredReservations = () => {
    let filteredReservations = reservations;

    // Si es administrador, mostrar solo las reservas limitadas (ejemplo: solo las de hoy o próximas)
    if (isAdmin) {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      filteredReservations = reservations.filter(reservation => {
        const checkInDate = new Date(reservation.checkIn);
        return checkInDate >= today && checkInDate <= nextWeek;
      });
    }

    return filteredReservations;
  };

  const filteredReservations = getFilteredReservations();

  const handleCreateReservation = async (reservationData) => {
    if (!canWrite) {
      alert('No tienes permisos para crear reservas');
      return;
    }

    try {
      await createReservation(reservationData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  const handleExportReservations = () => {
    // Implementar exportación a CSV/Excel
    console.log('Exporting reservations...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
            {isAdmin && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-lg">
                <Lock size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Vista Limitada</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? 'Vista limitada: Reservas de los próximos 7 días'
              : 'Administra todas las reservas del hotel'
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          {!canWrite && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700">Solo lectura</span>
            </div>
          )}
          
          {canWrite && (
            <>
              <Button
                variant="outline"
                icon={Upload}
                onClick={handleExportReservations}
              >
                Importar
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={handleExportReservations}
              >
                Exportar
              </Button>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
              >
                Nueva Reserva
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Admin Restriction Notice */}
      {isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">Acceso Limitado</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Como administrador, solo puedes ver las reservas de los próximos 7 días. 
                Para acceso completo a reservas, inicia sesión como personal de recepción.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <ReservationStats 
        stats={isAdmin ? {
          ...stats,
          total: filteredReservations.length,
          // Recalcular stats solo para las reservas filtradas
        } : stats} 
        loading={loading} 
      />

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            Lista
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setViewMode('calendar')}
            size="sm"
            icon={Calendar}
          >
            Calendario
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          {filteredReservations.length} reserva{filteredReservations.length !== 1 ? 's' : ''} 
          {isAdmin && (
            <span className="text-yellow-600 font-medium"> (vista limitada)</span>
          )}
          {filters.search || filters.status || filters.dateRange ? ' (filtradas)' : ''}
        </div>
      </div>

      {/* Filters */}
      <ReservationFilters 
        filters={filters}
        onFiltersChange={setFilters}
        loading={loading}
      />

      {/* Content */}
      {viewMode === 'list' ? (
        <ReservationList
          reservations={filteredReservations}
          loading={loading}
          pagination={pagination}
          onPaginationChange={setPagination}
          onStatusChange={canWrite ? changeReservationStatus : null}
          onEdit={canWrite ? setSelectedReservation : null}
          onDelete={canWrite ? deleteReservation : null}
          readOnly={!canWrite}
        />
      ) : (
        <ReservationCalendar
          reservations={isAdmin ? filteredReservations : allReservations}
          loading={loading}
          onSelectReservation={setSelectedReservation}
          readOnly={!canWrite}
        />
      )}

      {/* Create Reservation Modal - Solo si tiene permisos de escritura */}
      {showCreateModal && canWrite && (
        <CreateReservationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReservation}
          availableRooms={availableRooms}
        />
      )}

      {/* No Permission Modal para intentos de creación sin permisos */}
      {showCreateModal && !canWrite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sin Permisos</h3>
            </div>
            <p className="text-gray-600 mb-6">
              No tienes permisos para crear nuevas reservas. Esta función está disponible solo para el personal de recepción.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(false)}
              className="w-full"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;