import React, { useState, useEffect, Fragment } from 'react';
import { ChevronDownIcon, ChevronUpIcon, AlertCircleIcon, CheckCircleIcon, ClockIcon, FileTextIcon, EyeIcon, ArrowUpDownIcon } from 'lucide-react';

interface PrescriptionsTableProps {
  filters: {
    query: string;
    filterType: string;
    dateRange: string;
    status: string;
  };
}

type RiskLevel = 'normal' | 'moderado' | 'elevado';

interface PrescriptionRow {
  id: string;
  doctor: { name: string; license: string; specialty: string };
  patient: { name: string; id: string };
  medication: string;
  dosage: string;
  date: string;        // Formatted date: HH:MM dd/mm/yy
  dateRaw: string;     // Original date string from backend
  expiryDate: string;  // Formatted expiry date (if provided)
  expiryRaw: string;   // Raw expiry date
  status: string;
  pharmacy: string;
  riskLevel: RiskLevel;
  blockchain: { hash: string; timestamp: number | ''; verified: boolean };
}

// Minimal shape for backend receta rows (add fields as needed)
interface BackendReceta {
  Receta_ID_Receta?: number;
  id?: string;
  Nombre_Medico?: string;
  Licencia_Medico?: string;
  Especialidad_Medico?: string;
  Nombre_Paciente?: string;
  ID_Paciente?: string;
  Receta_Detalle?: string | DetalleReceta;
  Nombre_Medicina?: string;
  Dosis?: string;
  Fecha_Receta?: string;
  Fecha_Expiracion?: string;
  status?: string; // Provided by backend transformation
  Estado?: string; // Alternate field name just in case
  Nombre_Farmacia?: string;
  Hash_Receta?: string;
}

interface DetalleReceta {
  medicamento?: string;
  dosis?: string;
  risk?: RiskLevel;
  [key: string]: unknown;
}

