import React from 'react';
import { CalendarIcon, PillIcon, ClockIcon, ShareIcon, DownloadIcon } from 'lucide-react';
import { fetchPrescriptionsByPatient } from '../../../services/api';
import { get } from 'http';

// Add Patient type definition
interface Patient {
  ID_Paciente: number;
  Nombre_Paciente: string;
  Correo_Paciente: string;
  Telefono_Paciente: string;
  // Add other fields as needed
}

// Add Prescription type definition
interface Prescription {
  ID_Receta: number;
  ID_Medico: number;
  Nombre_Medico: string;
  Correo_Medico: string;
  Fecha_Receta: string;
  status: 'Pendiente' | 'Dispensada'; // Add status field
}

interface ActivePrescriptionsProps {
  selectedRecetas: number[];
  setSelectedRecetas: React.Dispatch<React.SetStateAction<number[]>>;
}

export function ActivePrescriptions({ selectedRecetas, setSelectedRecetas }: ActivePrescriptionsProps) {
  const patientSession = JSON.parse(localStorage.getItem('user') || 'null');
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      setLoading(true);
      let isMounted = true;
      if (patientSession && patientSession.ID_Usuario) {
        fetch(`http://localhost:4000/api/pacientes?id=${patientSession.ID_Usuario}`)
          .then(res => res.json())
          .then(data => {
            if (!isMounted) return;
            if (Array.isArray(data) && data.length > 0) {
              const foundPatient = data[0];
              setPatient(foundPatient);
              if (foundPatient && foundPatient.ID_Paciente) {
                fetchPrescriptionsByPatient(foundPatient.ID_Paciente)
                  .then(data => {
                    if (!isMounted) return;
                    setPrescriptions(data);
                  })
                  .catch(() => { if (isMounted) setPrescriptions([]); })
                  .finally(() => { if (isMounted) setLoading(false); });
              } else {
                setLoading(false);
              }
            } else {
              setPatient(null);
              setLoading(false);
            }
          })
          .catch(() => {
            if (isMounted) setPatient(null);
            if (isMounted) setLoading(false);
          });
      } else {
        setLoading(false);
      }
      return () => { isMounted = false; };
    }, []); // Only run once on mount



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {prescriptions.map(prescription => (
        <div key={prescription.ID_Receta} className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  RX-{prescription.ID_Receta}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Médico: {prescription.Nombre_Medico}<br />
                  Email: {prescription.Correo_Medico}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${prescription.status === 'Dispensada' ? 'bg-gray-700 text-gray-300' : 'bg-green-900 text-green-300'}`}>
                {prescription.status === 'Dispensada' ? 'Inactiva' : 'Activa'}
              </span>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center text-gray-400 text-sm">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Emitida: {new Date(prescription.Fecha_Receta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {/* Checkbox for receta selection */}
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedRecetas.includes(prescription.ID_Receta)}
                    onChange={e => {
                      setSelectedRecetas(prev =>
                        e.target.checked
                          ? [...prev, prescription.ID_Receta]
                          : prev.filter(id => id !== prescription.ID_Receta)
                      );
                    }}
                    className="peer appearance-none h-5 w-5 border-2 border-gray-400 rounded-md checked:border-blue-500 checked:bg-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
                  />
                  <span className="flex items-center justify-center h-5 w-5 -ml-7 pointer-events-none">
                    <svg className="hidden peer-checked:block text-white" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect width="20" height="20" rx="5" fill="#3b82f6" />
                      <path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-gray-300 text-xs ml-2">Seleccionar</span>
                </label>
                {/* Remove Descargar QR button */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ml-2"
                  onClick={() => window.location.href = `/receta?id=${prescription.ID_Receta}`}
                >
                  Ver receta
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}