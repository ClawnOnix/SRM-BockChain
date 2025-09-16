import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDashboard } from './pages/PatientDashboard';
import { PharmacyDashboard } from './pages/PharmacyDashboard';
import { RegulatorDashboard } from './pages/RegulatorDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import RecetaView from './pages/RecetaView';
export function AppRouter() {
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles="medico"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/patient-dashboard" element={<ProtectedRoute allowedRoles="paciente"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/pharmacy-dashboard" element={<ProtectedRoute allowedRoles="farmacia"><PharmacyDashboard /></ProtectedRoute>} />
        <Route path="/regulator-dashboard" element={<ProtectedRoute allowedRoles="regulador"><RegulatorDashboard /></ProtectedRoute>} />
        <Route path="/receta" element={<RecetaView />} />
      </Routes>
    </BrowserRouter>;
}