export function PrescriptionsTable({
  filters
}: PrescriptionsTableProps) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/recetas-list')
      .then(res => res.json())
      .then(data => {
        console.log('API recetas-list raw data:', data);
  const transformed: PrescriptionRow[] = (data as BackendReceta[]).map((r, idx) => {
          let detalle: DetalleReceta = {};
          try {
              detalle = typeof r.Receta_Detalle === 'string' ? JSON.parse(r.Receta_Detalle) : r.Receta_Detalle || {};
          } catch {
            detalle = {};
          }
            const rawDate: string = r.Fecha_Receta || ''; 
          const rawExpiry: string = r.Fecha_Expiracion || '';
          const risk: RiskLevel = detalle.risk || 'normal';
            return {
              id: `${r.Receta_ID_Receta !== undefined && r.Receta_ID_Receta !== null ? r.Receta_ID_Receta : 'N/A'}`,
            doctor: {
              name: r.Nombre_Medico || '',
              license: r.Licencia_Medico || '',
              specialty: r.Especialidad_Medico || ''
            },
            patient: {
              name: r.Nombre_Paciente || '',
              id: r.ID_Paciente || ''
            },
            medication: detalle.medicamento || r.Nombre_Medicina || '',
            dosage: detalle.dosis || r.Dosis || '',
            date: rawDate ? formatFecha(rawDate) : '',
            dateRaw: rawDate,
            expiryDate: rawExpiry ? formatFecha(rawExpiry) : '',
            expiryRaw: rawExpiry,
            status: r.status || r.Estado || '',
            pharmacy: r.Nombre_Farmacia || '',
            riskLevel: risk,
            blockchain: {
              hash: r.Hash_Receta || '',
              timestamp: rawDate ? new Date(rawDate).getTime() / 1000 : '',
              verified: true
            }
          };
        });
        setPrescriptions(transformed);
      });
  }, []);

  function formatFecha(fecha: string) {
    if (!fecha) return '';
    // Normalize: allow 'YYYY-MM-DD', 'YYYY-MM-DD HH:MM:SS', or ISO 'YYYY-MM-DDTHH:MM:SSZ'
    let dateObj = new Date(fecha);
    // If parsing failed and string has a space instead of T, try replacing
    if (isNaN(dateObj.getTime()) && fecha.includes(' ')) {
      dateObj = new Date(fecha.replace(' ', 'T'));
    }
    if (isNaN(dateObj.getTime())) {
      return fecha; // Fallback to original if still invalid
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const day = pad(dateObj.getDate());
    const month = pad(dateObj.getMonth() + 1);
    const year = dateObj.getFullYear().toString().slice(-2);
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }

  // Filter prescriptions based on search filters
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Search query filter
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const matchesDoctor = prescription.doctor.name.toLowerCase().includes(query);
      const matchesPatient = prescription.patient.name.toLowerCase().includes(query);
      const matchesMedication = prescription.medication.toLowerCase().includes(query);
      const matchesId = prescription.id.toLowerCase().includes(query);
      if (!(matchesDoctor || matchesPatient || matchesMedication || matchesId)) {
        return false;
      }
    }
    // Filter type
    if (filters.filterType !== 'all') {
      if (filters.filterType === 'doctor' && !prescription.doctor.name.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      if (filters.filterType === 'patient' && !prescription.patient.name.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      if (filters.filterType === 'medication' && !prescription.medication.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      if (filters.filterType === 'pharmacy' && (!prescription.pharmacy || !prescription.pharmacy.toLowerCase().includes(filters.query.toLowerCase()))) {
        return false;
      }
    }
    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active' && prescription.status !== 'Activa') {
        return false;
      }
      if (filters.status === 'dispensed' && prescription.status !== 'Dispensada') {
        return false;
      }
      if (filters.status === 'expired' && prescription.status !== 'Expirada') {
        return false;
      }
      if (filters.status === 'suspicious' && prescription.riskLevel !== 'elevado') {
        return false;
      }
    }
    return true;
  });

  // Sort prescriptions
  const sortedPrescriptions = [...filteredPrescriptions].sort((a, b) => {
    if (sortField === 'date') {
      const timeA = a.dateRaw ? new Date(a.dateRaw).getTime() : 0;
      const timeB = b.dateRaw ? new Date(b.dateRaw).getTime() : 0;
      return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
    }
    if (sortField === 'doctor') {
      return sortDirection === 'asc' ? a.doctor.name.localeCompare(b.doctor.name) : b.doctor.name.localeCompare(a.doctor.name);
    }
    if (sortField === 'patient') {
      return sortDirection === 'asc' ? a.patient.name.localeCompare(b.patient.name) : b.patient.name.localeCompare(a.patient.name);
    }
    if (sortField === 'medication') {
      return sortDirection === 'asc' ? a.medication.localeCompare(b.medication) : b.medication.localeCompare(a.medication);
    }
    if (sortField === 'status') {
      return sortDirection === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    if (sortField === 'risk') {
      const riskOrder: Record<RiskLevel, number> = { normal: 1, moderado: 2, elevado: 3 };
      return sortDirection === 'asc'
        ? riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        : riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPrescriptions.length / itemsPerPage);
  const currentItems = sortedPrescriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpand = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#0f172a]">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <span className="sr-only">Expandir</span>
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                  <div className="flex items-center">
                    Fecha
                    <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('doctor')}>
                  <div className="flex items-center">
                    Médico
                    <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('patient')}>
                  <div className="flex items-center">
                    Paciente
                    <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('medication')}>
                  <div className="flex items-center">
                    Medicamento
                    <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Estado
                    <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('risk')}>
                  <div className="flex items-center">
                    Riesgo
                    <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentItems.length > 0 ? currentItems.map((prescription) => (
                <React.Fragment key={prescription.id}>
                  <tr className="hover:bg-[#0f172a]/50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button onClick={() => toggleRowExpand(prescription.id)} className="text-gray-400 hover:text-white">
                        {expandedRow === prescription.id ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex flex-col">
                        <span>{prescription.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex flex-col">
                        <span>{prescription.doctor.name}</span>
                        <span className="text-xs text-gray-500">
                          {prescription.doctor.specialty}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex flex-col">
                        <span>{prescription.patient.name}</span>
                        <span className="text-xs text-gray-500">
                          ID: {prescription.patient.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {prescription.medication}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${prescription.status === 'Activa' ? 'bg-blue-900 text-blue-200' : prescription.status === 'Dispensada' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {prescription.riskLevel === 'normal' ? <CheckCircleIcon className="h-4 w-4 text-green-400 mr-1" /> : prescription.riskLevel === 'moderado' ? <ClockIcon className="h-4 w-4 text-yellow-400 mr-1" /> : <AlertCircleIcon className="h-4 w-4 text-red-400 mr-1" />}
                        <span className={`text-xs
                            ${prescription.riskLevel === 'normal' ? 'text-green-400' : prescription.riskLevel === 'moderado' ? 'text-yellow-400' : 'text-red-400'}`}>
                          {prescription.riskLevel.charAt(0).toUpperCase() + prescription.riskLevel.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-[#3b82f6] hover:text-[#60a5fa] mr-3">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button className="text-[#3b82f6] hover:text-[#60a5fa]">
                        <FileTextIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === prescription.id && (
                    <tr className="bg-[#0f172a]">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">
                              Detalles de la Prescripción
                            </h4>
                            <div className="bg-[#1e293b] rounded-lg p-3 text-sm">
                              <p className="text-gray-300">
                                <span className="text-gray-400">ID:</span>{' RX-'}
                                {prescription.id}
                              </p>
                              <p className="text-gray-300">
                                <span className="text-gray-400">
                                  Medicamento:
                                </span>{' '}
                                {prescription.medication}
                              </p>
                              <p className="text-gray-300">
                                <span className="text-gray-400">Dosis:</span>{' '}
                                {prescription.dosage}
                              </p>
                              <p className="text-gray-300">
                                <span className="text-gray-400">
                                  Farmacia:
                                </span>{' '}
                                {prescription.pharmacy || 'No dispensada'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">
                              Información Blockchain
                            </h4>
                            <div className="bg-[#1e293b] rounded-lg p-3 text-sm">
                              <p className="text-gray-300">
                                <span className="text-gray-400">
                                  Estado de Verificación:
                                </span>
                                {prescription.blockchain.verified ? <span className="text-green-400 ml-1">
                                    Verificado
                                  </span> : <span className="text-red-400 ml-1">
                                    No verificado
                                  </span>}
                              </p>
                              <p className="text-gray-300">
                                <span className="text-gray-400">Hash:</span>
                                <span className="font-mono ml-1">
                                  {prescription.blockchain.hash}
                                </span>
                              </p>
                              <p className="text-gray-300">
                                <span className="text-gray-400">
                                  Timestamp:
                                </span>
                                <span className="ml-1">
                                  {prescription.blockchain.timestamp}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No se encontraron resultados para los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && <div className="bg-[#0f172a] px-4 py-3 flex items-center justify-between border-t border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed">
                Anterior
              </button>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed">
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Mostrando{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredPrescriptions.length)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">
                    {filteredPrescriptions.length}
                  </span>{' '}
                  resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#1e293b] text-sm font-medium text-gray-300 hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="sr-only">Anterior</span>
                    <ChevronDownIcon className="h-5 w-5 rotate-90" />
                  </button>
                  {Array.from({
                length: totalPages
              }).map((_, index) => <button key={index} onClick={() => setCurrentPage(index + 1)} className={`relative inline-flex items-center px-4 py-2 border ${currentPage === index + 1 ? 'bg-[#3b82f6] text-white border-[#3b82f6]' : 'border-gray-700 bg-[#1e293b] text-gray-300 hover:bg-[#334155]'} text-sm font-medium`}>
                      {index + 1}
                    </button>)}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#1e293b] text-sm font-medium text-gray-300 hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="sr-only">Siguiente</span>
                    <ChevronDownIcon className="h-5 w-5 -rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>}
      </div>
    </div>
  );
}