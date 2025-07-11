import React, { useState } from 'react';
import { Users, Plus, UserX } from 'lucide-react';
import { useGuests } from '../../hooks/useGuests';
import Button from '../../components/common/Button';
import GuestsGrid from '../../components/guests/GuestsGrid';
import GuestProfile from '../../components/guests/GuestProfile';
import CreateGuestModal from '../../components/guests/CreateGuestModal';

const Guests = () => {
  // Estados principales simplificados
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  
  // Filtro básico de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Hook personalizado para datos de huéspedes
  const {
    guests,
    loading,
    error,
    createGuest,
    deleteGuest
  } = useGuests();

  // Handlers simplificados
  const handleCreateGuest = async (guestData) => {
    try {
      await createGuest(guestData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating guest:', error);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este huésped?')) {
      try {
        await deleteGuest(guestId);
      } catch (error) {
        console.error('Error deleting guest:', error);
      }
    }
  };

  const openProfile = (guest) => {
    setSelectedGuest(guest);
    setShowProfile(true);
  };

  // Filtrar huéspedes de forma simplificada
  const getFilteredGuests = () => {
    if (!guests) return [];

    // Solo filtrar por búsqueda
    if (searchTerm) {
      return guests.filter(guest =>
        guest.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.dni?.includes(searchTerm) ||
        guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone?.includes(searchTerm)
      );
    }

    return guests;
  };

  const filteredGuests = getFilteredGuests();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-4">
          <UserX className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Huéspedes
          </h1>
          <p className="text-gray-600 mt-1">
            Registro y gestión de huéspedes del hotel
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Nuevo Huésped
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <span className="text-sm text-gray-600">
          {filteredGuests.length} huésped{filteredGuests.length !== 1 ? 'es' : ''} {searchTerm ? 'encontrado' : 'registrado'}{filteredGuests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Guests Grid */}
      <GuestsGrid
        guests={filteredGuests}
        loading={loading}
        selectedGuests={[]}
        onSelectGuest={() => {}}
        onEdit={() => {}}
        onDelete={handleDeleteGuest}
        onViewProfile={openProfile}
        reservations={[]}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateGuestModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGuest}
        />
      )}

      {showProfile && selectedGuest && (
        <GuestProfile
          isOpen={showProfile}
          onClose={() => {
            setShowProfile(false);
            setSelectedGuest(null);
          }}
          guest={selectedGuest}
        />
      )}
    </div>
  );
};

export default Guests;