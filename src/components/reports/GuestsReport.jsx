import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, MapPin, Download } from 'lucide-react';
import Button from '../common/Button';

const GuestsReport = ({ dateRange = {}, selectedPeriod = 'thisMonth' }) => {
  const [loading, setLoading] = useState(true);
  const [guestsData, setGuestsData] = useState({
    totalGuests: 0,
    newGuests: 0,
    returningGuests: 0,
    averageStay: 0,
    topNationalities: [],
    guestsByMonth: [],
    occupancyTrend: []
  });

  useEffect(() => {
    fetchGuestsData();
  }, [dateRange?.startDate, dateRange?.endDate, selectedPeriod]);

  const fetchGuestsData = async () => {
    setLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Datos simulados
      setGuestsData({
        totalGuests: 1247,
        newGuests: 856,
        returningGuests: 391,
        averageStay: 3.2,
        topNationalities: [
          { country: 'Perú', count: 423, percentage: 33.9 },
          { country: 'Brasil', count: 287, percentage: 23.0 },
          { country: 'Chile', count: 198, percentage: 15.9 },
          { country: 'Argentina', count: 154, percentage: 12.4 },
          { country: 'Colombia', count: 123, percentage: 9.9 }
        ],
        guestsByMonth: [
          { month: 'Ene', guests: 98 },
          { month: 'Feb', guests: 112 },
          { month: 'Mar', guests: 145 },
          { month: 'Abr', guests: 132 },
          { month: 'May', guests: 167 },
          { month: 'Jun', guests: 189 }
        ],
        occupancyTrend: [
          { date: '2024-01', rate: 78 },
          { date: '2024-02', rate: 82 },
          { date: '2024-03', rate: 85 },
          { date: '2024-04', rate: 79 },
          { date: '2024-05', rate: 88 },
          { date: '2024-06', rate: 92 }
        ]
      });
    } catch (error) {
      console.error('Error fetching guests data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Lógica para exportar reporte
    console.log('Exportando reporte de huéspedes...');
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
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reporte de Huéspedes</h2>
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
              <p className="text-sm font-medium text-gray-600">Total Huéspedes</p>
              <p className="text-3xl font-bold text-gray-900">{guestsData.totalGuests.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12.5% vs período anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Huéspedes Nuevos</p>
              <p className="text-3xl font-bold text-gray-900">{guestsData.newGuests.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {((guestsData.newGuests / guestsData.totalGuests) * 100).toFixed(1)}% del total
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Huéspedes Recurrentes</p>
              <p className="text-3xl font-bold text-gray-900">{guestsData.returningGuests.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {((guestsData.returningGuests / guestsData.totalGuests) * 100).toFixed(1)}% del total
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estadía Promedio</p>
              <p className="text-3xl font-bold text-gray-900">{guestsData.averageStay}</p>
              <p className="text-sm text-gray-500">días</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Nacionalidades */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Nacionalidades</h3>
          </div>
          <div className="space-y-3">
            {guestsData.topNationalities.map((nationality, index) => (
              <div key={nationality.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{nationality.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${nationality.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {nationality.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Huéspedes por Mes */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Huéspedes por Mes</h3>
          </div>
          <div className="space-y-3">
            {guestsData.guestsByMonth.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(month.guests / Math.max(...guestsData.guestsByMonth.map(m => m.guests))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 w-12 text-right font-medium">
                    {month.guests}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detalles por Período</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Huéspedes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nuevos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurrentes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa Ocupación
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guestsData.occupancyTrend.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(Math.random() * 200) + 150}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(Math.random() * 100) + 80}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(Math.random() * 50) + 30}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.rate >= 85 ? 'bg-green-100 text-green-800' : 
                      item.rate >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GuestsReport;