import React, { useState, useEffect } from 'react';
import { SearchIcon, PlusIcon, AlertCircleIcon } from 'lucide-react';
import { fetchMedicos, createPrescription, fetchPacientes, fetchMedicinas, fetchPrescriptions } from '../../services/api';
export function PrescriptionForm() {
  const [patients, setPatients] = useState<Array<{ID_Paciente:number,Nombre_Paciente:string,Correo_Paciente:string}>>([]);
  const [medications, setMedications] = useState<Array<{ID_Medicina:number,Nombre_Medicina:string}>>([]);
  const [patient, setPatient] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medicoId, setMedicoId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  type Receta = {
    ID_Receta: number;
    Nombre_Paciente: string;
    Nombre_Medicina: string;
    Dosis: string;
    Fecha_Receta: string;
    Nombre_Medico?: string;
  };
  const [recetas, setRecetas] = useState<Receta[]>([]);

  useEffect(() => {
    fetchPacientes().then((data) => setPatients(data));
    fetchMedicinas().then((data) => setMedications(data));

    // Get user_id from localStorage
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`/api/medico/info?usuarioId=${userId}`)
        .then(async res => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
          }
          // Try to parse JSON, catch HTML error pages
          try {
            const data = await res.json();
            if (data && data.ID_Medico) setMedicoId(data.ID_Medico);
            else setMedicoId(null);
          } catch (jsonErr) {
            console.error('Medico info response is not valid JSON:', jsonErr);
            setMedicoId(null);
          }
        })
        .catch(err => {
          console.error('Error fetching Medico ID:', err);
          setMedicoId(null);
        });
    }
  }, []);

  useEffect(() => {
    // Fetch recetas for current doctor
    if (medicoId) {
      fetchPrescriptions(medicoId)
        .then(data => setRecetas(data))
        .catch(err => {
          console.error('Error fetching recetas:', err);
          setRecetas([]);
        });
    }
  }, [medicoId, successMsg]); // refetch on doctor change or after new receta

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicoId) {
      setSuccessMsg('');
      alert('No se pudo obtener el ID del médico.');
      return;
    }
    // Build correct payload for backend
    const recetaDetalle = {
      medicamento: medications.find(med => med.ID_Medicina === Number(medication))?.Nombre_Medicina || '',
      dosis: dosage,
      instruccion: instructions
    };
    const payload = {
      pacienteId: patient, // must match backend
      medicoId: medicoId,
      medicamentos: [
        {
          id: medication,
          dosis: dosage
        }
      ],
      recetaDetalle // <-- new field for JSON column
      // signature removed, not needed for DB insert
    };
    // Debug: log payload before sending
    console.log('Submitting prescription:', payload);
    setSuccessMsg('');
    try {
      const response = await fetch('/api/recetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error submitting prescription:', errorData);
        setSuccessMsg('');
        alert('Error: ' + (errorData.error || 'Bad request. Verifica los datos.'));
        return;
      }
      // Success: show UI message
      setSuccessMsg('Receta emitida correctamente.');
      setPatient('');
      setMedication('');
      setDosage('');
      setInstructions('');
    } catch (err) {
      setSuccessMsg('');
      console.error('Network error:', err);
      alert('Error de red al emitir la receta.');
    }
  };
  return <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection */}
        {/* Blockchain fields */}
  {/* Hash and signature are now generated automatically in backend */}
        <div>
          <label htmlFor="patient" className="block text-sm font-medium text-gray-300 mb-1">
            Paciente
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select id="patient" value={patient} onChange={e => setPatient(e.target.value)} required className="bg-[#0f172a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent">
              <option value="">Seleccione un paciente</option>
              {patients.map(p => <option key={p.ID_Paciente} value={p.ID_Paciente}>
                  {p.Nombre_Paciente} - {p.Correo_Paciente}
                </option>)}
            </select>
          </div>
        </div>
        {/* Medication Selection */}
        <div>
          <label htmlFor="medication" className="block text-sm font-medium text-gray-300 mb-1">
            Medicamento
          </label>
          <select id="medication" value={medication} onChange={e => setMedication(e.target.value)} required className="bg-[#0f172a] text-white block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent">
            <option value="">Seleccione un medicamento</option>
            {medications.map(med => <option key={med.ID_Medicina} value={med.ID_Medicina}>
                {med.Nombre_Medicina}
              </option>)}
          </select>
        </div>
        {/* Dosage */}
        <div>
          <label htmlFor="dosage" className="block text-sm font-medium text-gray-300 mb-1">
            Dosis
          </label>
          <input id="dosage" type="text" value={dosage} onChange={e => setDosage(e.target.value)} required placeholder="Ej: 1 tableta cada 8 horas" className="bg-[#0f172a] text-white block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent" />
        </div>
        {/* Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-1">
            Instrucciones
          </label>
          <textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} required rows={3} placeholder="Instrucciones adicionales para el paciente" className="bg-[#0f172a] text-white block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent resize-none" />
        </div>
        {/* Warning */}
        <div className="bg-[#172554] border border-[#2563eb] rounded-lg p-4 flex items-start">
          <AlertCircleIcon className="h-5 w-5 text-[#60a5fa] mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-[#60a5fa]">
              Información importante
            </h3>
            <p className="mt-1 text-sm text-gray-300">
              Al firmar digitalmente esta receta, certifica que la información
              es correcta y será registrada en la blockchain para garantizar su
              integridad y trazabilidad.
            </p>
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end">
          <button type="submit" className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-[#0f172a] bg-[#4ade80] hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ade80] transition-colors font-medium">
            <PlusIcon className="mr-2 h-5 w-5" />
            Firmar Digitalmente
          </button>
        </div>
      </form>
      {successMsg && (
        <div className="mt-6 p-4 bg-green-700 text-white rounded-lg text-center font-semibold shadow">
          {successMsg}
        </div>
      )}
    </div>;
}