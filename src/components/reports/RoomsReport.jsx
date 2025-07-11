import React, { useState, useEffect } from 'react';
import { Bed, TrendingUp, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import Button from '../common/Button';

const RoomsReport = ({ dateRange = {}, selectedPeriod = 'thisMonth' }) => {
  const [loading, setLoading] = useState(true);
  const [roomsData, setRoomsData] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    occupancyRate: 0,
    averageRate: 0,
    revenue: 0,
    roomTypes: [],
    dailyOccupancy: [],
    maintenanceIssues: []
  });

  useEffect(() => {
    fetchRoomsData();
  }, [dateRange?.startDate, dateRange?.endDate, selectedPeriod]);

  const fetchRoomsData = async () => {
    setLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Datos simulados
      setRoomsData({
        totalRooms: 120,
        occupiedRooms: 98,
        availableRooms: 18,
        maintenanceRooms: 4,
        occupancyRate: 81.7,
        averageRate: 285.50,
        revenue: 127845.00,
        roomTypes: [
          { type: 'Standard', total: 60, occupied: 48, rate: 80.0, avgPrice: 180 },
          { type: 'Deluxe', total: 35, occupied: 32, rate: 91.4, avgPrice: 280 },
          { type: 'Suite', total: 20, occupied: 15, rate: 75.0, avgPrice: 450 },
          { type: 'Presidential', total: 5, occupied: 3, rate: 60.0, avgPrice: 800 }
        ],
        dailyOccupancy: [
          { date: '2024-06-01', occupied: 95, available: 25, rate: 79.2 },
          { date: '2024-06-02', occupied: 102, available: 18, rate: 85.0 },
          { date: '2024-06-03', occupied: 98, available: 22, rate: 81.7 },
          { date: '2024-06-04', occupied: 89, available: 31, rate: 74.2 },
          { date: '2024-06-05', occupied: 105, available: 15, rate: 87.5 }
        ],
        maintenanceIssues: [
          { room: '301', issue: 'Aire acondicionado', priority: 'Alta', status: 'En progreso' },
          { room: '205', issue: 'Plomería', priority: 'Media', status: 'Pendiente' },
          { room: '418', issue: 'Televisor', priority: 'Baja', status: 'Programado' },
          { room: '112', issue: 'Ventana', priority: 'Media', status: 'En progreso' }
        ]
      });
    } catch (error) {
      console.error('Error fetching rooms data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Lógica para exportar reporte
    console.log('Exportando reporte de habitaciones...');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso': return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente': return 'bg-red-100 text-red-800';
      case 'Programado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'text-red-600';
      case 'Media': return 'text-yellow-600';
      case 'Baja': return 'text-green-600';
      default: return 'text-gray-600';
    }
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg h-64">
                <div className="h-full bg-gray-200 rounded"></div>
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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Bed className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reporte de Habitaciones</h2>
            <p className="text-gray-600">
              Período: {dateRange?.startDate?.toLocaleDateString('es-PE') || 'No definido'} - {dateRange?.endDate?.toLocaleDateString('es-PE') || 'No definido'}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={Download}
          onClick={exportReport}
        >
          Exportar
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Habitaciones</p>
              <p className="text-3xl font-bold text-gray-900">{roomsData.totalRooms}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Bed className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Habitaciones Ocupadas</p>
              <p className="text-3xl font-bold text-green-600">{roomsData.occupiedRooms}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {roomsData.occupancyRate.toFixed(1)}% ocupación
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Habitaciones Disponibles</p>
              <p className="text-3xl font-bold text-blue-600">{roomsData.availableRooms}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bed className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Mantenimiento</p>
              <p className="text-3xl font-bold text-orange-600">{roomsData.maintenanceRooms}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas financieras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tarifa Promedio</p>
              <p className="text-3xl font-bold text-gray-900">S/ {roomsData.averageRate.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8.3% vs período anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos por Habitaciones</p>
              <p className="text-3xl font-bold text-gray-900">S/ {roomsData.revenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+15.2% vs período anterior</span>
          </div>
        </div>
      </div>

      {/* Tipos de habitaciones */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ocupación por Tipo de Habitación</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocupadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa Ocupación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarifa Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RevPAR
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roomsData.roomTypes.map((roomType, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {roomType.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {roomType.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {roomType.occupied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${roomType.rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{roomType.rate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    S/ {roomType.avgPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    S/ {(roomType.avgPrice * (roomType.rate / 100)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ocupación diaria y mantenimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ocupación diaria */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ocupación Diaria</h3>
          </div>
          <div className="space-y-3">
            {roomsData.dailyOccupancy.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {new Date(day.date).toLocaleDateString('es-PE', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${day.rate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 w-16 text-right">
                    {day.occupied}/{day.occupied + day.available}
                  </span>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {day.rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues de mantenimiento */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Issues de Mantenimiento</h3>
          </div>
          <div className="space-y-3">
            {roomsData.maintenanceIssues.map((issue, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Habitación {issue.room}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{issue.issue}</span>
                  <span className={`font-medium ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" className="w-full">
              Ver Todos los Issues
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">2.3</p>
            <p className="text-sm text-gray-600">Días promedio entre reservas</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">96.2%</p>
            <p className="text-sm text-gray-600">Tasa de limpieza a tiempo</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">4.7</p>
            <p className="text-sm text-gray-600">Calificación promedio habitaciones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsReport;