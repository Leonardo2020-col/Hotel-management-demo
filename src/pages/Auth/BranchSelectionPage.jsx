// src/pages/Auth/BranchSelectionPage.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import BranchSelector from '../../components/auth/BranchSelector';

const BranchSelectionPage = () => {
  const { user, needsBranchSelection, selectBranch, loading, isAuthenticated } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si no necesita selección de sucursal, redirigir al dashboard
  if (!needsBranchSelection) {
    return <Navigate to="/" replace />;
  }

  // Solo administradores deberían estar aquí
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleBranchSelect = async (branch) => {
    const result = await selectBranch(branch);
    
    if (result.success) {
      // El estado se actualizará automáticamente y redirigirá
      console.log('Sucursal seleccionada:', branch);
    } else {
      console.error('Error al seleccionar sucursal:', result.error);
    }
  };

  return (
    <BranchSelector 
      onBranchSelect={handleBranchSelect}
      loading={loading}
    />
  );
};

export default BranchSelectionPage;