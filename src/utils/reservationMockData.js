export const RESERVATION_STATUS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CHECKED_IN: 'Check-in',
  CHECKED_OUT: 'Check-out',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No-show'
};

export const ROOM_TYPES = {
  STANDARD: 'Habitación Estándar',
  DELUXE: 'Habitación Deluxe',
  SUITE: 'Suite Ejecutiva',
  JUNIOR_SUITE: 'Junior Suite'
};

export const mockReservations = [
  {
    id: 1,
    confirmationCode: 'HTP-2024-001',
    guest: {
      id: 1,
      name: 'Elena Ramírez',
      email: 'elena.ramirez@email.com',
      phone: '+34 600 123 456',
      document: '12345678A',
      country: 'España'
    },
    room: {
      id: 201,
      number: '201',
      type: ROOM_TYPES.SUITE,
      floor: 2
    },
    checkIn: '2024-07-15',
    checkOut: '2024-07-20',
    nights: 5,
    guests: 2,
    adults: 2,
    children: 0,
    status: RESERVATION_STATUS.CONFIRMED,
    totalAmount: 1200,
    paidAmount: 600,
    pendingAmount: 600,
    rate: 240,
    specialRequests: 'Cama extra, vista al mar',
    createdAt: '2024-07-01T10:30:00Z',
    createdBy: 'admin',
    paymentStatus: 'Partially Paid',
    source: 'Booking.com'
  },
  {
    id: 2,
    confirmationCode: 'HTP-2024-002',
    guest: {
      id: 2,
      name: 'Carlos López',
      email: 'carlos.lopez@email.com',
      phone: '+34 600 987 654',
      document: '87654321B',
      country: 'España'
    },
    room: {
      id: 105,
      number: '105',
      type: ROOM_TYPES.STANDARD,
      floor: 1
    },
    checkIn: '2024-07-18',
    checkOut: '2024-07-22',
    nights: 4,
    guests: 1,
    adults: 1,
    children: 0,
    status: RESERVATION_STATUS.PENDING,
    totalAmount: 800,
    paidAmount: 0,
    pendingAmount: 800,
    rate: 200,
    specialRequests: '',
    createdAt: '2024-07-02T14:15:00Z',
    createdBy: 'reception',
    paymentStatus: 'Pending',
    source: 'Direct'
  },
  {
    id: 3,
    confirmationCode: 'HTP-2024-003',
    guest: {
      id: 3,
      name: 'Sofía Martínez',
      email: 'sofia.martinez@email.com',
      phone: '+34 600 555 1212',
      document: '11223344C',
      country: 'México'
    },
    room: {
      id: 301,
      number: '301',
      type: ROOM_TYPES.DELUXE,
      floor: 3
    },
    checkIn: '2024-07-20',
    checkOut: '2024-07-25',
    nights: 5,
    guests: 2,
    adults: 2,
    children: 0,
    status: RESERVATION_STATUS.CONFIRMED,
    totalAmount: 1500,
    paidAmount: 1500,
    pendingAmount: 0,
    rate: 300,
    specialRequests: 'Decoración romántica, champagne',
    createdAt: '2024-06-25T09:45:00Z',
    createdBy: 'admin',
    paymentStatus: 'Paid',
    source: 'Expedia'
  },
  {
    id: 4,
    confirmationCode: 'HTP-2024-004',
    guest: {
      id: 4,
      name: 'Javier García',
      email: 'javier.garcia@email.com',
      phone: '+34 600 777 8888',
      document: '44556677D',
      country: 'España'
    },
    room: {
      id: 108,
      number: '108',
      type: ROOM_TYPES.STANDARD,
      floor: 1
    },
    checkIn: '2024-07-22',
    checkOut: '2024-07-26',
    nights: 4,
    guests: 3,
    adults: 2,
    children: 1,
    status: RESERVATION_STATUS.CHECKED_IN,
    totalAmount: 900,
    paidAmount: 900,
    pendingAmount: 0,
    rate: 225,
    specialRequests: 'Cuna para bebé',
    createdAt: '2024-07-03T16:20:00Z',
    createdBy: 'reception',
    paymentStatus: 'Paid',
    source: 'Direct'
  },
  {
    id: 5,
    confirmationCode: 'HTP-2024-005',
    guest: {
      id: 5,
      name: 'Ana Fernández',
      email: 'ana.fernandez@email.com',
      phone: '+34 600 333 4444',
      document: '99887766E',
      country: 'Argentina'
    },
    room: {
      id: 203,
      number: '203',
      type: ROOM_TYPES.SUITE,
      floor: 2
    },
    checkIn: '2025-06-20',
    checkOut: '2025-06-25',
    nights: 5,
    guests: 2,
    adults: 2,
    children: 0,
    status: RESERVATION_STATUS.PENDING,
    totalAmount: 1300,
    paidAmount: 0,
    pendingAmount: 1300,
    rate: 260,
    specialRequests: 'Check-in tardío, 22:00',
    createdAt: '2024-07-05T11:10:00Z',
    createdBy: 'admin',
    paymentStatus: 'Pending',
    source: 'Website'
  }
];

export const availableRooms = [
  { id: 101, number: '101', type: ROOM_TYPES.STANDARD, floor: 1, rate: 150, capacity: 2 },
  { id: 102, number: '102', type: ROOM_TYPES.STANDARD, floor: 1, rate: 150, capacity: 2 },
  { id: 103, number: '103', type: ROOM_TYPES.STANDARD, floor: 1, rate: 150, capacity: 2 },
  { id: 201, number: '201', type: ROOM_TYPES.DELUXE, floor: 2, rate: 220, capacity: 3 },
  { id: 202, number: '202', type: ROOM_TYPES.DELUXE, floor: 2, rate: 220, capacity: 3 },
  { id: 301, number: '301', type: ROOM_TYPES.SUITE, floor: 3, rate: 350, capacity: 4 },
  { id: 302, number: '302', type: ROOM_TYPES.SUITE, floor: 3, rate: 350, capacity: 4 },
  { id: 401, number: '401', type: ROOM_TYPES.JUNIOR_SUITE, floor: 4, rate: 280, capacity: 3 }
];

export const reservationSources = [
  'Direct',
  'Booking.com',
  'Expedia',
  'Airbnb',
  'Website',
  'Phone',
  'Walk-in'
];