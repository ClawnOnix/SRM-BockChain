// Fetch Medico from backend
export async function fetchMedicos(): Promise<Medico[]> {
  const res = await fetch('http://localhost:4000/api/medicos');
  if (!res.ok) throw new Error('Failed to fetch medicos');
  return await res.json();
}

// Create prescription
export async function createPrescription({ pacienteId, medicoId, medicamentos, contentHash, signature }: {
  pacienteId: number,
  medicoId: number,
  medicamentos: { id: number, dosis: string }[],
  contentHash: string,
  signature: string
}) {
  const res = await fetch('http://localhost:4000/api/recetas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pacienteId, medicoId, medicamentos, contentHash, signature })
  });
  if (!res.ok) throw new Error('Error al crear receta');
  return await res.json();
}

// Fetch prescriptions by doctor
export async function fetchPrescriptions(medicoId: number) {
  const res = await fetch(`http://localhost:4000/api/recetas?medicoId=${medicoId}`);
  if (!res.ok) throw new Error('Error al obtener recetas');
  return await res.json();
}

// Fetch all patients
export async function fetchPacientes() {
  const res = await fetch('http://localhost:4000/api/pacientes');
  if (!res.ok) throw new Error('Error al obtener pacientes');
  return await res.json();
}

// Fetch all medicines
// Fetch prescriptions by patient
export async function fetchPrescriptionsByPatient(pacienteId: number) {
  const res = await fetch(`http://localhost:4000/api/recetas-paciente?pacienteId=${pacienteId}`);
  if (!res.ok) throw new Error('Error al obtener recetas del paciente');
  return await res.json();
}
export async function fetchMedicinas() {
  const res = await fetch('http://localhost:4000/api/medicinas');
  if (!res.ok) throw new Error('Error al obtener medicinas');
  return await res.json();
}

// Fetch patient info by usuarioId
export async function fetchPacienteInfo(usuarioId: number) {
  const res = await fetch(`http://localhost:4000/api/paciente/info?usuarioId=${usuarioId}`);
  if (!res.ok) throw new Error('Error al obtener información del paciente');
  return await res.json();
}

import {
  Provincia,
  Municipio,
  Medico,
  Paciente,
  Farmacia,
  Clasificacion_Medicina,
  Medicina,
  Receta,
  Receta_Medicina,
  Dispensado,
  Permitidos
} from '../types/domain';

// Mock data for demonstration
export const mockProvincias: Provincia[] = [
  { Codigo_Provincia: 1, Nombre_Provincia: 'Santo Domingo' },
  { Codigo_Provincia: 2, Nombre_Provincia: 'Santiago' }
];

export const mockMunicipios: Municipio[] = [
  { Codigo_Municipio: 1, Nombre_Municipio: 'Distrito Nacional' },
  { Codigo_Municipio: 2, Nombre_Municipio: 'Santiago de los Caballeros' }
];

export const mockMedicos: Medico[] = [
  {
    ID_Medico: 1,
    Nombre_Medico: 'Dr. Juan Pérez',
    Llave_Publica_Medico: '0x123...',
    Telefono_Medico: '809-555-1234',
    Correo_Medico: 'juan.perez@hospital.com',
    Fecha_Creacion_Medico: '2025-09-01T10:00:00Z'
  }
];

export const mockPacientes: Paciente[] = [
  {
    ID_Paciente: 1,
    Codigo_Municipio: 1,
    Nombre_Paciente: 'María González',
    Telefono_Paciente: '809-555-5678',
    Correo_Paciente: 'maria.gonzalez@email.com',
    Fecha_Creacion_Paciente: '2025-09-01T10:00:00Z'
  }
];

export const mockFarmacias: Farmacia[] = [
  {
    ID_Farmacia: 1,
    Codigo_Municipio: 1,
    Nombre_Farmacia: 'Farmacia Central'
  }
];

export const mockClasificaciones: Clasificacion_Medicina[] = [
  { Codigo_Clasificacion_Medicina: 1, Nombre_Clasificacion_Medicina: 'Antibiótico' },
  { Codigo_Clasificacion_Medicina: 2, Nombre_Clasificacion_Medicina: 'Analgésico' }
];

export const mockMedicinas: Medicina[] = [
  { ID_Medicina: 1, Codigo_Clasificacion_Medicina: 1, Nombre_Medicina: 'Amoxicilina 500mg' },
  { ID_Medicina: 2, Codigo_Clasificacion_Medicina: 2, Nombre_Medicina: 'Paracetamol 500mg' }
];

export const mockRecetas: Receta[] = [
  {
    ID_Receta: 1,
    ID_Paciente: 1,
    ID_Medico: 1,
    Fecha_Receta: '2025-09-04',
    Hash_Receta: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  }
];

export const mockRecetaMedicinas: Receta_Medicina[] = [
  { ID_Receta: 1, Codigo_Medicina: 1, Dosis: '1 tableta cada 8 horas' },
  { ID_Receta: 1, Codigo_Medicina: 2, Dosis: '1 tableta cada 12 horas' }
];

export const mockDispensados: Dispensado[] = [
  { ID_Farmacia: 1, ID_Receta: 1, Fecha_Dispensado: '2025-09-05' }
];

export const mockPermitidos: Permitidos[] = [
  { ID_Paciente: 1, ID_Medico: 1, ID_Receta: 1 }
];

// Example API service
export const api = {
  getProvincias: async (): Promise<Provincia[]> => mockProvincias,
  getMunicipios: async (): Promise<Municipio[]> => mockMunicipios,
  getMedicos: async (): Promise<Medico[]> => mockMedicos,
  getPacientes: async (): Promise<Paciente[]> => mockPacientes,
  getFarmacias: async (): Promise<Farmacia[]> => mockFarmacias,
  getClasificaciones: async (): Promise<Clasificacion_Medicina[]> => mockClasificaciones,
  getMedicinas: async (): Promise<Medicina[]> => mockMedicinas,
  getRecetas: async (): Promise<Receta[]> => mockRecetas,
  getRecetaMedicinas: async (recetaId: number): Promise<Receta_Medicina[]> => mockRecetaMedicinas.filter(rm => rm.ID_Receta === recetaId),
  getDispensados: async (): Promise<Dispensado[]> => mockDispensados,
  getPermitidos: async (): Promise<Permitidos[]> => mockPermitidos
};
