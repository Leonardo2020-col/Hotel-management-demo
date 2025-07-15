// src/lib/supabase.js - CONFIGURACIÓN COMPLETA DE SUPABASE
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validación de variables de entorno
if (!supabaseUrl) {
  console.error('❌ REACT_APP_SUPABASE_URL no está definida en las variables de entorno')
  console.log('💡 Agrega REACT_APP_SUPABASE_URL=tu_url_de_supabase en tu archivo .env')
}

if (!supabaseAnonKey) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY no está definida en las variables de entorno')
  console.log('💡 Agrega REACT_APP_SUPABASE_ANON_KEY=tu_anon_key en tu archivo .env')
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// ==================== FUNCIONES FALTANTES ====================

// Función para verificar autenticación actual (REQUERIDA POR HOOKS)
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error checking auth:', error)
      return { success: false, session: null, error }
    }
    
    return { success: !!session, session, error: null }
  } catch (error) {
    console.error('Error in checkAuth:', error)
    return { success: false, session: null, error }
  }
}

// Función para manejar errores de autenticación (REQUERIDA POR HOOKS)
export const handleAuthError = (error) => {
  if (!error) return null
  
  // Manejar errores específicos de autenticación
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Credenciales de acceso inválidas'
    case 'Email not confirmed':
      return 'Email no confirmado'
    case 'Too many requests':
      return 'Demasiados intentos, intenta más tarde'
    case 'User not found':
      return 'Usuario no encontrado'
    case 'Invalid email':
      return 'Email inválido'
    case 'Password should be at least 6 characters':
      return 'La contraseña debe tener al menos 6 caracteres'
    default:
      return error.message || 'Error de autenticación'
  }
}

// Función para consultas seguras (REQUERIDA POR HOOKS)
export const safeQuery = async (queryFn) => {
  try {
    const result = await queryFn()
    return { data: result.data, error: result.error }
  } catch (error) {
    console.error('Error in safeQuery:', error)
    return { data: null, error }
  }
}

// Función para generar código de confirmación único
export const generateConfirmationCode = () => {
  const year = new Date().getFullYear()
  const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `HTP-${year}-${randomStr}`
}

// ==================== AUTENTICACIÓN ====================

export const auth = {
  // Iniciar sesión
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      console.error('Error en signIn:', error)
      return { data: null, error }
    }
  },

  // Registrar usuario
  signUp: async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      return { data, error }
    } catch (error) {
      console.error('Error en signUp:', error)
      return { data: null, error }
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Error en signOut:', error)
      return { error }
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Obtener sesión actual
  getCurrentSession: () => {
    return supabase.auth.getSession()
  },

  // Escuchar cambios de autenticación
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// ==================== HABITACIONES ====================

export const rooms = {
  // Obtener todas las habitaciones
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number')
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo habitaciones:', error)
      return { data: null, error }
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
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo habitaciones por piso:', error)
      return { data: null, error }
    }
  },

  // Actualizar estado de habitación
  updateStatus: async (roomNumber, status) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('number', roomNumber)
        .select()
      return { data, error }
    } catch (error) {
      console.error('Error actualizando estado de habitación:', error)
      return { data: null, error }
    }
  },

  // Crear nueva habitación
  create: async (roomData) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
      return { data, error }
    } catch (error) {
      console.error('Error creando habitación:', error)
      return { data: null, error }
    }
  }
}

// ==================== ÓRDENES/RESERVAS ====================

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
            services (id, name, price)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo órdenes activas:', error)
      return { data: null, error }
    }
  },

  // Crear nueva orden
  create: async (orderData) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
      return { data, error }
    } catch (error) {
      console.error('Error creando orden:', error)
      return { data: null, error }
    }
  },

  // Completar orden (checkout)
  complete: async (orderId, checkoutData = {}) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          check_out_time: new Date().toISOString(),
          ...checkoutData
        })
        .eq('id', orderId)
        .select()
      return { data, error }
    } catch (error) {
      console.error('Error completando orden:', error)
      return { data: null, error }
    }
  }
}

// ==================== SERVICIOS/SNACKS ====================

export const services = {
  // Obtener todos los servicios
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('available', true)
        .order('name')
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo servicios:', error)
      return { data: null, error }
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
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo tipos de servicios:', error)
      return { data: null, error }
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
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo servicios por tipo:', error)
      return { data: null, error }
    }
  }
}

// Mantener compatibilidad con snacks (alias para services)
export const snacks = services

// ==================== HUÉSPEDES ====================

