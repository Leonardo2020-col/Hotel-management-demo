import React, { useState, useMemo } from 'react';
import { 
  Sparkles, // Cambiar CleaningServices por Sparkles
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Button from '../common/Button';
import { CLEANING_STATUS, ROOM_STATUS } from '../../utils/roomMockData';
import { getRelativeTime } from '../../utils/formatters';
import classNames from 'classnames';

const CleaningManagement = ({ 
  rooms, 
  cleaningStaff, 
  roomsNeedingCleaning, 
  onAssignCleaning, 
  onCleaningStatusChange, 
  loading 
}) => {
  // Estados necesarios
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  // Calcular estadísticas de limpieza
  const cleaningStats = useMemo(() => {
    if (!rooms || rooms.length === 0) {
      return {
        needsCleaning: 0,
        inProgress: 0,
        clean: 0,
        inspected: 0
      };
    }

    return {
      needsCleaning: rooms.filter(room => room.cleaningStatus === CLEANING_STATUS.DIRTY).length,
      inProgress: rooms.filter(room => room.cleaningStatus === CLEANING_STATUS.IN_PROGRESS).length,
      clean: rooms.filter(room => room.cleaningStatus === CLEANING_STATUS.CLEAN).length,
      inspected: rooms.filter(room => room.cleaningStatus === CLEANING_STATUS.INSPECTED).length
    };
  }, [rooms]);

  // Filtrar habitaciones
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];

    return rooms.filter(room => {
      // Filtro por término de búsqueda
      const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.type.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por estado de limpieza
      const matchesStatus = filterStatus === 'all' || room.cleaningStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchTerm, filterStatus]);

  // Manejar selección de habitaciones
  const handleRoomSelect = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  // Seleccionar todas las habitaciones filtradas
  const handleSelectAll = () => {
    if (selectedRooms.length === filteredRooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(filteredRooms.map(room => room.id));
    }
  };

  // Asignar limpieza
  const handleAssignCleaning = () => {
    if (selectedRooms.length > 0 && selectedStaff && onAssignCleaning) {
      onAssignCleaning(selectedRooms, selectedStaff);
      setSelectedRooms([]);
      setShowAssignModal(false);
      setSelectedStaff('');
    }
  };

  // Cambiar estado de limpieza individual
  const handleStatusChange = (roomId, newStatus) => {
    if (onCleaningStatusChange) {
      onCleaningStatusChange(roomId, newStatus);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case CLEANING_STATUS.CLEAN:
        return 'bg-green-100 text-green-800 border-green-200';
      case CLEANING_STATUS.DIRTY:
        return 'bg-red-100 text-red-800 border-red-200';
      case CLEANING_STATUS.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case CLEANING_STATUS.INSPECTED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case CLEANING_STATUS.CLEAN:
        return CheckCircle;
      case CLEANING_STATUS.DIRTY:
        return AlertTriangle;
      case CLEANING_STATUS.IN_PROGRESS:
        return Clock;
      case CLEANING_STATUS.INSPECTED:
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Limpieza</h2>
          <p className="text-gray-600 mt-1">
            Controla el estado de limpieza y asigna tareas al personal
          </p>
        </div>
        
        {selectedRooms.length > 0 && (
          <Button
            variant="primary"
            icon={Sparkles}
            onClick={() => setShowAssignModal(true)}
          >
            Asignar Limpieza ({selectedRooms.length})
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Necesitan Limpieza</p>
              <p className="text-2xl font-bold text-red-600">{cleaningStats.needsCleaning}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">En Proceso</p>
              <p className="text-2xl font-bold text-yellow-600">{cleaningStats.inProgress}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Limpias</p>
              <p className="text-2xl font-bold text-green-600">{cleaningStats.clean}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Inspeccionadas</p>
              <p className="text-2xl font-bold text-blue-600">{cleaningStats.inspected}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar habitaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value={CLEANING_STATUS.DIRTY}>Necesitan limpieza</option>
              <option value={CLEANING_STATUS.IN_PROGRESS}>En proceso</option>
              <option value={CLEANING_STATUS.CLEAN}>Limpias</option>
              <option value={CLEANING_STATUS.INSPECTED}>Inspeccionadas</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredRooms.length} habitacion{filteredRooms.length !== 1 ? 'es' : ''}
            </span>
            {filteredRooms.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedRooms.length === filteredRooms.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const StatusIcon = getStatusIcon(room.cleaningStatus);
          const isSelected = selectedRooms.includes(room.id);

          return (
            <div
              key={room.id}
              className={classNames(
                'bg-white rounded-xl shadow-lg border transition-all duration-300',
                isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
              )}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRoomSelect(room.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <h3 className="text-lg font-bold text-gray-900">
                      Habitación {room.number}
                    </h3>
                  </div>
                  <span className={classNames(
                    'px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1',
                    getStatusColor(room.cleaningStatus)
                  )}>
                    <StatusIcon size={14} />
                    <span>{room.cleaningStatus}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>Piso {room.floor}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{room.type}</span>
                    </div>
                  </div>

                  {room.assignedCleaner && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {room.assignedCleaner}
                        </span>
                      </div>
                      {room.cleaningStartTime && (
                        <p className="text-xs text-blue-700 mt-1">
                          Iniciado: {getRelativeTime(room.cleaningStartTime)}
                        </p>
                      )}
                    </div>
                  )}

                  {room.lastCleaned && (
                    <div className="text-xs text-gray-500">
                      Última limpieza: {getRelativeTime(room.lastCleaned)}
                      {room.cleanedBy && ` por ${room.cleanedBy}`}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {room.cleaningStatus === CLEANING_STATUS.DIRTY && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleStatusChange(room.id, CLEANING_STATUS.IN_PROGRESS)}
                      >
                        Iniciar Limpieza
                      </Button>
                    )}
                    {room.cleaningStatus === CLEANING_STATUS.IN_PROGRESS && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStatusChange(room.id, CLEANING_STATUS.CLEAN)}
                      >
                        Marcar Limpia
                      </Button>
                    )}
                    {room.cleaningStatus === CLEANING_STATUS.CLEAN && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStatusChange(room.id, CLEANING_STATUS.INSPECTED)}
                      >
                        Inspeccionar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-12">
          <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron habitaciones
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Asignar Limpieza
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal de Limpieza
                  </label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar personal</option>
                    {cleaningStaff?.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} - {staff.shift}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Habitaciones seleccionadas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRooms.map((roomId) => {
                      const room = rooms.find(r => r.id === roomId);
                      return (
                        <span
                          key={roomId}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {room?.number}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  icon={Sparkles}
                  onClick={handleAssignCleaning}
                  disabled={!selectedStaff}
                >
                  Asignar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleaningManagement;