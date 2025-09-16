import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/patient/PatientDashboardLayout';
import { ActivePrescriptions } from '../components/dashboard/patient/ActivePrescriptions';
import { PrescriptionTimeline } from '../components/dashboard/patient/PrescriptionTimeline';
import { ShareAccess } from '../components/dashboard/patient/ShareAccess';
import { PatientProfile } from '../components/dashboard/patient/PatientProfile';
export function PatientDashboard() {
  const [activeSection, setActiveSection] = useState('recetas-activas');
  const [selectedRecetas, setSelectedRecetas] = useState<number[]>([]);
  return <DashboardLayout activeSection={activeSection} onNavigate={setActiveSection}>
      {activeSection === 'recetas-activas' && <div className="space-y-8">
          <h1 className="text-2xl font-bold text-white">Recetas Activas</h1>
          <p className="text-gray-300">
            Visualiza tus recetas médicas activas y compártelas con farmacias o
            profesionales de la salud.
          </p>
          <ActivePrescriptions selectedRecetas={selectedRecetas} setSelectedRecetas={setSelectedRecetas} />
          <ShareAccess selectedRecetas={selectedRecetas} setSelectedRecetas={setSelectedRecetas} />
        </div>}
      {activeSection === 'historial-recetas' && <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">
            Historial de Prescripciones
          </h1>
          <p className="text-gray-300">
            Revisa el historial completo de tus recetas médicas.
          </p>
          <PrescriptionTimeline />
        </div>}
      {activeSection === 'mi-perfil' && <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
          <PatientProfile />
        </div>}
  {/* Removed duplicate TwoFactorSlide (handled inside profile security card) */}
    </DashboardLayout>;
}