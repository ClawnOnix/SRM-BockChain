import React from 'react';
import { PillIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { fetchPrescriptionsByPatient } from '../../../services/api';

export function PrescriptionTimeline() {
  const patientSession = JSON.parse(localStorage.getItem('user') || 'null');
  const [patient, setPatient] = React.useState<any>(null);
  const [prescriptions, setPrescriptions] = React.useState<any[]>([]);
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
                  // Parse Receta_Detalle for each prescription
                  const parsed = data.map((presc: any) => {
                    if (presc.Receta_Detalle) {
                      try {
                        presc.recetaDetalle = JSON.parse(presc.Receta_Detalle);
                      } catch {}
                    }
                    return presc;
                  });
                  setPrescriptions(parsed);
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
  }, []);

  return (
    <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
      <div className="space-y-8">
        {prescriptions.map((prescription, index) => (
          <div key={prescription.ID_Receta} className="relative">
            {/* Timeline connector */}
            {index < prescriptions.length - 1 && <div className="absolute top-10 bottom-0 left-4 w-0.5 bg-gray-700"></div>}
            <div className="flex">
              {/* Timeline bullet */}
              <div className={`
                h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
                bg-green-900 text-green-300
              `}>
                <PillIcon className="h-4 w-4" />
              </div>
              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="bg-[#0f172a] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        RX-{prescription.ID_Receta}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Médico: {prescription.Nombre_Medico}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${prescription.status === 'Dispensada' ? 'bg-gray-700 text-gray-300' : 'bg-green-900 text-green-300'}`}>
                      {prescription.status === 'Dispensada' ? 'Inactiva' : 'Activa'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Emitida: {new Date(prescription.Fecha_Receta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>ID Receta: {prescription.ID_Receta}</span>
                  </div>
                  {/* Optionally show medicine/dose if present */}
                  {prescription.Nombre_Medicina && (
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <span>Medicina: {prescription.Nombre_Medicina}</span>
                    </div>
                  )}
                  {prescription.Dosis && (
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <span>Dosis: {prescription.Dosis}</span>
                    </div>
                  )}
                  {/* Show instrucciones if present */}
                  {prescription.recetaDetalle && prescription.recetaDetalle.instruccion && (
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <span>Instrucciones: {prescription.recetaDetalle.instruccion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}