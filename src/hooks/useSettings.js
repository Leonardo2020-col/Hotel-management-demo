// src/hooks/useSettings.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext, PERMISSIONS } from './useAuth';
import toast from 'react-hot-toast';

export const SETTING_CATEGORIES = {
  GENERAL: 'general',
  OPERATIONS: 'operations',
  FINANCIAL: 'financial',
  NOTIFICATIONS: 'notifications',
  INTEGRATIONS: 'integrations',
  SECURITY: 'security'
};

export const DEFAULT_SETTINGS = {
  // Configuraciones generales
  hotel_name: 'Hotel Paraíso',
  hotel_logo: '',
  currency: 'PEN',
  timezone: 'America/Lima',
  language: 'es',
  
  // Operaciones
  check_in_time: '14:00',
  check_out_time: '11:00',
  max_occupancy_days: 30,
  early_checkin_fee: 0,
  late_checkout_fee: 0,
  cancellation_policy: 24,
  
  // Financieras
  tax_rate: 18.0,
  service_charge: 0,
  payment_methods: ['cash', 'card', 'transfer'],
  auto_calculate_taxes: true,
  
  // Notificaciones
  email_notifications: true,
  sms_notifications: false,
  reservation_reminders: true,
  payment_reminders: true,
  checkout_reminders: true,
  
  // Integraciones
  booking_engine_enabled: false,
  channel_manager_enabled: false,
  pos_integration: false,
  
  // Seguridad
  session_timeout: 480,
  password_expiry: 0,
  two_factor_auth: false,
  audit_log_retention: 365
};

