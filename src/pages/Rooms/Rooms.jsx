import React, { useState } from 'react';
import { Plus, Settings, Calendar, Sparkles } from 'lucide-react';
import { useRooms } from '../../hooks/useRooms';
import Button from '../../components/common/Button';
import RoomStats from '../../components/rooms/RoomStats';
import RoomFilters from '../../components/rooms/RoomFilters';
import RoomGrid from '../../components/rooms/RoomGrid';
import RoomList from '../../components/rooms/RoomList';
import RoomTypesManagement from '../../components/rooms/RoomTypesManagement';
import CleaningManagement from '../../components/rooms/CleaningManagement';
import CreateRoomModal from '../../components/rooms/CreateRoomModal';

const Rooms = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('rooms');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  
  // Filtros corregidos
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    floor: 'all',
    cleaningStatus: 'all',
    search: ''
  });

  // Hook personalizado para datos de habitaciones
  const {
    rooms,
    roomTypes,
    cleaningStaff,
    roomStats,
    roomsByType,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    updateCleaningStatus,
    assignCleaning
  } = useRooms();

  // Configuración de tabs
  const tabs = [
    { id: 'rooms', label: 'Habitaciones', icon: Calendar },
    { id: 'cleaning', label: 'Gestión de Limpieza', icon: Sparkles }
  ];

  // Handlers
  const handleCreateRoom = async (roomData) => {
    try {
      await createRoom(roomData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleEditRoom = async (roomId, roomData) => {
    try {
      await updateRoom(roomId, roomData);
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      try {
        await deleteRoom(roomId);
        // Remover de selección si estaba seleccionada
        setSelectedRooms(prev => prev.filter(id => id !== roomId));
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await updateRoomStatus(roomId, newStatus);
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  };

  const handleCleaningStatusChange = async (roomId, newStatus) => {
    try {
      await updateCleaningStatus(roomId, newStatus);
    } catch (error) {
      console.error('Error updating cleaning status:', error);
    }
  };

  const handleAssignCleaning = async (roomIds, staffId) => {
    try {
      await assignCleaning(roomIds, staffId);
      setSelectedRooms([]); // Limpiar selección después de asignar
    } catch (error) {
      console.error('Error assigning cleaning:', error);
    }
  };

  // Filtrar habitaciones - Función corregida
  const filteredRooms = React.useMemo(() => {
    if (!rooms) return [];

    return rooms.filter(room => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          room.number.toLowerCase().includes(searchTerm) ||
          room.type.toLowerCase().includes(searchTerm) ||
          room.status.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Filtro por estado
      if (filters.status !== 'all' && room.status !== filters.status) return false;
      
      // Filtro por tipo
      if (filters.type !== 'all' && room.type !== filters.type) return false;
      
      // Filtro por piso
      if (filters.floor !== 'all' && room.floor.toString() !== filters.floor) return false;
      
      // Filtro por estado de limpieza
      if (filters.cleaningStatus !== 'all' && room.cleaningStatus !== filters.cleaningStatus) return false;
      
      return true;
    });
  }, [rooms, filters]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Habitaciones</h1>
          <p className="text-gray-600 mt-1">
            Administra habitaciones y limpieza
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          {selectedRooms.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedRooms.length} seleccionada{selectedRooms.length > 1 ? 's' : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={Sparkles}
                onClick={() => {
                  // Aquí podrías abrir un modal para seleccionar personal
                  console.log('Asignar limpieza a habitaciones:', selectedRooms);
                }}
              >
                Asignar Limpieza
              </Button>
            </div>
          )}
          
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Nueva Habitación
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          {/* Statistics */}
          <RoomStats 
            stats={roomStats} 
            roomsByType={roomsByType}
            loading={loading} 
          />

          {/* Filters */}
          <RoomFilters
            filters={filters}
            onFiltersChange={setFilters}
            roomTypes={roomTypes || []}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            loading={loading}
          />

          {/* Rooms Display */}
          {viewMode === 'grid' ? (
            <RoomGrid
              rooms={filteredRooms}
              loading={loading}
              selectedRooms={selectedRooms}
              onSelectRoom={setSelectedRooms}
              onStatusChange={handleStatusChange}
              onCleaningStatusChange={handleCleaningStatusChange}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoom}
            />
          ) : (
            <RoomList
              rooms={filteredRooms}
              loading={loading}
              selectedRooms={selectedRooms}
              onSelectRoom={setSelectedRooms}
              onStatusChange={handleStatusChange}
              onCleaningStatusChange={handleCleaningStatusChange}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoom}
            />
          )}

          {/* Empty State para habitaciones filtradas */}
          {!loading && filteredRooms.length === 0 && rooms && rooms.length > 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron habitaciones
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta ajustar los filtros de búsqueda
              </p>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  status: 'all',
                  type: 'all',
                  floor: 'all',
                  cleaningStatus: 'all',
                  search: ''
                })}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'types' && (
        <RoomTypesManagement
          roomTypes={roomTypes || []}
          roomsByType={roomsByType}
          loading={loading}
        />
      )}

      {activeTab === 'cleaning' && (
        <CleaningManagement
          rooms={rooms || []}
          cleaningStaff={cleaningStaff || []}
          onAssignCleaning={handleAssignCleaning}
          onCleaningStatusChange={handleCleaningStatusChange}
          loading={loading}
        />
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoom}
          roomTypes={roomTypes || []}
        />
      )}
    </div>
  );
};

export default Rooms;