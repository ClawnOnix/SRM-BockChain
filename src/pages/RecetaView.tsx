import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UserIcon, PillIcon, ShieldIcon } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

async function fetchSharedAccess(sharedId: string) {
  const res = await fetch(`http://localhost:4000/api/shared-access/${sharedId}`);
  if (!res.ok) throw new Error('No se encontró el acceso compartido');
  return await res.json();
}

// Define types for receta and medicamento
interface Medicamento {
  Nombre_Medicina: string;
  Dosis: string;
}

interface Receta {
  ID_Receta: number;
  Fecha_Receta: string;
  Nombre_Paciente: string;
  Correo_Paciente: string;
  Nombre_Medico: string;
  Correo_Medico: string;
  medicamentos: Medicamento[];
  Instrucciones_Adicionales?: string;
}

async function fetchRecetasByIds(ids: number[]): Promise<Receta[]> {
  const promises = ids.map(id => fetch(`http://localhost:4000/api/receta/${id}`).then(res => res.json()));
  return Promise.all(promises);
}

export default function RecetaView() {
  const query = useQuery();
  const sharedId = query.get('shared');
  const recetaId = query.get('id');
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (sharedId) {
          // Fetch shared access info
          const shared = await fetchSharedAccess(sharedId);
          if (!shared.receta_ids || !Array.isArray(shared.receta_ids)) throw new Error('Acceso compartido inválido');
          const recetasData = await fetchRecetasByIds(shared.receta_ids);
          setRecetas(recetasData);
        } else if (recetaId) {
          // Single receta view
          const receta = await fetch(`http://localhost:4000/api/receta/${recetaId}`).then(res => res.json());
          setRecetas([receta]);
        } else {
          throw new Error('No se proporcionó receta o acceso compartido.');
        }
      } catch (err) {
        setError('Error al cargar la receta(s).');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sharedId, recetaId]);

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando receta...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
  if (!recetas.length) return null;

  return (
    <div className="bg-[#1e293b] rounded-xl shadow-lg p-8 max-w-2xl mx-auto mt-10">
      {recetas.map((receta, idx) => (
        <div key={receta.ID_Receta || idx} className="mb-8">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center mr-4">
              <PillIcon className="h-6 w-6 text-[#4ade80]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Receta #{receta.ID_Receta}</h2>
              <p className="text-gray-400 text-sm">Emitida: {receta.Fecha_Receta ? new Date(receta.Fecha_Receta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Paciente</h3>
              <div className="bg-[#0f172a] rounded-lg p-4 flex items-center">
                <UserIcon className="h-5 w-5 text-blue-300 mr-2" />
                <div>
                  <div className="text-white font-medium">{receta.Nombre_Paciente}</div>
                  <div className="text-gray-400 text-sm">Email: {receta.Correo_Paciente}</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Médico</h3>
              <div className="bg-[#0f172a] rounded-lg p-4 flex items-center">
                <ShieldIcon className="h-5 w-5 text-green-300 mr-2" />
                <div>
                  <div className="text-white font-medium">{receta.Nombre_Medico}</div>
                  <div className="text-gray-400 text-sm">Email: {receta.Correo_Medico}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Medicamentos</h3>
            <div className="bg-[#0f172a] rounded-lg p-4">
              {receta.medicamentos && receta.medicamentos.length > 0 ? (
                <ul className="list-disc pl-5 text-white">
                  {receta.medicamentos.map((med: Medicamento, idx: number) => (
                    <li key={idx}>
                      {med.Nombre_Medicina} - {med.Dosis}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400">No hay medicamentos registrados.</div>
              )}
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Instrucciones Adicionales</h3>
            <div className="bg-[#0f172a] rounded-lg p-4">
              {receta.Receta_Detalle && receta.Receta_Detalle.instruccion ? (
                <p className="text-white">{receta.Receta_Detalle.instruccion}</p>
              ) : (
                <div className="text-gray-400">No hay instrucciones adicionales.</div>
              )}
            </div>
          </div>
          <div className="mb-8 flex items-center gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Código QR de acceso</h3>
              {/* QRCode generation should be handled elsewhere or with correct value */}
            </div>
          </div>
          {/* Add more info as needed, e.g. blockchain hash, dispensada status, etc. */}
        </div>
      ))}
    </div>
  );
}
