import React, { useState, useEffect } from 'react';
import { supabase, checkAuth } from '../lib/supabase';

const DebugConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    supabaseUrl: '',
    anonKey: '',
    connected: false,
    authenticated: false,
    error: null,
    tables: [],
    testResults: {}
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const results = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'No configurada',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada',
      connected: false,
      authenticated: false,
      error: null,
      tables: [],
      testResults: {}
    };

    try {
      // Test 1: Verificar configuración básica
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Variables de entorno de Supabase no configuradas');
      }

      // Test 2: Probar conexión básica
      try {
        const { data, error } = await supabase.from('rooms').select('count', { count: 'exact', head: true });
        if (error) throw error;
        results.connected = true;
        results.testResults.roomsCount = data;
      } catch (connectionError) {
        results.testResults.connectionError = connectionError.message;
      }

      // Test 3: Verificar autenticación
      try {
        const authCheck = await checkAuth();
        results.authenticated = authCheck.authenticated;
        results.testResults.authStatus = authCheck;
      } catch (authError) {
        results.testResults.authError = authError.message;
      }

      // Test 4: Listar tablas disponibles
      try {
        const tableTests = [
          'rooms', 'guests', 'reservations', 'orders', 
          'services', 'service_types', 'inventory', 'staff', 'branches'
        ];
        
        for (const table of tableTests) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true });
            
            if (!error) {
              results.tables.push({ name: table, status: 'OK', count: data });
            } else {
              results.tables.push({ name: table, status: 'ERROR', error: error.message });
            }
          } catch (tableError) {
            results.tables.push({ name: table, status: 'ERROR', error: tableError.message });
          }
        }
      } catch (tablesError) {
        results.testResults.tablesError = tablesError.message;
      }

      // Test 5: Probar funciones RPC
      try {
        const { data, error } = await supabase.rpc('generate_confirmation_code');
        if (!error) {
          results.testResults.rpcFunctions = 'OK';
          results.testResults.sampleCode = data;
        } else {
          results.testResults.rpcError = error.message;
        }
      } catch (rpcError) {
        results.testResults.rpcError = rpcError.message;
      }

    } catch (error) {
      results.error = error.message;
    }

    setConnectionStatus(results);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'text-green-600';
      case 'ERROR': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OK': return '✅';
      case 'ERROR': return '❌';
      default: return '⚠️';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔍 Debug - Conexión a Supabase
      </h2>

      {/* Estado General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Configuración</h3>
          <div className="space-y-2 text-sm">
            <div>URL: <span className="font-mono">{connectionStatus.supabaseUrl}</span></div>
            <div>Anon Key: <span className="font-mono">{connectionStatus.anonKey}</span></div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Estado de Conexión</h3>
          <div className="space-y-2 text-sm">
            <div>
              Conectado: {connectionStatus.connected ? '✅ Sí' : '❌ No'}
            </div>
            <div>
              Autenticado: {connectionStatus.authenticated ? '✅ Sí' : '❌ No'}
            </div>
          </div>
        </div>
      </div>

      {/* Error General */}
      {connectionStatus.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Error General</h3>
          <p className="text-red-700 text-sm font-mono">{connectionStatus.error}</p>
        </div>
      )}

      {/* Tablas */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Estado de las Tablas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {connectionStatus.tables.map((table, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                table.status === 'OK' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{table.name}</span>
                <span className={getStatusColor(table.status)}>
                  {getStatusIcon(table.status)}
                </span>
              </div>
              {table.error && (
                <p className="text-xs text-red-600 mt-1 font-mono">{table.error}</p>
              )}
              {table.count !== undefined && (
                <p className="text-xs text-green-600 mt-1">Registros: {table.count}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resultados de Pruebas */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Resultados de Pruebas</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(connectionStatus.testResults, null, 2)}
          </pre>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Volver a Probar
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ♻️ Recargar Página
        </button>
      </div>

      {/* Consejos de Solución */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Consejos de Solución</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Verifica que las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén correctas</li>
          <li>• Asegúrate de que el proyecto de Supabase esté activo</li>
          <li>• Verifica las políticas RLS (Row Level Security) en las tablas</li>
          <li>• Comprueba que las tablas existan ejecutando el script SQL</li>
          <li>• Revisa la consola del navegador para errores adicionales</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugConnection;