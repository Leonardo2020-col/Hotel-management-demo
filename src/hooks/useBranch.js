// src/hooks/useBranch.js
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para manejar información y operaciones de sucursal
 */
export const useBranch = () => {
  const { selectedBranch, user, selectBranch } = useAuth();

  // Información de todas las sucursales disponibles
  const availableBranches = [
    {
      id: 1,
      name: 'Hotel Paraíso - Centro',
      location: 'San Isidro, Lima',
      rooms: 45,
      address: 'Av. El Bosque 123, San Isidro',
      phone: '+51 1 234-5678',
      manager: 'Carlos Mendoza',
      features: ['WiFi Gratuito', 'Restaurante', 'Spa', 'Piscina'],
      code: 'HPC',
      timezone: 'America/Lima'
    },
    {
      id: 2,
      name: 'Hotel Paraíso - Miraflores',
      location: 'Miraflores, Lima',
      rooms: 60,
      address: 'Malecón de la Reserva 456, Miraflores',
      phone: '+51 1 234-5679',
      manager: 'Ana García',
      features: ['Vista al Mar', 'Centro de Negocios', 'Gimnasio', 'Bar'],
      code: 'HPM',
      timezone: 'America/Lima'
    },
    {
      id: 3,
      name: 'Hotel Paraíso - Aeropuerto',
      location: 'Callao, Lima',
      rooms: 35,
      address: 'Av. Faucett 789, Callao',
      phone: '+51 1 234-5680',
      manager: 'Luis Torres',
      features: ['Shuttle Gratuito', 'Check-in 24h', 'Business Center'],
      code: 'HPA',
      timezone: 'America/Lima'
    }
  ];

  /**
   * Obtiene información detallada de la sucursal actual
   */
  const getCurrentBranchInfo = () => {
    if (!selectedBranch) return null;
    
    return availableBranches.find(branch => branch.id === selectedBranch.id) || selectedBranch;
  };

  /**
   * Obtiene información de una sucursal específica por ID
   */
  const getBranchById = (id) => {
    return availableBranches.find(branch => branch.id === id);
  };

  /**
   * Verifica si el usuario puede cambiar de sucursal
   */
  const canChangeBranch = () => {
    return user?.role === 'admin';
  };

  /**
   * Obtiene el nombre corto de la sucursal actual
   */
  const getCurrentBranchCode = () => {
    const currentBranch = getCurrentBranchInfo();
    return currentBranch?.code || 'N/A';
  };

  /**
   * Obtiene estadísticas mock para la sucursal actual
   */
  const getCurrentBranchStats = () => {
    const currentBranch = getCurrentBranchInfo();
    if (!currentBranch) return null;

    // Datos mock basados en la sucursal
    const mockStats = {
      1: { // Centro
        occupancyRate: 71,
        currentGuests: 32,
        availableRooms: 13,
        revenue: 15750,
        checkInsToday: 8,
        checkOutsToday: 5
      },
      2: { // Miraflores
        occupancyRate: 80,
        currentGuests: 48,
        availableRooms: 12,
        revenue: 22400,
        checkInsToday: 12,
        checkOutsToday: 7
      },
      3: { // Aeropuerto
        occupancyRate: 80,
        currentGuests: 28,
        availableRooms: 7,
        revenue: 11200,
        checkInsToday: 15,
        checkOutsToday: 12
      }
    };

    return mockStats[currentBranch.id] || {};
  };

  /**
   * Cambia a una sucursal específica (solo para administradores)
   */
  const changeBranch = async (branchId) => {
    if (!canChangeBranch()) {
      throw new Error('No tienes permisos para cambiar de sucursal');
    }

    const branch = getBranchById(branchId);
    if (!branch) {
      throw new Error('Sucursal no encontrada');
    }

    return await selectBranch(branch);
  };

  /**
   * Obtiene el formato de display para la sucursal actual
   */
  const getBranchDisplayName = () => {
    const currentBranch = getCurrentBranchInfo();
    if (!currentBranch) return 'Sin sucursal';

    return `${currentBranch.name} (${currentBranch.code})`;
  };

  /**
   * Verifica si una sucursal específica está seleccionada
   */
  const isBranchSelected = (branchId) => {
    return selectedBranch?.id === branchId;
  };

  return {
    // Estado
    selectedBranch,
    availableBranches,
    
    // Funciones de información
    getCurrentBranchInfo,
    getBranchById,
    getCurrentBranchCode,
    getCurrentBranchStats,
    getBranchDisplayName,
    
    // Funciones de acción
    changeBranch,
    canChangeBranch,
    isBranchSelected,
    
    // Estado derivado
    hasSelectedBranch: !!selectedBranch,
    isAdmin: user?.role === 'admin'
  };
};