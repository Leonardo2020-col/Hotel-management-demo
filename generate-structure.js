#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏨 Generando estructura de Hotel Management System...\n');

// Estructura completa de la aplicación
const structure = {
  'src/components/auth': [
    'BranchSelector.jsx',
    'ProtectedRoute.jsx'
  ],
  'src/components/common': [
    'Button.jsx',
    'Header.jsx',
    'Sidebar.jsx'
  ],
  'src/components/checkin': [
    'CheckoutSummary.jsx',
    'RoomGrid.jsx',
    'SnackSelection.jsx'
  ],
  'src/components/dashboard': [
    'OccupancyChart.jsx',
    'QuickCheckInModal.jsx',
    'RecentActivity.jsx',
    'RevenueChart.jsx',
    'RoomsToClean.jsx',
    'StatCard.jsx',
    'UpcomingCheckIns.jsx'
  ],
  'src/components/guests': [
    'CreateGuestModal.jsx',
    'GuestProfile.jsx',
    'GuestsFilters.jsx',
    'GuestsGrid.jsx',
    'GuestsList.jsx',
    'GuestsStats.jsx'
  ],
  'src/components/reports': [
    'CustomReport.jsx',
    'GeneralSummaryReport.jsx',
    'GuestsReport.jsx',
    'OccupancyReport.jsx',
    'ReportsFilters.jsx',
    'RevenueReport.jsx',
    'RoomsReport.jsx',
    'SuppliesReport.jsx'
  ],
  'src/components/reservations': [
    'CreateReservationModal.jsx',
    'ReservationCalendar.jsx',
    'ReservationFilters.jsx',
    'ReservationList.jsx',
    'ReservationStats.jsx'
  ],
  'src/components/rooms': [
    'CleaningManagement.jsx',
    'CreateRoomModal.jsx',
    'RoomFilters.jsx',
    'RoomGrid.jsx',
    'RoomList.jsx',
    'RoomStats.jsx',
    'RoomTypesManagement.jsx'
  ],
  'src/components/supplies': [
    'ConsumptionHistory.jsx',
    'ConsumptionModal.jsx',
    'CreateSupplyModal.jsx',
    'EditSupplyModal.jsx',
    'SuppliesFilters.jsx',
    'SuppliesGrid.jsx',
    'SuppliesList.jsx',
    'SuppliesStats.jsx'
  ],
  'src/context': [
    'AuthContext.js',
    'ReceptionContext.js'
  ],
  'src/hooks': [
    'useBranch.js',
    'useCheckInData.js',
    'useDashboard.js',
    'useGuests.js',
    'useReception.js',
    'useReports.js',
    'useReservations.js',
    'useRooms.js',
    'useSupplies.js'
  ],
  'src/layout': [
    'MainLayout.jsx'
  ],
  'src/lib': [
    'supabase.js'
  ],
  'src/pages/Auth': [
    'BranchSelectionPage.jsx',
    'LoginPage.jsx'
  ],
  'src/pages/CheckIn': [
    'CheckIn.jsx'
  ],
  'src/pages/Dashboard': [
    'Dashboard.jsx'
  ],
  'src/pages/Guests': [
    'Guests.jsx'
  ],
  'src/pages/Reception': [
    'Reception.jsx'
  ],
  'src/pages/Reports': [
    'Reports.jsx'
  ],
  'src/pages/Reservations': [
    'Reservations.jsx'
  ],
  'src/pages/Rooms': [
    'Rooms.jsx'
  ],
  'src/pages/Settings': [
    'Settings.jsx'
  ],
  'src/pages/Supplies': [
    'Supplies.jsx'
  ],
  'src/services': [
    'receptionService.js'
  ],
  'src/utils': [
    'authUtils.js',
    'formatters.js',
    'guestsMockData.js',
    'mockData.js',
    'reservationMockData.js',
    'roomMockData.js',
    'suppliesMockData.js'
  ]
};

