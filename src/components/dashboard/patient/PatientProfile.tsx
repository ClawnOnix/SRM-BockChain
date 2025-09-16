import React, { useState, useEffect } from 'react';
interface Patient {
  ID_Paciente: number;
  Nombre_Paciente: string;
  Correo_Paciente: string;
  Telefono_Paciente: string;
  allergies?: string[];
  conditions?: string[];
}
import { TwoFactorSlide } from '../../TwoFactorSlide';
import { UserIcon, MailIcon, PhoneIcon, HeartIcon, ShieldIcon, AlertCircleIcon } from 'lucide-react';

export function PatientProfile() {
  const patientSession = JSON.parse(localStorage.getItem('user') || 'null');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [newRecetaMessage, setNewRecetaMessage] = useState('');
  const [recetaCount, setRecetaCount] = useState<number | null>(null);

  React.useEffect(() => {
    if (patientSession && patientSession.ID_Usuario) {
      fetch(`http://localhost:4000/api/pacientes?id=${patientSession.ID_Usuario}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setPatient(data[0]);
          else setPatient(null);
        })
        .catch(() => setPatient(null));
    }
  }, []);

  useEffect(() => {
      if (patient && patient.ID_Paciente) {
        try {
          fetch(`http://localhost:4000/api/recetas-paciente?pacienteId=${patient.ID_Paciente}`)
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                if (data[0].status === 'Pendiente') {
                  setNewRecetaMessage('¡Tienes una nueva receta médica!');
                }
              }
            });
        } catch {
          // ignore errors for polling
        }
      }

  }, [patient]);


  if (!patient) {
    return (
      <div className="text-red-500 p-4">
        Obteniendo información del paciente...
      </div>
    );
  }

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordError('');
    setPasswordSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Por favor complete todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }
    try {
      const res = await fetch('http://localhost:4000/api/cambiar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: patientSession.ID_Usuario, contrasenaActual: currentPassword, contrasenaNueva: newPassword })
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setPasswordError(result.error || 'Error al cambiar la contraseña');
        return;
      }
      setPasswordSuccess('Contraseña cambiada exitosamente.');
      setShowPasswordModal(false);
    } catch {
      setPasswordError('Error al cambiar la contraseña');
    }
  };
  // Add safe defaults for arrays
  const allergies: string[] = Array.isArray(patient.allergies) ? patient.allergies : [];
  const conditions: string[] = Array.isArray(patient.conditions) ? patient.conditions : [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Personal Info Card */}
      <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 md:col-span-1">
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-[#0f172a] flex items-center justify-center mb-4">
            <UserIcon className="h-12 w-12 text-[#4ade80]" />
          </div>
          <h2 className="text-xl font-bold text-white">{patient.Nombre_Paciente}</h2>
          <p className="text-[#4ade80] font-medium">Paciente</p>
          <p className="mt-1 text-gray-400 text-sm">ID: {patient.ID_Paciente}</p>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-gray-300">
            <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{patient.Correo_Paciente}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{patient.Telefono_Paciente}</span>
          </div>
          {/* You can add more real fields here if available */}
        </div>
      </div>
      {/* Medical Info & Blockchain */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Información Médica
          </h3>
          {newRecetaMessage && (
            <div className="mb-4 p-3 bg-green-900 text-green-300 rounded-lg text-center font-semibold">
              {newRecetaMessage}
            </div>
          )}

        </div>

        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Seguridad</h3>
          <div className="space-y-4">

            <div>
                <button className="text-[#4ade80] text-sm hover:underline" onClick={handleOpenPasswordModal}>
                  Cambiar contraseña
                </button>
                {/* Password Change Modal */}
                {showPasswordModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                      <h2 className="text-lg font-bold mb-4 text-gray-800">Cambiar contraseña</h2>
                      <form onSubmit={handlePasswordChange}>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                          <input type="password" className="mt-1 block w-full border rounded p-2" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                          <input type="password" className="mt-1 block w-full border rounded p-2" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                          <input type="password" className="mt-1 block w-full border rounded p-2" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        {passwordError && <div className="text-red-500 mb-2">{passwordError}</div>}
                        <div className="flex justify-end gap-2">
                          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={handleClosePasswordModal}>Cancelar</button>
                          <button type="submit" className="px-4 py-2 bg-[#4ade80] text-white rounded">Guardar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="text-green-500 mt-2">{passwordSuccess}</div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}