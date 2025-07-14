// src/lib/supabase.js - CONFIGURACIÓN FINAL PARA VITE
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase para VITE (no React)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// MODO DESARROLLO: Si no están las variables, usar valores por defecto
const isDevelopment = import.meta.env.DEV
const hasConfig = supabaseUrl && supabaseAnonKey

// Configuración por defecto para desarrollo sin variables
const defaultUrl = 'https://demo.supabase.co'
const defaultKey = 'demo-anon-key'

// Usar configuración real o por defecto
const finalUrl = hasConfig ? supabaseUrl : defaultUrl
const finalKey = hasConfig ? supabaseAnonKey : defaultKey

// Log de configuración
if (isDevelopment) {
  console.log('🔧 Configuración de Supabase para Vite:')
  console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada (usando demo)')
  console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ No configurada (usando demo)')
  
  if (!hasConfig) {
    console.log('\n💡 Para configurar Supabase en Vite:')
    console.log('1. Crea un archivo .env en la raíz del proyecto')
    console.log('2. Agrega las siguientes líneas:')
    console.log('   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co')
    console.log('   VITE_SUPABASE_ANON_KEY=tu_anon_key')
    console.log('3. Reinicia el servidor de desarrollo (npm run dev)')
    console.log('\n🎯 Por ahora funcionará con datos de demostración')
  }
}

// Crear cliente de Supabase con configuración robusta
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: hasConfig,
    persistSession: hasConfig,
    detectSessionInUrl: hasConfig,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: hasConfig ? 10 : 0
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'hotel-management-vite'
    }
  }
})

// ==================== FUNCIONES HELPER MEJORADAS ====================

// Función helper para manejar errores de autenticación
export const handleAuthError = (error) => {
  if (!error) return { success: true }
  
  if (error?.message?.includes('401') || error?.message?.includes('unauthorized')) {
    console.warn('Authentication required for this operation')
    return { success: false, error: 'Authentication required', needsAuth: true }
  }
  
  if (error?.code === 'PGRST116') {
    return { success: false, error: 'No se encontraron resultados', notFound: true }
  }
  
  if (error?.code === '42P01') {
    return { success: false, error: 'Tabla no existe en la base de datos', tableNotFound: true }
  }
  
  return { success: false, error: error.message }
}

// Función helper para verificar si tenemos configuración válida
export const hasValidConfig = () => hasConfig

// Función helper para verificar autenticación
export const checkAuth = async () => {
  if (!hasConfig) {
    return { success: true, session: null, authenticated: false, demo: true }
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { success: true, session, authenticated: !!session }
  } catch (error) {
    return { success: false, error: error.message, authenticated: false }
  }
}

// Función helper para queries con manejo de errores robusto
export const safeQuery = async (queryFn, requireAuth = false) => {
  // Si no tenemos configuración válida, retornar error inmediatamente
  if (!hasConfig) {
    return { data: null, error: 'No valid Supabase configuration', demo: true }
  }
  
  try {
    if (requireAuth) {
      const authCheck = await checkAuth()
      if (!authCheck.authenticated) {
        return { data: null, error: 'Authentication required' }
      }
    }
    
    return await queryFn()
  } catch (error) {
    console.error('Query error:', error)
    return { data: null, error: error.message }
  }
}

// ==================== FUNCIONES ESPECÍFICAS PARA EL SISTEMA ====================

// Habitaciones con fallback robusto
export const rooms = {
  // Obtener todas las habitaciones
  getAll: async () => {
    if (!hasConfig) {
      console.log('📄 Usando datos de demostración para habitaciones')
      return { data: getFallbackRooms(), error: null, demo: true }
    }
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number')
      
      if (error) {
        console.warn('Error obteniendo habitaciones de Supabase, usando fallback:', error)
        return { data: getFallbackRooms(), error: null, fallback: true }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error obteniendo habitaciones:', error)
      return { data: getFallbackRooms(), error: error.message, fallback: true }
    }
  },

  // Actualizar estado de habitación
  updateStatus: async (roomNumber, status) => {
    if (!hasConfig) {
      console.log(`📄 DEMO: Actualizando habitación ${roomNumber} a ${status}`)
      return { data: [{ number: roomNumber, status }], error: null, demo: true }
    }
    
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('rooms')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('number', roomNumber)
        .select()
      
      if (error) throw error
      return { data, error: null }
    })
  }
}

