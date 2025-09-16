import React, { useState } from 'react';
import { TwoFactorSlide } from '../../TwoFactorSlide';
import { UserIcon, MailIcon, PhoneIcon, BuildingIcon, ShieldIcon, KeyIcon, FileTextIcon, ClipboardListIcon } from 'lucide-react';

interface Regulator {
  name: string;
  position: string;
  id: string;
  email: string;
  phone: string;
  department: string;
  organization: string;
  permissions: string[];
  lastLogin: {
    date: string;
    time: string;
    ip: string;
  };
  recentActions: { action: string; date: string; time: string }[];
}

export function RegulatorProfile() {
  const regulatorSession = JSON.parse(localStorage.getItem('user') || 'null');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

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
    setPasswordLoading(true);
    try {
      const user = regulatorSession;
      const res = await fetch('http://localhost:4000/api/cambiar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: user.ID_Usuario, contrasenaActual: currentPassword, contrasenaNueva: newPassword })
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setPasswordError(result.error || 'Error al cambiar la contraseña');
        return;
      }
      setPasswordSuccess('Contraseña cambiada exitosamente');
      setShowPasswordModal(false);
    } catch {
      setPasswordError('Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };
  const regulator: Regulator = {
    name: 'Dra. Elena Rodríguez',
    position: 'Supervisora de Control Farmacéutico',
    id: 'REG-56789',
    email: 'elena.rodriguez@regulacion.gob',
    phone: '+1 (555) 456-7890',
    department: 'Departamento de Control Farmacéutico',
    organization: 'Agencia Nacional de Regulación',
    permissions: ['Monitoreo de Prescripciones', 'Análisis de Datos', 'Generación de Reportes', 'Auditoría de Transacciones', 'Verificación de Licencias'],
    lastLogin: {
      date: '15/05/2023',
      time: '09:45',
      ip: '192.168.1.45'
    },
    recentActions: [
      { action: 'Generación de reporte mensual', date: '15/05/2023', time: '10:30' },
      { action: 'Revisión de prescripciones de alto riesgo', date: '15/05/2023', time: '09:50' },
      { action: 'Actualización de filtros de alerta', date: '14/05/2023', time: '16:20' },
      { action: 'Exportación de datos para análisis externo', date: '13/05/2023', time: '14:15' }
    ]
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Personal Info Card */}
      <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 md:col-span-1">
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-[#0f172a] flex items-center justify-center mb-4">
            <UserIcon className="h-12 w-12 text-[#3b82f6]" />
          </div>
          <h2 className="text-xl font-bold text-white">{regulator.name}</h2>
          <p className="text-[#3b82f6] font-medium">{regulator.position}</p>
          <p className="mt-1 text-gray-400 text-sm">ID: {regulator.id}</p>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-gray-300">
            <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{regulator.email}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{regulator.phone}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <BuildingIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div>{regulator.organization}</div>
              <div className="text-sm text-gray-400">
                {regulator.department}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Último Acceso al Sistema
          </h3>
          <div className="bg-[#0f172a] rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Fecha:</span>
              <span className="text-gray-300">{regulator.lastLogin.date}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Hora:</span>
              <span className="text-gray-300">{regulator.lastLogin.time}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">IP:</span>
              <span className="text-gray-300">{regulator.lastLogin.ip}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Permissions & Recent Activity */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Seguridad</h3>
          <div className="space-y-4">
            <div>
              <button className="text-[#3b82f6] text-sm hover:underline" onClick={handleOpenPasswordModal}>
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
                        <button type="submit" className="px-4 py-2 bg-[#3b82f6] text-white rounded" disabled={passwordLoading}>{passwordLoading ? 'Cambiando...' : 'Guardar'}</button>
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