export const ROOM_STATUS = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupada',
  CLEANING: 'En limpieza',
  MAINTENANCE: 'Mantenimiento',
  OUT_OF_ORDER: 'Fuera de servicio'
};

export const CLEANING_STATUS = {
  CLEAN: 'Limpio',
  DIRTY: 'Sucio',
  IN_PROGRESS: 'En proceso',
  INSPECTED: 'Inspeccionado'
};

export const ROOM_FEATURES = {
  WIFI: 'WiFi Gratis',
  TV: 'TV Smart',
  AC: 'Aire Acondicionado',
  MINIBAR: 'Minibar',
  SAFE: 'Caja Fuerte',
  BALCONY: 'Balcón',
  SEA_VIEW: 'Vista al Mar',
  JACUZZI: 'Jacuzzi',
  KITCHENETTE: 'Cocina',
  WORKSPACE: 'Zona de Trabajo'
};

export const mockRooms = [
  {
    id: 101,
    number: '101',
    floor: 1,
    type: 'Habitación Estándar',
    status: ROOM_STATUS.AVAILABLE,
    cleaningStatus: CLEANING_STATUS.CLEAN,
    capacity: 2,
    beds: [{ type: 'Doble', count: 1 }],
    size: 25,
    rate: 150,
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR],
    lastCleaned: '2024-07-15T08:30:00Z',
    cleanedBy: 'María García',
    currentGuest: null,
    nextReservation: null,
    maintenanceNotes: '',
    description: 'Habitación cómoda con vista al jardín',
    images: [],
    created: '2024-01-15T00:00:00Z'
  },
  {
    id: 102,
    number: '102',
    floor: 1,
    type: 'Habitación Estándar',
    status: ROOM_STATUS.OCCUPIED,
    cleaningStatus: CLEANING_STATUS.DIRTY,
    capacity: 2,
    beds: [{ type: 'Individual', count: 2 }],
    size: 25,
    rate: 150,
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR],
    lastCleaned: '2024-07-13T10:15:00Z',
    cleanedBy: 'Ana López',
    currentGuest: {
      name: 'Carlos Ruiz',
      checkOut: '2024-07-20'
    },
    nextReservation: {
      guest: 'Elena Vargas',
      checkIn: '2024-07-21'
    },
    maintenanceNotes: '',
    description: 'Habitación con dos camas individuales',
    images: [],
    created: '2024-01-15T00:00:00Z'
  },
  {
    id: 201,
    number: '201',
    floor: 2,
    type: 'Habitación Deluxe',
    status: ROOM_STATUS.CLEANING,
    cleaningStatus: CLEANING_STATUS.IN_PROGRESS,
    capacity: 3,
    beds: [{ type: 'King', count: 1 }, { type: 'Sofá Cama', count: 1 }],
    size: 35,
    rate: 220,
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.BALCONY, ROOM_FEATURES.SAFE],
    lastCleaned: '2024-07-15T11:45:00Z',
    cleanedBy: 'Pedro Martín',
    currentGuest: null,
    nextReservation: {
      guest: 'Sofía Martínez',
      checkIn: '2024-07-16'
    },
    maintenanceNotes: '',
    description: 'Habitación espaciosa con balcón y zona de estar',
    images: [],
    created: '2024-01-15T00:00:00Z'
  },
  {
    id: 202,
    number: '202',
    floor: 2,
    type: 'Habitación Deluxe',
    status: ROOM_STATUS.AVAILABLE,
    cleaningStatus: CLEANING_STATUS.CLEAN,
    capacity: 3,
    beds: [{ type: 'Queen', count: 1 }, { type: 'Individual', count: 1 }],
    size: 35,
    rate: 220,
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.BALCONY, ROOM_FEATURES.SAFE],
    lastCleaned: '2024-07-15T09:20:00Z',
    cleanedBy: 'María García',
    currentGuest: null,
    nextReservation: null,
    maintenanceNotes: '',
    description: 'Habitación deluxe con cama queen y cama individual',
    images: [],
    created: '2024-01-15T00:00:00Z'
  },
  {
    id: 301,
    number: '301',
    floor: 3,
    type: 'Suite Ejecutiva',
    status: ROOM_STATUS.OCCUPIED,
    cleaningStatus: CLEANING_STATUS.DIRTY,
    capacity: 4,
    beds: [{ type: 'King', count: 1 }, { type: 'Sofá Cama', count: 1 }],
    size: 60,
    rate: 350,
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.JACUZZI, ROOM_FEATURES.SEA_VIEW, ROOM_FEATURES.WORKSPACE],
    lastCleaned: '2024-07-12T14:30:00Z',
    cleanedBy: 'Ana López',
    currentGuest: {
      name: 'Roberto Silva',
      checkOut: '2024-07-18'
    },
    nextReservation: {
      guest: 'Miguel Torres',
      checkIn: '2024-07-19'
    },
    maintenanceNotes: '',
    description: 'Suite ejecutiva con sala de estar separada y jacuzzi',
    images: [],
    created: '2024-01-15T00:00:00Z'
  },
  {
    id: 302,
    number: '302',
    floor: 3,
    type: 'Suite Ejecutiva',
    status: ROOM_STATUS.MAINTENANCE,
    cleaningStatus: CLEANING_STATUS.CLEAN,
    capacity: 4,
    beds: [{ type: 'King', count: 1 }, { type: 'Sofá Cama', count: 1 }],
    size: 60,
    rate: 350,
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.JACUZZI, ROOM_FEATURES.SEA_VIEW, ROOM_FEATURES.WORKSPACE],
    lastCleaned: '2024-07-14T16:00:00Z',
    cleanedBy: 'Pedro Martín',
    currentGuest: null,
    nextReservation: null,
    maintenanceNotes: 'Reparación de aire acondicionado programada',
    description: 'Suite ejecutiva premium con todas las comodidades',
    images: [],
    created: '2024-01-15T00:00:00Z'
  },
  {
    id: 401,
    number: '401',
    floor: 4,
    type: 'Junior Suite',
    status: ROOM_STATUS.AVAILABLE,
    cleaningStatus: CLEANING_STATUS.INSPECTED,
    capacity: 3,
    beds: [{ type: 'Queen', count: 1 }, { type: 'Sofá Cama', count: 1 }],
    size: 45,
    rate: 280,
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.BALCONY, ROOM_FEATURES.KITCHENETTE],
    lastCleaned: '2024-07-15T07:45:00Z',
    cleanedBy: 'María García',
    currentGuest: null,
    nextReservation: {
      guest: 'Laura Fernández',
      checkIn: '2024-07-17'
    },
    maintenanceNotes: '',
    description: 'Junior suite con kitchenette y área de estar',
    images: [],
    created: '2024-01-15T00:00:00Z'
  },
  {
    id: 402,
    number: '402',
    floor: 4,
    type: 'Junior Suite',
    status: ROOM_STATUS.OUT_OF_ORDER,
    cleaningStatus: CLEANING_STATUS.CLEAN,
    capacity: 3,
    beds: [{ type: 'Queen', count: 1 }, { type: 'Sofá Cama', count: 1 }],
    size: 45,
    rate: 280,
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.BALCONY, ROOM_FEATURES.KITCHENETTE],
    lastCleaned: '2024-07-10T12:00:00Z',
    cleanedBy: 'Pedro Martín',
    currentGuest: null,
    nextReservation: null,
    maintenanceNotes: 'Problemas con la fontanería - Estimado 3 días de reparación',
    description: 'Junior suite temporalmente fuera de servicio',
    images: [],
    created: '2024-01-15T00:00:00Z'
  }
];

