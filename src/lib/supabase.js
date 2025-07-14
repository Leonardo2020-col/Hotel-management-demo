// src/lib/supabase.js - CONFIGURACIÓN CORREGIDA PARA VITE
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase - CORREGIDO PARA VITE
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validación de variables de entorno
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL no está definida en las variables de entorno')
  console.log('💡 Agrega VITE_SUPABASE_URL=tu_url_de_supabase en tu archivo .env')
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY no está definida en las variables de entorno')
  console.log('💡 Agrega VITE_SUPABASE_ANON_KEY=tu_anon_key en tu archivo .env')
}

// Crear cliente de Supabase con configuración robusta
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
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
  
  return { success: false, error: error.message }
}

// Función helper para verificar autenticación antes de operaciones
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { success: true, session, authenticated: !!session }
  } catch (error) {
    return { success: false, error: error.message, authenticated: false }
  }
}

// Función helper para queries con manejo de errores
export const safeQuery = async (queryFn, requireAuth = false) => {
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

// ==================== AUTENTICACIÓN MEJORADA ====================

export const auth = {
  // Iniciar sesión
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return handleAuthError(error) ? { data, error: null } : { data: null, error }
    } catch (error) {
      console.error('Error en signIn:', error)
      return { data: null, error: error.message }
    }
  },

  // Registrar usuario (simplificado para evitar errores admin)
  signUp: async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      return handleAuthError(error) ? { data, error: null } : { data: null, error }
    } catch (error) {
      console.error('Error en signUp:', error)
      return { data: null, error: error.message }
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      console.error('Error en signOut:', error)
      return { error: error.message }
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser()
      return handleAuthError(error) ? { data, error: null } : { data: null, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Obtener sesión actual
  getCurrentSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      return handleAuthError(error) ? { data, error: null } : { data: null, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Escuchar cambios de autenticación
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// ==================== HABITACIONES ROBUSTAS ====================

export const rooms = {
  // Obtener todas las habitaciones con fallback
  getAll: async () => {
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

  // Obtener habitaciones por piso
  getByFloor: async (floor) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('floor', floor)
        .order('number')
      
      if (error) {
        const fallbackData = getFallbackRooms().filter(room => 
          Math.floor((room.number - 1) / 100) + 1 === floor
        )
        return { data: fallbackData, error: null, fallback: true }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error obteniendo habitaciones por piso:', error)
      return { data: [], error: error.message }
    }
  },

  // Actualizar estado de habitación
  updateStatus: async (roomNumber, status) => {
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('rooms')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('number', roomNumber)
        .select()
      
      if (error) throw error
      return { data, error: null }
    })
  },

  // Crear nueva habitación
  create: async (roomData) => {
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
      
      if (error) throw error
      return { data, error: null }
    })
  }
}

// ==================== SERVICIOS/SNACKS ROBUSTOS ====================

export const services = {
  // Obtener todos los servicios con fallback
  getAll: async () => {
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
  },

  // Obtener servicios por tipo
  getByType: async (typeId) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('type_id', typeId)
        .eq('available', true)
        .order('name')
      
      if (error) {
        const fallbackData = getFallbackServices().filter(service => service.type_id === typeId)
        return { data: fallbackData, error: null, fallback: true }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error obteniendo servicios por tipo:', error)
      return { data: [], error: error.message }
    }
  }
}

// ==================== ÓRDENES ROBUSTAS ====================

export const orders = {
  // Obtener órdenes activas
  getActive: async () => {
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
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
      
      if (error) throw error
      return { data, error: null }
    })
  },

  // Completar orden (checkout)
  complete: async (orderId, checkoutData = {}) => {
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          check_out_time: new Date().toISOString(),
          ...checkoutData
        })
        .eq('id', orderId)
        .select()
      
      if (error) throw error
      return { data, error: null }
    })
  }
}

// ==================== HUÉSPEDES ====================