// Templates básicos para cada tipo de archivo
const templates = {
  component: (name) => `// ${name}
import React from 'react';

const ${path.basename(name, '.jsx')} = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        ${path.basename(name, '.jsx')}
      </h2>
      <p className="text-gray-600">
        Componente generado automáticamente. Reemplaza con tu implementación.
      </p>
    </div>
  );
};

export default ${path.basename(name, '.jsx')};`,

  page: (name) => `// ${name}
import React from 'react';

const ${path.basename(name, '.jsx')} = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ${path.basename(name, '.jsx')}
        </h1>
        <p className="text-gray-600 mt-1">
          Página generada automáticamente
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow">
        <p className="text-gray-600">
          Contenido de ${path.basename(name, '.jsx')}. Reemplaza con tu implementación.
        </p>
      </div>
    </div>
  );
};

export default ${path.basename(name, '.jsx')};`,

  hook: (name) => `// ${name}
import { useState, useEffect } from 'react';

export const ${path.basename(name, '.js')} = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setData({});
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError
  };
};`,

  context: (name) => {
    const contextName = path.basename(name, '.js').replace('Context', '');
    return `// ${name}
import React, { createContext, useContext, useState } from 'react';

const ${contextName}Context = createContext();

export const ${contextName}Provider = ({ children }) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null
  });

  const value = {
    ...state,
    setState,
    updateData: (newData) => setState(prev => ({ ...prev, data: newData })),
    setLoading: (loading) => setState(prev => ({ ...prev, loading })),
    setError: (error) => setState(prev => ({ ...prev, error }))
  };

  return (
    <${contextName}Context.Provider value={value}>
      {children}
    </${contextName}Context.Provider>
  );
};

export const use${contextName} = () => {
  const context = useContext(${contextName}Context);
  if (!context) {
    throw new Error('use${contextName} must be used within ${contextName}Provider');
  }
  return context;
};`;
  },

  service: (name) => `// ${name}
class ${path.basename(name, '.js').charAt(0).toUpperCase() + path.basename(name, '.js').slice(1)} {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  async get(endpoint) {
    try {
      const response = await fetch(\`\${this.baseURL}\${endpoint}\`);
      return await response.json();
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
}

export default new ${path.basename(name, '.js').charAt(0).toUpperCase() + path.basename(name, '.js').slice(1)}();`,

  util: (name) => `// ${name}
// Utilidades para ${path.basename(name, '.js').replace('MockData', ' Mock Data').replace(/([A-Z])/g, ' $1').trim()}

${name.includes('MockData') ? `
// Datos de ejemplo para desarrollo y testing
export const mockData = {
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  lastUpdated: new Date().toISOString()
};

export const generateMockData = (count = 10) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};
` : `
// Funciones utilitarias

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
`}`
};