export const useSettings = () => {
  const { hasPermission, staff } = useAuthContext();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar configuraciones
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      // Convertir array a objeto para facilitar el acceso
      const settingsObject = {};
      data.forEach(setting => {
        try {
          settingsObject[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch {
          settingsObject[setting.key] = setting.value;
        }
      });

      // Fusionar con valores por defecto
      const finalSettings = { ...DEFAULT_SETTINGS, ...settingsObject };
      setSettings(finalSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      setSettings(DEFAULT_SETTINGS); // Usar valores por defecto si hay error
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar una configuración específica
  const updateSetting = useCallback(async (key, value, category = SETTING_CATEGORIES.GENERAL) => {
    try {
      if (!hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
        throw new Error('No tienes permisos para modificar configuraciones');
      }

      setSaving(true);

      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value: JSON.stringify(value),
          category,
          description: getSettingDescription(key),
          updated_by: staff?.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Actualizar estado local
      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast.success('Configuración actualizada exitosamente');
    } catch (err) {
      console.error('Error updating setting:', err);
      toast.error('Error al actualizar configuración: ' + err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [hasPermission, staff]);

  // Actualizar múltiples configuraciones
  const updateMultipleSettings = useCallback(async (settingsToUpdate) => {
    try {
      if (!hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
        throw new Error('No tienes permisos para modificar configuraciones');
      }

      setSaving(true);

      const updates = Object.entries(settingsToUpdate).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
        category: getSettingCategory(key),
        description: getSettingDescription(key),
        updated_by: staff?.id,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates);

      if (error) throw error;

      // Actualizar estado local
      setSettings(prev => ({ ...prev, ...settingsToUpdate }));
      
      toast.success('Configuraciones actualizadas exitosamente');
    } catch (err) {
      console.error('Error updating multiple settings:', err);
      toast.error('Error al actualizar configuraciones: ' + err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [hasPermission, staff]);

  // Obtener configuración por clave
  const getSetting = useCallback((key, defaultValue = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }, [settings]);

  // Obtener configuraciones por categoría
  const getSettingsByCategory = useCallback(async (category) => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', category)
        .order('key');

      if (error) throw error;

      const categorySettings = {};
      data.forEach(setting => {
        try {
          categorySettings[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch {
          categorySettings[setting.key] = setting.value;
        }
      });

      return categorySettings;
    } catch (err) {
      console.error('Error fetching settings by category:', err);
      return {};
    }
  }, []);

  // Restablecer configuraciones por defecto
  const resetToDefaults = useCallback(async (category = null) => {
    try {
      if (!hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
        throw new Error('No tienes permisos para restablecer configuraciones');
      }

      setSaving(true);

      let settingsToReset = DEFAULT_SETTINGS;
      
      if (category) {
        settingsToReset = Object.entries(DEFAULT_SETTINGS)
          .filter(([key]) => getSettingCategory(key) === category)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      }

      await updateMultipleSettings(settingsToReset);
      
      toast.success(
        category 
          ? `Configuraciones de ${category} restablecidas`
          : 'Todas las configuraciones restablecidas'
      );
    } catch (err) {
      console.error('Error resetting settings:', err);
      toast.error('Error al restablecer configuraciones: ' + err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [hasPermission, updateMultipleSettings]);

  // Exportar configuraciones
  const exportSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      const exportData = {
        export_date: new Date().toISOString(),
        hotel_name: settings.hotel_name || 'Hotel Paraíso',
        settings: data.reduce((acc, setting) => {
          acc[setting.key] = {
            value: setting.value,
            category: setting.category,
            description: setting.description
          };
          return acc;
        }, {})
      };

      // Crear archivo de descarga
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hotel-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Configuraciones exportadas exitosamente');
    } catch (err) {
      console.error('Error exporting settings:', err);
      toast.error('Error al exportar configuraciones: ' + err.message);
    }
  }, [settings]);

  // Importar configuraciones
  const importSettings = useCallback(async (file) => {
    try {
      if (!hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
        throw new Error('No tienes permisos para importar configuraciones');
      }

      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.settings) {
        throw new Error('Formato de archivo inválido');
      }

      const settingsToImport = {};
      Object.entries(importData.settings).forEach(([key, data]) => {
        try {
          settingsToImport[key] = typeof data.value === 'string' 
            ? JSON.parse(data.value) 
            : data.value;
        } catch {
          settingsToImport[key] = data.value;
        }
      });

      await updateMultipleSettings(settingsToImport);
      toast.success('Configuraciones importadas exitosamente');
    } catch (err) {
      console.error('Error importing settings:', err);
      toast.error('Error al importar configuraciones: ' + err.message);
      throw err;
    }
  }, [hasPermission, updateMultipleSettings]);

  // Validar configuración
  const validateSetting = useCallback((key, value) => {
    const validators = {
      tax_rate: (val) => val >= 0 && val <= 100,
      check_in_time: (val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
      check_out_time: (val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
      max_occupancy_days: (val) => val > 0 && val <= 365,
      session_timeout: (val) => val >= 30 && val <= 1440,
      cancellation_policy: (val) => val >= 0 && val <= 168
    };

    const validator = validators[key];
    return validator ? validator(value) : true;
  }, []);

  // Cargar configuraciones al inicio
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Configurar actualizaciones en tiempo real
  useEffect(() => {
    const subscription = supabase
      .channel('settings_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings' },
        () => {
          console.log('Settings changed, refreshing...');
          fetchSettings();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [fetchSettings]);

  return {
    // Estado
    settings,
    loading,
    error,
    saving,

    // Acciones principales
    updateSetting,
    updateMultipleSettings,
    getSetting,
    getSettingsByCategory,

    // Utilidades
    resetToDefaults,
    exportSettings,
    importSettings,
    validateSetting,
    refreshSettings: fetchSettings,

    // Constantes
    SETTING_CATEGORIES,
    DEFAULT_SETTINGS
  };
};

// Función auxiliar para obtener la categoría de una configuración
function getSettingCategory(key) {
  const categoryMap = {
    hotel_name: SETTING_CATEGORIES.GENERAL,
    hotel_logo: SETTING_CATEGORIES.GENERAL,
    currency: SETTING_CATEGORIES.GENERAL,
    timezone: SETTING_CATEGORIES.GENERAL,
    language: SETTING_CATEGORIES.GENERAL,
    
    check_in_time: SETTING_CATEGORIES.OPERATIONS,
    check_out_time: SETTING_CATEGORIES.OPERATIONS,
    max_occupancy_days: SETTING_CATEGORIES.OPERATIONS,
    early_checkin_fee: SETTING_CATEGORIES.OPERATIONS,
    late_checkout_fee: SETTING_CATEGORIES.OPERATIONS,
    cancellation_policy: SETTING_CATEGORIES.OPERATIONS,
    
    tax_rate: SETTING_CATEGORIES.FINANCIAL,
    service_charge: SETTING_CATEGORIES.FINANCIAL,
    payment_methods: SETTING_CATEGORIES.FINANCIAL,
    auto_calculate_taxes: SETTING_CATEGORIES.FINANCIAL,
    
    email_notifications: SETTING_CATEGORIES.NOTIFICATIONS,
    sms_notifications: SETTING_CATEGORIES.NOTIFICATIONS,
    reservation_reminders: SETTING_CATEGORIES.NOTIFICATIONS,
    payment_reminders: SETTING_CATEGORIES.NOTIFICATIONS,
    checkout_reminders: SETTING_CATEGORIES.NOTIFICATIONS,
    
    booking_engine_enabled: SETTING_CATEGORIES.INTEGRATIONS,
    channel_manager_enabled: SETTING_CATEGORIES.INTEGRATIONS,
    pos_integration: SETTING_CATEGORIES.INTEGRATIONS,
    
    session_timeout: SETTING_CATEGORIES.SECURITY,
    password_expiry: SETTING_CATEGORIES.SECURITY,
    two_factor_auth: SETTING_CATEGORIES.SECURITY,
    audit_log_retention: SETTING_CATEGORIES.SECURITY
  };

  return categoryMap[key] || SETTING_CATEGORIES.GENERAL;
}

// Función auxiliar para obtener la descripción de una configuración
function getSettingDescription(key) {
  const descriptions = {
    hotel_name: 'Nombre del hotel que aparece en documentos y reportes',
    hotel_logo: 'Logo del hotel para documentos y interfaz',
    currency: 'Moneda utilizada en el sistema',
    timezone: 'Zona horaria del hotel',
    language: 'Idioma por defecto del sistema',
    
    check_in_time: 'Hora estándar de check-in (HH:MM)',
    check_out_time: 'Hora estándar de check-out (HH:MM)',
    max_occupancy_days: 'Máximo número de días de ocupación continua',
    early_checkin_fee: 'Cargo por check-in temprano',
    late_checkout_fee: 'Cargo por check-out tardío',
    cancellation_policy: 'Horas antes del check-in para cancelación gratuita',
    
    tax_rate: 'Tasa de impuestos aplicable (%)',
    service_charge: 'Cargo por servicio adicional (%)',
    payment_methods: 'Métodos de pago aceptados',
    auto_calculate_taxes: 'Calcular impuestos automáticamente',
    
    email_notifications: 'Enviar notificaciones por email',
    sms_notifications: 'Enviar notificaciones por SMS',
    reservation_reminders: 'Recordatorios de reservas',
    payment_reminders: 'Recordatorios de pagos pendientes',
    checkout_reminders: 'Recordatorios de check-out',
    
    booking_engine_enabled: 'Motor de reservas habilitado',
    channel_manager_enabled: 'Gestor de canales habilitado',
    pos_integration: 'Integración con punto de venta',
    
    session_timeout: 'Tiempo de expiración de sesión (minutos)',
    password_expiry: 'Expiración de contraseñas (días, 0 = nunca)',
    two_factor_auth: 'Autenticación de dos factores requerida',
    audit_log_retention: 'Retención de logs de auditoría (días)'
  };

  return descriptions[key] || '';
}