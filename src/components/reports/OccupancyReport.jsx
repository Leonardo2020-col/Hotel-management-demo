import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, Bed } from 'lucide-react';

const OccupancyReport = ({ data, loading, detailed = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Datos por defecto si no hay data
  const defaultData = data || [
    { date: '2025-06-01', occupancy: 65, availableRooms: 15, occupiedRooms: 35 },
    { date: '2025-06-02', occupancy: 72, availableRooms: 14, occupiedRooms: 36 },
    { date: '2025-06-03', occupancy: 78, availableRooms: 11, occupiedRooms: 39 },
    { date: '2025-06-04', occupancy: 85, availableRooms: 8, occupiedRooms: 42 },
    { date: '2025-06-05', occupancy: 92, availableRooms: 4, occupiedRooms: 46 },
    { date: '2025-06-06', occupancy: 88, availableRooms: 6, occupiedRooms: 44 },
    { date: '2025-06-07', occupancy: 77, availableRooms: 12, occupiedRooms: 38 }
  ];

  // Datos para el gráfico de distribución (solo en vista detallada)
  const distributionData = [
    { name: 'Ocupadas', value: 38, color: '#3B82F6' },
    { name: 'Disponibles', value: 12, color: '#10B981' }
  ];

  const avgOccupancy = defaultData.reduce((acc, day) => acc + day.occupancy, 0) / defaultData.length;
  const maxOccupancy = Math.max(...defaultData.map(day => day.occupancy));
  const minOccupancy = Math.min(...defaultData.map(day => day.occupancy));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{new Date(label).toLocaleDateString('es-PE')}</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Ocupación: <span className="font-semibold text-blue-600">{payload[0].value}%</span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Reporte de Ocupación</h3>
          <p className="text-gray-600 text-sm mt-1">
            {detailed ? 'Análisis detallado de ocupación' : 'Tendencia de ocupación diaria'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Promedio</p>
            <p className="text-lg font-bold text-blue-600">{avgOccupancy.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">Ocupación Promedio</p>
              <p className="text-xl font-bold text-blue-900">{avgOccupancy.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-800 font-medium">Máxima Ocupación</p>
              <p className="text-xl font-bold text-green-900">{maxOccupancy}%</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bed className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-800 font-medium">Mínima Ocupación</p>
              <p className="text-xl font-bold text-orange-900">{minOccupancy}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico principal */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={defaultData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone"
              dataKey="occupancy" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, stroke: '#ffffff', r: 5 }}
              activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Vista detallada adicional */}
      {detailed && (
        <>
          {/* Gráfico de barras para habitaciones ocupadas vs disponibles */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Habitaciones</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defaultData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="occupiedRooms" fill="#3B82F6" name="Ocupadas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="availableRooms" fill="#10B981" name="Disponibles" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de pie para estado actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Estado Actual de Habitaciones</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                {distributionData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas adicionales */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Métricas Clave</h4>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Días con +80% ocupación</span>
                    <span className="font-semibold text-green-600">
                      {defaultData.filter(day => day.occupancy >= 80).length} días
                    </span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Días con -60% ocupación</span>
                    <span className="font-semibold text-red-600">
                      {defaultData.filter(day => day.occupancy < 60).length} días
                    </span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Variabilidad ocupación</span>
                    <span className="font-semibold text-blue-600">
                      {(maxOccupancy - minOccupancy)}% rango
                    </span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tendencia general</span>
                    <span className="font-semibold text-purple-600">
                      {defaultData[defaultData.length - 1].occupancy > defaultData[0].occupancy ? '↗ Creciente' : '↘ Decreciente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OccupancyReport;