// Archivos especiales con contenido específico
const specialFiles = {
  'src/App.js': `import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import CheckIn from './pages/CheckIn/CheckIn';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/checkin" element={
              <ProtectedRoute>
                <CheckIn />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;`,

  'src/App.css': `.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}`,

  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos personalizados */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Clases utilitarias personalizadas */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}`,

  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}`,

  'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,

  '.env.example': `# Configuración de Supabase
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuración de la aplicación
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development`,

  'README.md': `# Hotel Management System

Sistema completo de gestión hotelera desarrollado con React.

## 🏨 Características

- ✅ Sistema de autenticación con roles (Admin/Recepción)
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión de reservas y check-in/check-out
- ✅ Administración de habitaciones y limpieza
- ✅ Control de inventario y suministros
- ✅ Reportes y análisis detallados
- ✅ Gestión completa de huéspedes
- ✅ Interfaz responsive y moderna

## 🚀 Instalación

\`\`\`bash
# Clonar el repositorio
git clone <repository-url>
cd hotel-management-system

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
\`\`\`

## 👥 Demo

### Credenciales de prueba:
- **Administrador**: admin@hotelparaiso.com / admin123
- **Recepción**: recepcion@hotelparaiso.com / recepcion123

### Diferencias entre roles:
- **Admin**: Acceso completo excepto check-in/reservas, requiere selección de sucursal
- **Recepción**: Acceso completo a operaciones diarias, sucursal preconfigurada

## 🛠️ Tecnologías

- React 18
- React Router Dom
- Tailwind CSS
- Lucide React (iconos)
- Supabase (base de datos)
- React Hot Toast (notificaciones)

## 📁 Estructura del proyecto

\`\`\`
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Autenticación
│   ├── common/         # Componentes comunes
│   ├── checkin/        # Check-in/Check-out
│   ├── dashboard/      # Dashboard
│   ├── guests/         # Gestión de huéspedes
│   ├── reports/        # Reportes
│   ├── reservations/   # Reservas
│   ├── rooms/          # Habitaciones
│   └── supplies/       # Insumos
├── context/            # Contextos de React
├── hooks/              # Hooks personalizados
├── layout/             # Layouts de la aplicación
├── lib/                # Configuraciones (Supabase)
├── pages/              # Páginas principales
├── services/           # Servicios de API
└── utils/              # Utilidades y helpers
\`\`\`

## 🎯 Funcionalidades principales

### Administración
- Dashboard con métricas clave
- Gestión de usuarios y permisos
- Reportes financieros y operacionales
- Configuración del sistema

### Recepción
- Check-in/Check-out rápido
- Gestión de reservas
- Estado de habitaciones en tiempo real
- Solicitudes de huéspedes

### Gestión
- Control de inventario
- Limpieza de habitaciones
- Base de datos de huéspedes
- Análisis y reportes

## 🔧 Configuración

1. Copia \`.env.example\` a \`.env\`
2. Configura las variables de entorno
3. Ejecuta las migraciones de base de datos (ver docs de Supabase)

## 📄 Licencia

Este proyecto es una demostración del sistema de gestión hotelera.

---
**Generado automáticamente con el generador de estructura**`
};

// Función para crear directorios
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dirPath}`);
  } else {
    console.log(`📁 Directorio ya existe: ${dirPath}`);
  }
}

// Función para crear archivos
function createFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`📄 Archivo creado: ${filePath}`);
  } else {
    console.log(`⚠️  Archivo ya existe: ${filePath}`);
  }
}

// Función para determinar el tipo de template
function getTemplate(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  
  if (dirName.includes('components')) {
    return templates.component(filePath);
  } else if (dirName.includes('pages')) {
    return templates.page(filePath);
  } else if (dirName.includes('hooks')) {
    return templates.hook(filePath);
  } else if (dirName.includes('context')) {
    return templates.context(filePath);
  } else if (dirName.includes('services')) {
    return templates.service(filePath);
  } else if (dirName.includes('utils')) {
    return templates.util(filePath);
  } else {
    return `// ${filePath}\n// Archivo generado automáticamente\n`;
  }
}

// Función principal
function generateStructure() {
  console.log('🚀 Iniciando generación de estructura...\n');

  // Crear archivos especiales primero
  console.log('📋 Creando archivos de configuración...');
  Object.entries(specialFiles).forEach(([filePath, content]) => {
    createDir(path.dirname(filePath));
    createFile(filePath, content);
  });

  console.log('\n📁 Creando estructura de directorios y archivos...');
  
  // Crear estructura principal
  Object.entries(structure).forEach(([directory, files]) => {
    createDir(directory);
    
    files.forEach(fileName => {
      const filePath = path.join(directory, fileName);
      const content = getTemplate(filePath);
      createFile(filePath, content);
    });
  });

  console.log('\n🎉 ¡Estructura generada exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. npm install');
  console.log('2. Reemplazar los archivos generados con tu código real');
  console.log('3. npm start');
  console.log('\n💡 Los archivos ya existentes no fueron sobrescritos');
  console.log('📁 Se crearon aproximadamente 70+ archivos organizados');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateStructure();
}

module.exports = { generateStructure, structure, templates };