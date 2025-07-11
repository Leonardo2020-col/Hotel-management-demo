import React from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Ajustes del sistema</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <SettingsIcon size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración del Sistema</h3>
        <p className="text-gray-600">Configuraciones generales, usuarios y preferencias</p>
      </div>
    </div>
  );
};

export default Settings;