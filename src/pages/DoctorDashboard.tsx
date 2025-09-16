import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { PrescriptionForm } from '../components/dashboard/PrescriptionForm';
import { PrescriptionHistory } from '../components/dashboard/PrescriptionHistory';
import { DoctorProfile } from '../components/dashboard/DoctorProfile';
export function DoctorDashboard() {
  const [activeSection, setActiveSection] = useState('emitir-receta');
  return <DashboardLayout activeSection={activeSection} onNavigate={setActiveSection}>
      {activeSection === 'emitir-receta' && <div className="space-y-8">
          <h1 className="text-2xl font-bold text-white">
            Emitir Receta Médica
          </h1>
          <PrescriptionForm />
        </div>}
      {activeSection === 'historial-pacientes' && <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">
            Historial de Pacientes
          </h1>
          <p className="text-gray-300">
            Visualiza el historial completo de recetas emitidas para tus
            pacientes.
          </p>
          <PrescriptionHistory />
        </div>}
      {activeSection === 'mi-perfil' && <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
          <DoctorProfile />
        </div>}
  {/* Removed duplicate TwoFactorSlide (handled inside profile security card) */}
    </DashboardLayout>;
}