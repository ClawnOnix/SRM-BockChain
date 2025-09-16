import React, { useState, useEffect, useRef } from 'react';
interface Pharmacy {
  name?: string;
  branch?: string;
  license?: string;
  email?: string;
  phone?: string;
  address?: string;
  manager?: string;
  blockchain?: {
    address?: string;
    transactions?: number;
    lastActive?: string;
  };
  ID_Farmacia: number;
  Nombre_Farmacia: string;
  Correo_Farmacia: string;
  Telefono_Farmacia: string;
  Direccion_Farmacia?: string;
  Encargado?: string;
  staff?: string[];
}
import { TwoFactorSlide } from '../../TwoFactorSlide';
import { BuildingIcon, MailIcon, PhoneIcon, MapPinIcon, ShieldIcon, UserIcon } from 'lucide-react';

// Format date to H:minutes AM/PM day/month/year
function formatFecha(fecha: string) {
  const d = new Date(fecha);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} ${ampm} ${day}/${month}/${year}`;
}

export function PharmacyProfile() {
  // Get pharmacy from localStorage
  const pharmacySession = JSON.parse(localStorage.getItem('user') || 'null');
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [dispensations, setDispensations] = useState<any[]>([]);
  const [newDispensation, setNewDispensation] = useState<any>(null);
  const lastDispensationId = useRef<string | null>(null);

  // Calculate statistics from dispensations (after state is initialized)
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = now.toISOString().slice(0, 7);
  // Adjust to real field name from backend: Fecha_Dispensado (DATE or datetime)
  const dispensacionesHoy = Array.isArray(dispensations)
    ? dispensations.filter(d => {
        const f = d.Fecha_Dispensado || d.fecha || d.fecha_dispensado;
        if (!f) return false;
        return f.slice(0, 10) === todayStr;
      }).length
    : 0;
  const dispensacionesMes = Array.isArray(dispensations)
    ? dispensations.filter(d => {
        const f = d.Fecha_Dispensado || d.fecha || d.fecha_dispensado;
        if (!f) return false;
        return f.slice(0, 7) === monthStr;
      }).length
    : 0;
  const dispensacionesTotal = Array.isArray(dispensations) ? dispensations.length : 0;

  // Fetch dispensations and set state
useEffect(() => {
  if (!pharmacy) return;
  fetch('http://localhost:4000/api/recetas-list')
    .then(res => res.json())
    .then(data => {
      // Only show recetas where status is 'Dispensada' and farmacia matches
      const filtered = data.filter(
        (r: any) => r.status === 'Dispensada' && r.ID_Farmacia === pharmacy.ID_Farmacia
      );
      setDispensations(filtered);
    });
}, [pharmacy]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  useEffect(() => {
    if (pharmacySession && pharmacySession.ID_Usuario) {
      fetch(`http://localhost:4000/api/farmacias?usuarioId=${pharmacySession.ID_Usuario}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setPharmacy(data[0]);
          else setPharmacy(null);
        })
        .catch(() => setPharmacy(null));
    }
  }, []);


  if (!pharmacy) {
    return (
      <div className="text-red-500 p-4">
        Error: Pharmacy data not found or permission denied.
      </div>
    );
  }
  if (!pharmacy) {
    return (
      <div className="text-red-500 p-4">
        Error: Pharmacy data not found or permission denied.
      </div>
    );
  }

  // ...hooks now declared above, removed duplicates...

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
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Pharmacy Info Card */}
      <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 md:col-span-1">
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-[#0f172a] flex items-center justify-center mb-4">
            <BuildingIcon className="h-12 w-12 text-[#4ade80]" />
          </div>
          <h2 className="text-xl font-bold text-white">{pharmacy.Nombre_Farmacia}</h2>
        
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-gray-300">
            <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{pharmacy.Correo_Farmacia}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{pharmacy.Telefono_Farmacia}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
            <span>{pharmacy.Direccion_Farmacia}</span>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Personal de Farmacia</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 mr-3">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-white text-sm">{pharmacy.manager}</p>
                <p className="text-gray-400 text-xs">Gerente</p>
              </div>
            </div>
            {Array.isArray(pharmacy.staff) && pharmacy.staff.map((person: string, index: number) => (
              <div key={index} className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-[#0f172a] flex items-center justify-center text-gray-400 mr-3">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-white text-sm">{person}</p>
                  <p className="text-gray-400 text-xs">Farmacéutico</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Blockchain Info & Settings */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Información
          </h3>
          <div className="bg-[#0f172a] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e293b] rounded-lg p-3">
                <span className="text-gray-400 text-sm">Dispensaciones</span>
                <p className="text-[#4ade80] text-xl font-bold">
                    {dispensations.length > 0
                    ? `Nueva dispensación registrada: RX-${dispensations[0].Receta_ID_Receta}`
                    : 'Sin actividad reciente.'}
                </p>  
              </div>
              <div className="bg-[#1e293b] rounded-lg p-3">
                <span className="text-gray-400 text-sm">Última Actividad</span>
                <p className="text-white">
                  {dispensations.length > 0
                    ? formatFecha(dispensations[0].Fecha_Dispensado)
                    : 'Sin actividad reciente.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Estadísticas de Dispensación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f172a] rounded-lg p-4 text-center">
              <p className="text-[#4ade80] text-2xl font-bold">{dispensacionesHoy}</p>
              <p className="text-gray-400 text-sm">Dispensaciones Hoy</p>
            </div>
            <div className="bg-[#0f172a] rounded-lg p-4 text-center">
              <p className="text-[#4ade80] text-2xl font-bold">{dispensacionesMes}</p>
              <p className="text-gray-400 text-sm">Este Mes</p>
            </div>
            <div className="bg-[#0f172a] rounded-lg p-4 text-center">
              <p className="text-[#4ade80] text-2xl font-bold">{dispensacionesTotal}</p>
              <p className="text-gray-400 text-sm">Total</p>
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
    </div>;
}