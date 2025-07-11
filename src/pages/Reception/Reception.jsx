import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Bed,
  LogIn,        // REEMPLAZA CheckIn
  LogOut,       // REEMPLAZA CheckOut
  Phone,
  MapPin,
  AlertCircle,
  Search,
  Plus,
  Edit,
  Eye,
  Key,
  Bell,
  MessageSquare,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/common/Button'; // RUTA CORREGIDA
import { formatCurrency, formatDate } from '../../utils/formatters'; // AGREGADA

const Reception = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [receptionData, setReceptionData] = useState({
    todayStats: {},
    arrivals: [],
    departures: [],
    inHouse: [],
    rooms: [],
    requests: [],
    notifications: []
  });

  useEffect(() => {
    fetchReceptionData();
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchReceptionData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchReceptionData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setReceptionData({
        todayStats: {
          totalArrivals: 24,
          totalDepartures: 18,
          inHouse: 98,
          pendingCheckIns: 6,
          pendingCheckOuts: 3,
          availableRooms: 22,
          occupancyRate: 81.7
        },
        arrivals: [
          {
            id: 1,
            guest: 'Juan Pérez',
            room: '101',
            arrivalTime: '14:00',
            status: 'confirmed',
            nights: 3,
            email: 'juan.perez@email.com',
            phone: '+51 999 888 777',
            requests: 'Vista al mar'
          },
          {
            id: 2,
            guest: 'María García',
            room: '205',
            arrivalTime: '15:30',
            status: 'pending',
            nights: 2,
            email: 'maria.garcia@email.com',
            phone: '+51 987 654 321',
            requests: 'Cama extra'
          },
          {
            id: 3,
            guest: 'Carlos López',
            room: '308',
            arrivalTime: '16:00',
            status: 'confirmed',
            nights: 1,
            email: 'carlos.lopez@email.com',
            phone: '+51 999 111 222',
            requests: ''
          }
        ],
        departures: [
          {
            id: 1,
            guest: 'Ana Silva',
            room: '102',
            departureTime: '11:00',
            status: 'pending',
            bill: 850.00,
            paymentStatus: 'paid'
          },
          {
            id: 2,
            guest: 'Roberto Torres',
            room: '301',
            departureTime: '12:00',
            status: 'checked_out',
            bill: 1200.00,
            paymentStatus: 'paid'
          }
        ],
        inHouse: [
          {
            id: 1,
            guest: 'Elena Vargas',
            room: '201',
            checkIn: '2024-06-23',
            checkOut: '2024-06-26',
            status: 'in_house',
            nights: 3,
            phone: '+51 998 877 666'
          },
          {
            id: 2,
            guest: 'Diego Mendoza',
            room: '405',
            checkIn: '2024-06-24',
            checkOut: '2024-06-25',
            status: 'in_house',
            nights: 1,
            phone: '+51 987 123 456'
          }
        ],
        rooms: [
          { number: '101', status: 'occupied', guest: 'Juan Pérez', type: 'Standard' },
          { number: '102', status: 'checkout', guest: '', type: 'Standard' },
          { number: '103', status: 'available', guest: '', type: 'Standard' },
          { number: '201', status: 'occupied', guest: 'Elena Vargas', type: 'Deluxe' },
          { number: '202', status: 'maintenance', guest: '', type: 'Deluxe' },
          { number: '301', status: 'available', guest: '', type: 'Suite' }
        ],
        requests: [
          {
            id: 1,
            room: '201',
            guest: 'Elena Vargas',
            request: 'Toallas adicionales',
            time: '10:30',
            status: 'pending',
            priority: 'medium'
          },
          {
            id: 2,
            room: '405',
            guest: 'Diego Mendoza',
            request: 'Servicio de habitaciones',
            time: '11:15',
            status: 'in_progress',
            priority: 'high'
          }
        ],
        notifications: [
          {
            id: 1,
            type: 'checkin',
            message: 'Check-in retrasado: Juan Pérez (Hab. 101)',
            time: '14:30'
          },
          {
            id: 2,
            type: 'maintenance',
            message: 'Mantenimiento completado en Hab. 202',
            time: '13:45'
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching reception data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'checked_out': return 'bg-blue-100 text-blue-800';
      case 'in_house': return 'bg-purple-100 text-purple-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'checkout': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomStatusIcon = (status) => {
    switch (status) {
      case 'occupied': return <UserCheck className="w-4 h-4" />;
      case 'available': return <Bed className="w-4 h-4" />;
      case 'checkout': return <UserX className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      default: return <Bed className="w-4 h-4" />;
    }
  };

  const handleCheckIn = (guestId) => {
    console.log('Check-in guest:', guestId);
    // Lógica de check-in
  };

  const handleCheckOut = (guestId) => {
    console.log('Check-out guest:', guestId);
    // Lógica de check-out
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recepción</h1>
          <p className="text-gray-600">
            Panel de control para el front desk - {formatDate(selectedDate)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={fetchReceptionData}
            size="sm"
          >
            Actualizar
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => console.log('Nueva reserva')}
          >
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Llegadas Hoy</p>
              <p className="text-3xl font-bold text-blue-600">{receptionData.todayStats.totalArrivals}</p>
              <p className="text-xs text-blue-600 mt-1">{receptionData.todayStats.pendingCheckIns} pendientes</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Salidas Hoy</p>
              <p className="text-3xl font-bold text-green-600">{receptionData.todayStats.totalDepartures}</p>
              <p className="text-xs text-green-600 mt-1">{receptionData.todayStats.pendingCheckOuts} pendientes</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <LogOut className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Huéspedes In-House</p>
              <p className="text-3xl font-bold text-purple-600">{receptionData.todayStats.inHouse}</p>
              <p className="text-xs text-purple-600 mt-1">Actualmente hospedados</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Habitaciones Disponibles</p>
              <p className="text-3xl font-bold text-orange-600">{receptionData.todayStats.availableRooms}</p>
              <p className="text-xs text-orange-600 mt-1">{receptionData.todayStats.occupancyRate}% ocupación</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Bed className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar huésped o habitación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="in_house">In-House</option>
            </select>
          </div>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Panel principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Llegadas y salidas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Llegadas */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <LogIn className="w-5 h-5 mr-2 text-blue-600" />
                Llegadas de Hoy
              </h3>
              <span className="text-sm text-gray-600">{receptionData.arrivals.length} llegadas</span>
            </div>
            <div className="space-y-3">
              {receptionData.arrivals.map((arrival) => (
                <div key={arrival.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{arrival.guest}</h4>
                        <p className="text-sm text-gray-600">Hab. {arrival.room} • {arrival.nights} noches</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(arrival.status)}`}>
                        {arrival.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                      </span>
                      <span className="text-sm text-gray-600">{arrival.arrivalTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {arrival.phone}
                      </div>
                      {arrival.requests && (
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {arrival.requests}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => console.log('Ver detalles')}
                      >
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Key}
                        onClick={() => handleCheckIn(arrival.id)}
                        disabled={arrival.status !== 'confirmed'}
                      >
                        Check-in
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salidas */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <LogOut className="w-5 h-5 mr-2 text-green-600" />
                Salidas de Hoy
              </h3>
              <span className="text-sm text-gray-600">{receptionData.departures.length} salidas</span>
            </div>
            <div className="space-y-3">
              {receptionData.departures.map((departure) => (
                <div key={departure.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{departure.guest}</h4>
                        <p className="text-sm text-gray-600">Hab. {departure.room}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(departure.status)}`}>
                        {departure.status === 'checked_out' ? 'Completado' : 'Pendiente'}
                      </span>
                      <span className="text-sm text-gray-600">{departure.departureTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-600">Total: </span>
                      <span className="font-semibold text-gray-900">{formatCurrency(departure.bill)}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        departure.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {departure.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => console.log('Ver factura')}
                      >
                        Factura
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={LogOut}
                        onClick={() => handleCheckOut(departure.id)}
                        disabled={departure.status === 'checked_out'}
                      >
                        Check-out
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Estado de habitaciones */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bed className="w-5 h-5 mr-2 text-gray-600" />
              Estado de Habitaciones
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {receptionData.rooms.map((room) => (
                <div
                  key={room.number}
                  className={`p-3 rounded-lg border-2 text-center cursor-pointer hover:shadow-md transition-all ${getStatusColor(room.status)} border-opacity-50`}
                  onClick={() => console.log('Ver habitación', room.number)}
                >
                  <div className="flex items-center justify-center mb-1">
                    {getRoomStatusIcon(room.status)}
                    <span className="ml-1 font-bold">{room.number}</span>
                  </div>
                  <p className="text-xs">{room.type}</p>
                  {room.guest && <p className="text-xs font-medium mt-1">{room.guest}</p>}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                  <span>Ocupada</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 rounded mr-2"></div>
                  <span>Salida</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-100 rounded mr-2"></div>
                  <span>Mantenimiento</span>
                </div>
              </div>
            </div>
          </div>

          {/* Solicitudes pendientes */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-orange-600" />
              Solicitudes
            </h3>
            <div className="space-y-3">
              {receptionData.requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Hab. {request.room}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.priority === 'high' ? 'bg-red-100 text-red-800' :
                      request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {request.priority === 'high' ? 'Alta' : 
                       request.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.request}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{request.time}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                      {request.status === 'pending' ? 'Pendiente' : 'En progreso'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
              Notificaciones
            </h3>
            <div className="space-y-3">
              {receptionData.notifications.map((notification) => (
                <div key={notification.id} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reception;