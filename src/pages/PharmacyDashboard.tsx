import React, { useState } from 'react';
import { PharmacyDashboardLayout } from '../components/dashboard/pharmacy/PharmacyDashboardLayout';
import { QRScanner } from '../components/dashboard/pharmacy/QRScanner';
import { PrescriptionValidator } from '../components/dashboard/pharmacy/PrescriptionValidator';
import { DispensationHistory } from '../components/dashboard/pharmacy/DispensationHistory';
import { PharmacyProfile } from '../components/dashboard/pharmacy/PharmacyProfile';
export function PharmacyDashboard() {
  const [activeSection, setActiveSection] = useState('validar-receta');
  const [scannedPrescription, setScannedPrescription] = useState(null);
  const handleQRScanned = prescriptionData => {
    setScannedPrescription(prescriptionData);
  };
  return <PharmacyDashboardLayout activeSection={activeSection} onNavigate={setActiveSection}>
      {activeSection === 'validar-receta' && <div className="space-y-8">
          <h1 className="text-2xl font-bold text-white">
            Validar Receta Médica
          </h1>
          <p className="text-gray-300">
            Escanea o selecciona una receta compartida para validar y
            dispensar medicamentos.
          </p>
          {!scannedPrescription ? <QRScanner onQRScanned={handleQRScanned} /> : <PrescriptionValidator prescription={scannedPrescription} onReset={() => setScannedPrescription(null)} />}
        </div>}
      {activeSection === 'historial-dispensaciones' && <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">
            Historial de Dispensaciones
          </h1>
          <p className="text-gray-300">
            Visualiza el historial completo de medicamentos dispensados y busca
            por paciente.
          </p>
          <DispensationHistory />
        </div>}
      {activeSection === 'mi-perfil' && <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
          <PharmacyProfile />
        </div>}
  {/* Removed duplicate TwoFactorSlide (handled inside profile security card) */}
    </PharmacyDashboardLayout>;
}