import React from 'react';
interface Doctor {
  Especialidad?: string;
  Licencia?: string;
  Hospital?: string;
  Hospital_Medico?: string;
  Certificaciones?: string;
  UltimaActividad?: string;
  ID_Medico: number;
  Nombre_Medico: string;
  Correo_Medico: string;
  Telefono_Medico: string;
  Llave_Publica_Medico: string;
  ID_Usuario: number;
}
import { TwoFactorSlide } from '../TwoFactorSlide';
import { UserIcon, MailIcon, PhoneIcon, AwardIcon, ShieldIcon } from 'lucide-react';

export function DoctorProfile() {
  // Get doctor from localStorage
  const doctorSession = JSON.parse(localStorage.getItem('user') || 'null');
  const [doctor, setDoctor] = React.useState<Doctor | null>(null);

  // State declarations
  const [recetasCount, setRecetasCount] = React.useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState('');
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  // Fetch doctor info and prescription count from backend
  React.useEffect(() => {
    if (doctorSession && doctorSession.ID_Usuario) {
      fetch(`http://localhost:4000/api/medico/info?usuarioId=${doctorSession.ID_Usuario}`)
        .then(res => res.json())
        .then(data => {
          setDoctor({ ...doctorSession, ...data });
          if (data && data.ID_Medico) {
            fetch(`http://localhost:4000/api/medico/recetas-count?medicoId=${data.ID_Medico}`)
              .then(res => res.json())
              .then(countData => setRecetasCount(countData.count))
              .catch(() => setRecetasCount(null));
          }
        })
        .catch(() => setDoctor(doctorSession));
    }
  }, []);

  // Password change handler
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
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

  // Early return if no doctor
  if (!doctor) return <div className="text-gray-400">No se encontró información del médico.</div>;

  // Use backend/user data if available, fallback to defaults
  const doctorUI = {
    name: doctor?.Nombre_Medico || '',
    specialty: doctor?.Especialidad || 'Médico General',
    license: doctor?.Licencia || (doctor?.ID_Medico ? `MED-${doctor.ID_Medico}` : 'MED-12345'),
    email: doctor?.Correo_Medico || '',
    phone: doctor?.Telefono_Medico || '',
    hospital: doctor?.Hospital || doctor?.Hospital_Medico || 'Hospital Central',
    certifications: doctor?.Certificaciones ? doctor.Certificaciones.split(';') : ['Certificado en Medicina Interna', 'Especialista en Salud Digital'],
    blockchain: {
      address: doctor?.Llave_Publica_Medico || '',
      transactions: recetasCount !== null ? recetasCount : '...',
      lastActive: doctor?.UltimaActividad
        ? new Date(doctor.UltimaActividad).toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' })
        : 'Sin actividad reciente'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Personal Info Card */}
      <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 md:col-span-1">
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-[#0f172a] flex items-center justify-center mb-4">
            <UserIcon className="h-12 w-12 text-[#4ade80]" />
          </div>
          <h2 className="text-xl font-bold text-white">{doctorUI.name}</h2>
          <p className="text-[#4ade80] font-medium">{doctorUI.specialty}</p>
          <p className="mt-1 text-gray-400 text-sm">
            Licencia: {doctorUI.license}
          </p>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-gray-300">
            <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{doctorUI.email}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{doctorUI.phone}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <AwardIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{doctorUI.hospital}</span>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Certificaciones
          </h3>
          <ul className="space-y-2">
            {doctorUI.certifications.map((cert: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-[#4ade80] flex items-center justify-center text-[#0f172a] text-xs mr-2 mt-0.5">
                  ✓
                </span>
                <span className="text-gray-300 text-sm">{cert}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Blockchain Info & Settings */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Información Blockchain
          </h3>
          <div className="bg-[#0f172a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Dirección de Wallet</span>
              <span
                className="text-white font-mono max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap"
                title={doctorUI.blockchain.address}
              >
                {doctorUI.blockchain.address.length > 20
                  ? doctorUI.blockchain.address.slice(0, 10) + '...' + doctorUI.blockchain.address.slice(-10)
                  : doctorUI.blockchain.address}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e293b] rounded-lg p-3">
                <span className="text-gray-400 text-sm">Recetas Emitidas</span>
                <p className="text-[#4ade80] text-xl font-bold">
                  {doctorUI.blockchain.transactions}
                </p>
              </div>
              <div className="bg-[#1e293b] rounded-lg p-3">
                <span className="text-gray-400 text-sm">Última Actividad</span>
                <p className="text-white">{doctorUI.blockchain.lastActive}</p>
              </div>
            </div>
          </div>
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
                        <button type="submit" className="px-4 py-2 bg-[#4ade80] text-white rounded" disabled={passwordLoading}>{passwordLoading ? 'Cambiando...' : 'Guardar'}</button>
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