export const guests = {
  // Obtener todos los huéspedes
  getAll: async () => {
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    })
  },

  // Crear nuevo huésped
  create: async (guestData) => {
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('guests')
        .insert([guestData])
        .select()
      
      if (error) throw error
      return { data, error: null }
    })
  },

  // Buscar huésped
  search: async (query) => {
    return await safeQuery(async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .or(`dni.ilike.%${query}%,email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('full_name')
      
      if (error) throw error
      return { data, error: null }
    })
  }
}

// ==================== FUNCIONES FALLBACK ====================

// Datos de habitaciones de fallback
const getFallbackRooms = () => {
  const rooms = []
  
  // Piso 1 - Standard
  for (let i = 1; i <= 12; i++) {
    rooms.push({
      id: i,
      number: 100 + i,
      floor: 1,
      type: 'standard',
      status: i === 3 ? 'occupied' : i === 7 ? 'checkout' : 'available',
      price: 80.00,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire Acondicionado']
    })
  }
  
  // Piso 2 - Deluxe
  for (let i = 1; i <= 12; i++) {
    rooms.push({
      id: 12 + i,
      number: 200 + i,
      floor: 2,
      type: 'deluxe',
      status: i === 2 || i === 9 ? 'occupied' : i === 5 ? 'checkout' : 'available',
      price: 95.00,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Minibar']
    })
  }
  
  // Piso 3 - Suite
  for (let i = 1; i <= 12; i++) {
    rooms.push({
      id: 24 + i,
      number: 300 + i,
      floor: 3,
      type: 'suite',
      status: i === 4 ? 'occupied' : i === 6 ? 'checkout' : 'available',
      price: 110.00,
      capacity: 4,
      amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Minibar', 'Jacuzzi']
    })
  }
  
  return rooms
}

// Datos de tipos de servicios de fallback
const getFallbackServiceTypes = () => [
  { id: 'frutas', name: 'FRUTAS', description: 'Frutas frescas y naturales' },
  { id: 'bebidas', name: 'BEBIDAS', description: 'Bebidas frías y calientes' },
  { id: 'snacks', name: 'SNACKS', description: 'Bocadillos y aperitivos' },
  { id: 'postres', name: 'POSTRES', description: 'Dulces y postres' }
]

// Datos de servicios de fallback
const getFallbackServices = () => [
  // Frutas
  { id: 1, name: 'Manzana', price: 2.50, type_id: 'frutas', stock_quantity: 50 },
  { id: 2, name: 'Plátano', price: 1.50, type_id: 'frutas', stock_quantity: 30 },
  { id: 3, name: 'Naranja', price: 2.00, type_id: 'frutas', stock_quantity: 40 },
  { id: 4, name: 'Uvas', price: 4.00, type_id: 'frutas', stock_quantity: 25 },
  
  // Bebidas
  { id: 6, name: 'Agua', price: 1.00, type_id: 'bebidas', stock_quantity: 100 },
  { id: 7, name: 'Coca Cola', price: 2.50, type_id: 'bebidas', stock_quantity: 80 },
  { id: 8, name: 'Jugo de naranja', price: 3.00, type_id: 'bebidas', stock_quantity: 60 },
  { id: 9, name: 'Café', price: 2.00, type_id: 'bebidas', stock_quantity: 45 },
  
  // Snacks
  { id: 11, name: 'Papas fritas', price: 3.50, type_id: 'snacks', stock_quantity: 40 },
  { id: 12, name: 'Galletas', price: 2.00, type_id: 'snacks', stock_quantity: 35 },
  { id: 13, name: 'Nueces', price: 4.50, type_id: 'snacks', stock_quantity: 30 },
  { id: 14, name: 'Chocolate', price: 3.00, type_id: 'snacks', stock_quantity: 25 },
  
  // Postres
  { id: 16, name: 'Helado', price: 4.00, type_id: 'postres', stock_quantity: 30 },
  { id: 17, name: 'Torta', price: 5.50, type_id: 'postres', stock_quantity: 18 },
  { id: 18, name: 'Flan', price: 3.50, type_id: 'postres', stock_quantity: 22 },
  { id: 19, name: 'Brownie', price: 4.50, type_id: 'postres', stock_quantity: 20 }
]

// ==================== UTILIDADES MEJORADAS ====================

export const utils = {
  // Formatear error de Supabase
  formatError: (error) => {
    if (!error) return null
    
    const errorMap = {
      'PGRST116': 'No se encontraron resultados',
      '23505': 'Ya existe un registro con estos datos',
      '23503': 'No se puede eliminar: existen registros relacionados',
      '42501': 'Permisos insuficientes para esta operación',
      '42P01': 'La tabla no existe'
    }
    
    return errorMap[error.code] || error.message || 'Error desconocido'
  },

  // Verificar conexión mejorada
  testConnection: async () => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Variables de entorno no configuradas')
        return false
      }

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

  // Log de configuración mejorado
  logConfig: () => {
    console.log('🔧 Configuración de Supabase para Vite:')
    console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada')
    console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ No configurada')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('\n💡 Para configurar Supabase en Vite:')
      console.log('1. Crea un archivo .env en la raíz del proyecto')
      console.log('2. Agrega las siguientes líneas:')
      console.log('   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co')
      console.log('   VITE_SUPABASE_ANON_KEY=tu_anon_key')
      console.log('3. Reinicia el servidor de desarrollo (npm run dev)')
    }
  },

  // Verificar si está en modo desarrollo
  isDevelopment: () => import.meta.env.DEV,

  // Obtener todas las variables de entorno
  getEnvVars: () => ({
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV
  })
}

// ==================== TIEMPO REAL MEJORADO ====================

export const realtime = {
  // Suscribirse a cambios en habitaciones
  subscribeToRooms: (callback) => {
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

  // Suscribirse a cambios en órdenes
  subscribeToOrders: (callback) => {
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

  // Cancelar suscripción
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

// Verificar configuración al importar solo en desarrollo
if (import.meta.env.DEV) {
  utils.logConfig()
  // Test de conexión en desarrollo
  setTimeout(() => {
    utils.testConnection()
  }, 1000)
}

// Exportaciones compatibles con versiones anteriores
export { supabase as default }

// Nueva exportación para compatibilidad
export const snacks = services