export const guests = {
  // Obtener todos los huéspedes
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo huéspedes:', error)
      return { data: null, error }
    }
  },

  // Crear nuevo huésped
  create: async (guestData) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([guestData])
        .select()
      return { data, error }
    } catch (error) {
      console.error('Error creando huésped:', error)
      return { data: null, error }
    }
  },

  // Buscar huésped por DNI o email
  search: async (query) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .or(`dni.ilike.%${query}%,email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('full_name')
      return { data, error }
    } catch (error) {
      console.error('Error buscando huésped:', error)
      return { data: null, error }
    }
  }
}

// ==================== INVENTARIO ====================

export const inventory = {
  // Obtener todo el inventario
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('status', 'active')
        .order('name')
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo inventario:', error)
      return { data: null, error }
    }
  },

  // Actualizar stock
  updateStock: async (itemId, newStock) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({ 
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
      return { data, error }
    } catch (error) {
      console.error('Error actualizando stock:', error)
      return { data: null, error }
    }
  }
}

// ==================== REPORTES Y ANALYTICS ====================

export const analytics = {
  // Obtener ocupación por período
  getOccupancy: async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .rpc('get_occupancy_stats', {
          start_date: startDate,
          end_date: endDate
        })
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo estadísticas de ocupación:', error)
      return { data: null, error }
    }
  },

  // Obtener ingresos por período
  getRevenue: async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('total, created_at, check_in_date')
        .gte('check_in_date', startDate)
        .lte('check_in_date', endDate)
        .eq('status', 'completed')
      return { data, error }
    } catch (error) {
      console.error('Error obteniendo ingresos:', error)
      return { data: null, error }
    }
  }
}

// ==================== TIEMPO REAL ====================

export const realtime = {
  // Suscribirse a cambios en habitaciones
  subscribeToRooms: (callback) => {
    return supabase
      .channel('rooms')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' },
        callback
      )
      .subscribe()
  },

  // Suscribirse a cambios en órdenes
  subscribeToOrders: (callback) => {
    return supabase
      .channel('orders')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        callback
      )
      .subscribe()
  },

  // Cancelar suscripción
  unsubscribe: (channel) => {
    return supabase.removeChannel(channel)
  }
}

// ==================== STORAGE (ARCHIVOS) ====================

export const storage = {
  // Subir archivo
  upload: async (bucket, path, file) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file)
      return { data, error }
    } catch (error) {
      console.error('Error subiendo archivo:', error)
      return { data: null, error }
    }
  },

  // Obtener URL pública del archivo
  getPublicUrl: (bucket, path) => {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)
      return data.publicUrl
    } catch (error) {
      console.error('Error obteniendo URL pública:', error)
      return null
    }
  },

  // Eliminar archivo
  remove: async (bucket, paths) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths)
      return { data, error }
    } catch (error) {
      console.error('Error eliminando archivo:', error)
      return { data: null, error }
    }
  }
}

// ==================== UTILIDADES ====================

export const utils = {
  // Formatear error de Supabase
  formatError: (error) => {
    if (!error) return null
    
    // Errores comunes de Supabase
    if (error.code === 'PGRST116') {
      return 'No se encontraron resultados'
    }
    if (error.code === '23505') {
      return 'Ya existe un registro con estos datos'
    }
    if (error.code === '23503') {
      return 'No se puede eliminar: existen registros relacionados'
    }
    
    return error.message || 'Error desconocido'
  },

  // Verificar conexión
  testConnection: async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('❌ Error de conexión con Supabase:', error)
        return false
      }
      
      console.log('✅ Conexión con Supabase exitosa')
      return true
    } catch (error) {
      console.error('❌ Error verificando conexión:', error)
      return false
    }
  },

  // Log de configuración
  logConfig: () => {
    console.log('🔧 Configuración de Supabase:')
    console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada')
    console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ No configurada')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('\n💡 Para configurar Supabase:')
      console.log('1. Crea un archivo .env en la raíz del proyecto')
      console.log('2. Agrega las siguientes líneas:')
      console.log('   REACT_APP_SUPABASE_URL=tu_url_de_supabase')
      console.log('   REACT_APP_SUPABASE_ANON_KEY=tu_anon_key')
      console.log('3. Reinicia el servidor de desarrollo')
    }
  }
}

// Verificar configuración al importar
if (process.env.NODE_ENV === 'development') {
  utils.logConfig()
  utils.testConnection()
}

// Exportar cliente principal
export default supabase