// Servicios/snacks con fallback
export const services = {
  // Obtener todos los servicios
  getAll: async () => {
    if (!hasConfig) {
      console.log('📄 Usando datos de demostración para servicios')
      return { data: getFallbackServices(), error: null, demo: true }
    }
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('available', true)
        .order('name')
      
      if (error) {
        console.warn('Error obteniendo servicios, usando fallback:', error)
        return { data: getFallbackServices(), error: null, fallback: true }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error obteniendo servicios:', error)
      return { data: getFallbackServices(), error: error.message, fallback: true }
    }
  },

  // Obtener tipos de servicios
  getTypes: async () => {
    if (!hasConfig) {
      console.log('📄 Usando tipos de servicios de demostración')
      return { data: getFallbackServiceTypes(), error: null, demo: true }
    }
    
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (error) {
        return { data: getFallbackServiceTypes(), error: null, fallback: true }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error obteniendo tipos de servicios:', error)
      return { data: getFallbackServiceTypes(), error: error.message, fallback: true }
    }
  }
}

// Órdenes con manejo robusto
export const orders = {
  // Obtener órdenes activas
  getActive: async () => {
    if (!hasConfig) {
      console.log('📄 No hay órdenes en modo demostración')
      return { data: [], error: null, demo: true }
    }
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_services (
            quantity,
            unit_price,
            total_price,
            services (id, name)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.warn('Error obteniendo órdenes activas:', error)
        return { data: [], error: null, fallback: true }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error obteniendo órdenes activas:', error)
      return { data: [], error: error.message }
    }
  },

  // Crear nueva orden
  create: async (orderData) => {
    if (!hasConfig) {
      console.log('📄 DEMO: Creando orden local:', orderData)
      return { 
        data: { 
          id: Date.now(), 
          ...orderData, 
          created_at: new Date().toISOString() 
        }, 
        error: null, 
        demo: true 
      }
    }
    
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
      
      if (error) throw error
      return { data, error: null }
    })
  }
}

// ==================== DATOS DE FALLBACK ====================

const getFallbackRooms = () => {
  const rooms = []
  
  // Piso 1 - Standard (101-112)
  for (let i = 1; i <= 12; i++) {
    rooms.push({
      id: i,
      number: 100 + i,
      floor: 1,
      type: 'standard',
      status: i === 3 ? 'occupied' : i === 7 ? 'checkout' : 'available',
      price: 80.00,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'A/C']
    })
  }
  
  // Piso 2 - Deluxe (201-212)
  for (let i = 1; i <= 12; i++) {
    rooms.push({
      id: 12 + i,
      number: 200 + i,
      floor: 2,
      type: 'deluxe',
      status: i === 2 || i === 9 ? 'occupied' : i === 5 ? 'checkout' : 'available',
      price: 95.00,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'A/C', 'Minibar']
    })
  }
  
  // Piso 3 - Suite (301-312)
  for (let i = 1; i <= 12; i++) {
    rooms.push({
      id: 24 + i,
      number: 300 + i,
      floor: 3,
      type: 'suite',
      status: i === 4 ? 'occupied' : i === 6 ? 'checkout' : 'available',
      price: 110.00,
      capacity: 4,
      amenities: ['WiFi', 'TV', 'A/C', 'Minibar', 'Jacuzzi']
    })
  }
  
  return rooms
}

const getFallbackServiceTypes = () => [
  { id: 'frutas', name: 'FRUTAS', description: 'Frutas frescas y naturales', active: true },
  { id: 'bebidas', name: 'BEBIDAS', description: 'Bebidas frías y calientes', active: true },
  { id: 'snacks', name: 'SNACKS', description: 'Bocadillos y aperitivos', active: true },
  { id: 'postres', name: 'POSTRES', description: 'Dulces y postres', active: true }
]

