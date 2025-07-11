import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const OccupancyChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calcular tendencias si hay datos
  const occupancyTrend = data && data.length > 1 ? 
    ((data[data.length - 1].ocupacion - data[data.length - 2].ocupacion) / data[data.length - 2].ocupacion) * 100 : 0;
  
  const revenueTrend = data && data.length > 1 ? 
    ((data[data.length - 1].ingresos - data[data.length - 2].ingresos) / data[data.length - 2].ingresos) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{`${label}`}</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Ocupación: <span className="font-semibold text-blue-600">{payload[0].value}%</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Ingresos: <span className="font-semibold text-green-600">S/ {payload[1].value.toLocaleString()}</span>
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
      {/* Header con tendencias */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Ocupación e Ingresos por Mes
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Comparativa de ocupación y ingresos de los últimos 6 meses
          </p>
        </div>
        
        {/* Indicadores de tendencia */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Ocupación</p>
            <div className="flex items-center space-x-1">
              <TrendingUp className={`w-4 h-4 ${occupancyTrend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-semibold ${occupancyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(occupancyTrend).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">Ingresos</p>
            <div className="flex items-center space-x-1">
              <TrendingUp className={`w-4 h-4 ${revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-semibold ${revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(revenueTrend).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráfico Lineal */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
            />
            <YAxis 
              yAxisId="left"
              stroke="#3b82f6"
              fontSize={12}
              fontWeight={500}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={12}
              fontWeight={500}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                fontSize: '14px', 
                fontWeight: '500',
                paddingTop: '20px'
              }}
            />
            
            {/* Línea de Ocupación */}
            <Line 
              yAxisId="left"
              type="monotone"
              dataKey="ocupacion" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ 
                fill: '#3B82F6', 
                strokeWidth: 2, 
                stroke: '#ffffff',
                r: 6 
              }}
              activeDot={{ 
                r: 8, 
                stroke: '#3B82F6',
                strokeWidth: 2,
                fill: '#ffffff'
              }}
              name="Ocupación (%)"
            />
            
            {/* Línea de Ingresos */}
            <Line 
              yAxisId="right"
              type="monotone"
              dataKey="ingresos" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ 
                fill: '#10B981', 
                strokeWidth: 2, 
                stroke: '#ffffff',
                r: 6 
              }}
              activeDot={{ 
                r: 8, 
                stroke: '#10B981',
                strokeWidth: 2,
                fill: '#ffffff'
              }}
              name="Ingresos (S/)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas de resumen */}
      {data && data.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Ocupación Promedio</p>
              <p className="text-lg font-bold text-blue-600">
                {(data.reduce((acc, item) => acc + item.ocupacion, 0) / data.length).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Ingresos Promedio</p>
              <p className="text-lg font-bold text-green-600">
                S/ {(data.reduce((acc, item) => acc + item.ingresos, 0) / data.length).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Mejor Mes</p>
              <p className="text-lg font-bold text-purple-600">
                {data.reduce((max, item) => item.ocupacion > max.ocupacion ? item : max, data[0]).month}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Total Ingresos</p>
              <p className="text-lg font-bold text-gray-900">
                S/ {data.reduce((acc, item) => acc + item.ingresos, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccupancyChart;