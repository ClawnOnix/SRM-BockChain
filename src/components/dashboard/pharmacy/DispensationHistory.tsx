import React, { useState, useEffect } from 'react';
import { SearchIcon, CalendarIcon, ClockIcon, PillIcon, UserIcon, CheckCircleIcon, FilterIcon } from 'lucide-react';
export function DispensationHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dispensations, setDispensations] = useState<any[]>([]);

  // Get pharmacy session from localStorage
  const pharmacySession = JSON.parse(localStorage.getItem('user') || 'null');
  const [pharmacy, setPharmacy] = useState(null);

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

  useEffect(() => {
  if (!pharmacy) return;
  fetch('http://localhost:4000/api/recetas-list')
    .then(res => res.json())
    .then(data => {
      console.log('Fetched dispensations:', data);
      console.log('Current pharmacy:', pharmacy);
      // Only show recetas where status is 'Dispensada' and farmacia matches
      const filtered = data.filter(
        (r: any) => r.status === 'Dispensada' && r.ID_Farmacia === pharmacy.ID_Farmacia
      );
      setDispensations(filtered);
      console.log('Filtered dispensations:', filtered);
    });
}, [pharmacy]);
  // Filter dispensations based on search query and status filter
  const filteredDispensations = dispensations.filter(dispensation => {
    // Adapt to backend data structure
    const patient = dispensation.patient || dispensation.Paciente || '';
    const patientId = dispensation.patientId || dispensation.ID_Paciente || '';
    const prescriptionId = dispensation.prescriptionId || dispensation.recetaId || dispensation.Receta_ID_Receta || '';
    const status = dispensation.status || dispensation.Status || dispensation.estado || '';
    const matchesSearch = patient.toLowerCase().includes(searchQuery.toLowerCase()) || String(patientId).includes(searchQuery) || String(prescriptionId).includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-[#1e293b] rounded-xl shadow-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar por paciente o ID de receta" className="bg-[#0f172a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent" />
          </div>
        </div>
      </div>
      {/* Dispensation History List */}
      <div className="space-y-4">
        {filteredDispensations.length > 0 ? filteredDispensations.map((dispensation, idx) => {
          let detalle: { dosis?: string; instruccion?: string; medicamento?: string } | null = dispensation.Receta_Detalle;
          if (typeof detalle === 'string') {
            try {
              detalle = JSON.parse(detalle);
            } catch (e) {
              detalle = null;
            }
          }
          return (
            <div key={dispensation.id || dispensation.Dispensacion_ID || idx} className="bg-[#1e293b] rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-white">
                      {dispensation.Nombre_Paciente}
                    </h3>
                    <span className="ml-2 px-2 py-0.5 bg-[#0f172a] rounded text-xs text-gray-400">
                      {dispensation.Nombre_Medico}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-gray-400 text-sm">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{formatFecha(dispensation.Fecha_Dispensado)}</span>
                    <span className="mx-2">•</span>
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{dispensation.DispensedTime}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${dispensation.status === 'Completa' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                  {dispensation.status}
                </span>
              </div>
              <div className="mt-4 flex items-start">
                <div className="h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center flex-shrink-0">
                  <PillIcon className="h-5 w-5 text-[#4ade80]" />
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">
                    {detalle?.medicamento || dispensation.medicamento || 'Sin medicamento'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {detalle?.dosis || dispensation.dosis || 'Sin dosis'}
                  </p>
                </div>
              </div>
            </div>
          );
        }) : null}
      </div>
    </div>
  );
}