const getFallbackServices = () => [
  // Frutas
  { id: 1, name: 'Manzana', price: 2.50, type_id: 'frutas', stock_quantity: 50, available: true, category: 'frutas' },
  { id: 2, name: 'Plátano', price: 1.50, type_id: 'frutas', stock_quantity: 30, available: true, category: 'frutas' },
  { id: 3, name: 'Naranja', price: 2.00, type_id: 'frutas', stock_quantity: 40, available: true, category: 'frutas' },
  { id: 4, name: 'Uvas', price: 4.00, type_id: 'frutas', stock_quantity: 25, available: true, category: 'frutas' },
  
  // Bebidas
  { id: 6, name: 'Agua', price: 1.00, type_id: 'bebidas', stock_quantity: 100, available: true, category: 'bebidas' },
  { id: 7, name: 'Coca Cola', price: 2.50, type_id: 'bebidas', stock_quantity: 80, available: true, category: 'bebidas' },
  { id: 8, name: 'Jugo de naranja', price: 3.00, type_id: 'bebidas', stock_quantity: 60, available: true, category: 'bebidas' },
  { id: 9, name: 'Café', price: 2.00, type_id: 'bebidas', stock_quantity: 45, available: true, category: 'bebidas' },
  
  // Snacks
  { id: 11, name: 'Papas fritas', price: 3.50, type_id: 'snacks', stock_quantity: 40, available: true, category: 'snacks' },
  { id: 12, name: 'Galletas', price: 2.00, type_id: 'snacks', stock_quantity: 35, available: true, category: 'snacks' },
  { id: 13, name: 'Nueces', price: 4.50, type_id: 'snacks', stock_quantity: 30, available: true, category: 'snacks' },
  { id: 14, name: 'Chocolate', price: 3.00, type_id: 'snacks', stock_quantity: 25, available: true, category: 'snacks' },
  
  // Postres
  { id: 16, name: 'Helado', price: 4.00, type_id: 'postres', stock_quantity: 30, available: true, category: 'postres' },
  { id: 17, name: 'Torta', price: 5.50, type_id: 'postres', stock_quantity: 18, available: true, category: 'postres' },
  { id: 18, name: 'Flan', price: 3.50, type_id: 'postres', stock_quantity: 22, available: true, category: 'postres' },
  { id: 19, name: 'Brownie', price: 4.50, type_id: 'postres', stock_quantity: 20, available: true, category: 'postres' }
]

// ==================== UTILIDADES ====================

export const utils = {
  // Verificar si tenemos configuración válida
  hasValidConfig: () => hasConfig,
  
  // Verificar si estamos en modo demo
  isDemoMode: () => !hasConfig,
  
  // Formatear error de Supabase
  formatError: (error) => {
    if (!error) return null
    
    const errorMap = {
      'PGRST116': 'No se encontraron resultados',
      '23505': 'Ya existe un registro con estos datos',
      '23503': 'No se puede eliminar: existen registros relacionados',
      '42501': 'Permisos insuficientes para esta operación',
      '42P01': 'La tabla no existe en la base de datos'
    }
    
    return errorMap[error.code] || error.message || 'Error desconocido'
  },

  // Verificar conexión
  testConnection: async () => {
    if (!hasConfig) {
      console.log('📄 Modo demostración - no hay configuración de Supabase')
      return false
    }

    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.error('❌ Error de conexión con Supabase:', error.message)
        return false
      }
      
      console.log('✅ Conexión con Supabase exitosa')
      return true
    } catch (error) {
      console.error('❌ Error verificando conexión:', error.message)
      return false
    }
  },

  // Obtener información del entorno
  getEnvInfo: () => ({
    hasConfig,
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV
  })
}

// ==================== TIEMPO REAL ====================

export const realtime = {
  // Suscribirse a cambios (solo si tenemos configuración válida)
  subscribeToRooms: (callback) => {
    if (!hasConfig) {
      console.log('📄 Realtime no disponible en modo demo')
      return null
    }
    
    try {
      return supabase
        .channel('rooms_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'rooms' },
          callback
        )
        .subscribe()
    } catch (error) {
      console.warn('Error setting up rooms subscription:', error)
      return null
    }
  },

  subscribeToOrders: (callback) => {
    if (!hasConfig) {
      console.log('📄 Realtime no disponible en modo demo')
      return null
    }
    
    try {
      return supabase
        .channel('orders_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          callback
        )
        .subscribe()
    } catch (error) {
      console.warn('Error setting up orders subscription:', error)
      return null
    }
  },

  unsubscribe: (channel) => {
    try {
      if (channel) {
        return supabase.removeChannel(channel)
      }
    } catch (error) {
      console.warn('Error unsubscribing:', error)
    }
  }
}

// Test de conexión al cargar (solo en desarrollo)
if (isDevelopment && hasConfig) {
  setTimeout(() => {
    utils.testConnection()
  }, 1000)
}

// Exportaciones para compatibilidad
export { supabase as default }
export { services as snacks }