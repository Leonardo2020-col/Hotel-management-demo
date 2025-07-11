/**
 * Formatea una cantidad como moneda peruana (Soles)
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (por defecto PEN para soles)
 * @returns {string} - Cantidad formateada como S/ X,XXX.XX
 */
export const formatCurrency = (amount, currency = 'PEN') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'S/ 0.00';
  }
  
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatea una fecha según el formato especificado
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado ('DD/MM/YYYY', 'HH:mm', etc.)
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  const d = new Date(date);
  
  if (format === 'HH:mm') {
    return d.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  if (format === 'DD/MM/YYYY') {
    return d.toLocaleDateString('es-PE');
  }
  
  return d.toLocaleDateString('es-PE');
};

/**
 * Formatea un número sin símbolo de moneda
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado con separadores de miles
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('es-PE').format(number);
};

/**
 * Formatea una fecha relativa (ej: "hace 2 horas")
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha relativa formateada
 */
export const getRelativeTime = (date) => {
  if (!date) return 'Nunca';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now - targetDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Ahora mismo';
  } else if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 7) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  } else {
    return targetDate.toLocaleDateString('es-PE');
  }
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor entre 0 y 1 (o 0 y 100)
 * @param {boolean} isDecimal - Si el valor está en decimal (0-1) o entero (0-100)
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (value, isDecimal = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(1)}%`;
};

/**
 * Formatea un número telefónico peruano
 * @param {string} phone - Número de teléfono
 * @returns {string} - Número formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remover todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según el patrón peruano
  if (cleaned.length === 9) {
    // Celular: 999 999 999
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (cleaned.length === 7) {
    // Fijo Lima: 999 9999
    return cleaned.replace(/(\d{3})(\d{4})/, '$1 $2');
  } else if (cleaned.length === 8) {
    // Fijo provincial: 99 999 999
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phone;
};

/**
 * Formatea un documento de identidad peruano (DNI)
 * @param {string} dni - Número de DNI
 * @returns {string} - DNI formateado
 */
export const formatDNI = (dni) => {
  if (!dni) return '';
  
  const cleaned = dni.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
  }
  
  return dni;
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea un número como moneda simple (para display sin Intl)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como S/ X,XXX.XX
 */
export const formatCurrencySimple = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'S/ 0.00';
  }
  
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Formatea tiempo transcurrido de manera más detallada
 * @param {Date|string} date - Fecha inicial
 * @returns {string} - Tiempo transcurrido detallado
 */
export const formatDetailedTime = (date) => {
  if (!date) return 'Sin fecha';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now - targetDate;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSeconds < 30) {
    return 'Ahora mismo';
  } else if (diffInSeconds < 60) {
    return `hace ${diffInSeconds} segundo${diffInSeconds > 1 ? 's' : ''}`;
  } else if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 7) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  } else if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    return `hace ${years} año${years > 1 ? 's' : ''}`;
  }
};