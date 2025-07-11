// Datos simulados para el dashboard
export const hotelStats = {
  occupancy: 78,
  totalRooms: 120,
  occupiedRooms: 94,
  availableRooms: 26,
  totalGuests: 156,
  checkInsToday: 12,
  checkOutsToday: 8,
  revenue: {
    today: 2850,
    thisWeek: 18430,
    thisMonth: 67290,
    lastMonth: 59120
  },
  averageRate: 145,
  guestSatisfaction: 4.7
};

export const occupancyData = [
  { month: 'Ene', ocupacion: 65, ingresos: 45000 },
  { month: 'Feb', ocupacion: 72, ingresos: 52000 },
  { month: 'Mar', ocupacion: 80, ingresos: 68000 },
  { month: 'Abr', ocupacion: 85, ingresos: 74000 },
  { month: 'May', ocupacion: 92, ingresos: 82000 },
  { month: 'Jun', ocupacion: 78, ingresos: 67000 }
];

export const revenueByCategory = [
  { name: 'Habitaciones', value: 65, color: '#3B82F6' },
  { name: 'Restaurante', value: 20, color: '#10B981' },
  { name: 'Spa', value: 10, color: '#F59E0B' },
  { name: 'Otros', value: 5, color: '#8B5CF6' }
];

export const recentActivity = [
  {
    id: 1,
    type: 'checkin',
    guest: 'María González',
    room: '205',
    time: '14:30',
    status: 'completed'
  },
  {
    id: 2,
    type: 'reservation',
    guest: 'Carlos Ruiz',
    room: '314',
    time: '13:45',
    status: 'confirmed'
  },
  {
    id: 3,
    type: 'checkout',
    guest: 'Ana Martín',
    room: '102',
    time: '12:15',
    status: 'completed'
  },
  {
    id: 4,
    type: 'maintenance',
    guest: 'Servicio Técnico',
    room: '408',
    time: '11:30',
    status: 'pending'
  },
  {
    id: 5,
    type: 'checkin',
    guest: 'Roberto Silva',
    room: '301',
    time: '10:45',
    status: 'completed'
  }
];

export const upcomingCheckIns = [
  {
    id: 1,
    guest: 'Elena Vargas',
    room: '201',
    time: '15:00',
    nights: 3,
    type: 'Suite Deluxe'
  },
  {
    id: 2,
    guest: 'Diego Morales',
    room: '105',
    time: '16:30',
    nights: 2,
    type: 'Habitación Estándar'
  },
  {
    id: 3,
    guest: 'Isabel Castro',
    room: '302',
    time: '18:00',
    nights: 5,
    type: 'Suite Ejecutiva'
  }
];

export const roomsToClean = [
  { room: '203', type: 'Standard', priority: 'high', lastGuest: 'Juan Pérez' },
  { room: '156', type: 'Deluxe', priority: 'medium', lastGuest: 'Sara López' },
  { room: '089', type: 'Suite', priority: 'low', lastGuest: 'Miguel Torres' }
];