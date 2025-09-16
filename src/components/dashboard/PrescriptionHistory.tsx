import React from 'react';
import { CalendarIcon, ClockIcon, PillIcon, FileTextIcon, ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface PrescriptionHistoryProps {
  limit?: number;
}
export function PrescriptionHistory({
  limit
}: PrescriptionHistoryProps) {
  type Prescription = {
    id: number;
    patient: string;
    medication: string;
    dosage: string;
    date: string;
    status: string;
  };
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.ID_Usuario) {
      setLoading(true);
      // First fetch doctor info by usuarioId
      fetch(`http://localhost:4000/api/medico/info?usuarioId=${user.ID_Usuario}`)
        .then(res => res.json())
        .then(doctor => {
          if (doctor && doctor.ID_Medico) {
            import('../../services/api').then(api => {
              api.fetchPrescriptions(doctor.ID_Medico)
                .then(data => {
                  setPrescriptions(data.map((p: any) => ({
                    id: p.ID_Receta,
                    patient: p.Nombre_Paciente || '',
                    medication: p.Nombre_Medicina || '',
                    dosage: p.Dosis || '',
                    date: p.Fecha_Receta || '',
                    status: p.status || (p.Dispensada ? 'Dispensada' : 'Pendiente')
                  })));
                  setError(null);
                })
                .catch(() => {
                  setError('Error al obtener recetas');
                  setPrescriptions([]);
                })
                .finally(() => setLoading(false));
            });
          } else {
            setLoading(false);
            setPrescriptions([]);
          }
        })
        .catch(() => {
          setLoading(false);
          setPrescriptions([]);
        });
    } else {
      setLoading(false);
      setPrescriptions([]);
    }
  }, []);

  const displayedPrescriptions = limit ? prescriptions.slice(0, limit) : prescriptions;

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Cargando recetas...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-400">{error}</div>;
  }

  return <div className="space-y-4">
      {displayedPrescriptions.map(prescription => <div key={prescription.id} className="bg-[#1e293b] rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">
                {prescription.patient}
              </h3>
              <div className="flex items-center mt-1 text-gray-400 text-sm">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>{prescription.date ? new Date(prescription.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${prescription.status === 'Dispensada' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
              {prescription.status}
            </span>
          </div>
          <div className="mt-4 flex items-start">
            <div className="h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center flex-shrink-0">
              <PillIcon className="h-5 w-5 text-[#4ade80]" />
            </div>
            <div className="ml-3">
              <p className="text-white font-medium">
                {prescription.medication}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {prescription.dosage}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-700">
            <div className="flex items-center text-xs text-gray-400">
              <FileTextIcon className="h-4 w-4 mr-1" />
              <span>{prescription.id}</span>
            </div>
            <button className="flex items-center text-[#4ade80] hover:text-[#22c55e] text-sm" onClick={() => navigate(`/receta?id=${prescription.id}`)}>
              Ver detalles
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>)}
      {!limit && displayedPrescriptions.length === 0 && <div className="text-center py-10 text-gray-400">
          No hay recetas para mostrar.
        </div>}
    </div>;
}