export const roomTypes = [
  {
    id: 1,
    name: 'Habitación Estándar',
    description: 'Habitación cómoda y funcional con todas las comodidades básicas.',
    baseRate: 150,
    capacity: 2,
    size: 25,
    bedOptions: ['Doble', 'Individual x2'],
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR],
    totalRooms: 20,
    active: true,
    color: '#3B82F6'
  },
  {
    id: 2,
    name: 'Habitación Deluxe',
    description: 'Habitación espaciosa con balcón y amenidades premium.',
    baseRate: 220,
    capacity: 3,
    size: 35,
    bedOptions: ['King + Sofá', 'Queen + Individual'],
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.BALCONY, ROOM_FEATURES.SAFE],
    totalRooms: 15,
    active: true,
    color: '#10B981'
  },
  {
    id: 3,
    name: 'Suite Ejecutiva',
    description: 'Suite de lujo con sala de estar separada y amenidades exclusivas.',
    baseRate: 350,
    capacity: 4,
    size: 60,
    bedOptions: ['King + Sofá Cama'],
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.JACUZZI, ROOM_FEATURES.SEA_VIEW, ROOM_FEATURES.WORKSPACE],
    totalRooms: 8,
    active: true,
    color: '#8B5CF6'
  },
  {
    id: 4,
    name: 'Junior Suite',
    description: 'Suite compacta con kitchenette y área de estar.',
    baseRate: 280,
    capacity: 3,
    size: 45,
    bedOptions: ['Queen + Sofá Cama'],
    features: [ROOM_FEATURES.WIFI, ROOM_FEATURES.TV, ROOM_FEATURES.AC, ROOM_FEATURES.MINIBAR, ROOM_FEATURES.BALCONY, ROOM_FEATURES.KITCHENETTE],
    totalRooms: 6,
    active: true,
    color: '#F59E0B'
  }
];

export const cleaningStaff = [
  { id: 1, name: 'María García', active: true, shift: 'Mañana' },
  { id: 2, name: 'Ana López', active: true, shift: 'Tarde' },
  { id: 3, name: 'Pedro Martín', active: true, shift: 'Mañana' },
  { id: 4, name: 'Carmen Ruiz', active: true, shift: 'Tarde' },
  { id: 5, name: 'José Hernández', active: false, shift: 'Noche' }
];

export const seasonalRates = [
  {
    id: 1,
    name: 'Temporada Alta',
    startDate: '2024-06-15',
    endDate: '2024-09-15',
    multiplier: 1.3,
    active: true
  },
  {
    id: 2,
    name: 'Temporada Media',
    startDate: '2024-03-15',
    endDate: '2024-06-14',
    multiplier: 1.1,
    active: true
  },
  {
    id: 3,
    name: 'Temporada Baja',
    startDate: '2024-11-01',
    endDate: '2024-03-14',
    multiplier: 0.8,
    active: true
  }
];