import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, UserIcon, CalendarIcon, PillIcon, ClockIcon, ShieldIcon, ArrowLeftIcon, CheckIcon } from 'lucide-react';
interface PrescriptionValidatorProps {
  prescription: any;
  onReset: () => void;
}
export function PrescriptionValidator({
  prescription,
  onReset
}: PrescriptionValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isDispensing, setIsDispensing] = useState(false);
  const [isDispensed, setIsDispensed] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const pharmacySession = JSON.parse(localStorage.getItem('user') || 'null');
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
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
  
  
  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const res = await fetch(`http://localhost:4000/api/receta/blockchain/${prescription.ID_Receta}`);
      const data = await res.json();
      setIsValidating(false);
      setIsValidated(true);
      // Compare blockchain contentHash and signature (Llave_Publica_Medico)
      // Ensure both local and blockchain values have 0x prefix
      const localHash = prescription.Hash_Receta && prescription.Hash_Receta.startsWith('0x')
        ? prescription.Hash_Receta
        : '0x' + prescription.Hash_Receta;
      const localFirmaRaw = prescription.Llave_Publica_Medico || prescription.llave_publica_medico || prescription.signature;
      const localFirma = localFirmaRaw && localFirmaRaw.startsWith('0x')
        ? localFirmaRaw
        : '0x' + localFirmaRaw;

        console.log('Local Hash:', localHash);
        console.log('Blockchain Hash:', data.contentHash);
        console.log('Local Firma:', localFirma);
        console.log('Blockchain Firma:', data.signature);
        console.log('Comparison Hash:', data);
      if (data.contentHash === localHash && data.signature === localFirma) {
        setValidationResult('success');
      } else {
        setValidationResult('error');
      }
    } catch (err) {
      setIsValidating(false);
      setIsValidated(true);
      setValidationResult('error');
    }
  };
  const handleDispense = async () => {
    setIsDispensing(true);
    try {
      // Get farmaciaId from localStorage (assuming user object)
      const farmaciaId = pharmacy.ID_Farmacia;
      const recetaId = prescription.ID_Receta;
      if (!pharmacy?.ID_Farmacia || !recetaId) throw new Error('Datos de farmacia o receta faltantes');
      const res = await fetch('/api/receta/dispensar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmaciaId, recetaId })
      });
      const data = await res.json();
      if (data.success) {
        setIsDispensing(false);
        setIsDispensed(true);
      } else {
        throw new Error(data.error || 'Error al dispensar');
      }
    } catch (err) {
      setIsDispensing(false);
      alert('Error al marcar como dispensada: ' + (err.message || err));
    }
  };
  return <div className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#0f172a] p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-[#4ade80] bg-opacity-20 flex items-center justify-center mr-3">
            <PillIcon className="h-6 w-6 text-[#4ade80]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">
              Validación de Receta
            </h2>
            <p className="text-sm text-gray-400">
              Información de la receta escaneada
            </p>
          </div>
        </div>
        <button onClick={onReset} className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#0f172a] hover:text-white">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Volver a escanear
        </button>
      </div>
      {/* Prescription Info */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Información del Paciente
            </h3>
            <div className="bg-[#0f172a] rounded-lg p-4">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-blue-300" />
                </div>
                <div className="ml-3">
                  <h4 className="text-white font-medium">
                    {prescription.Nombre_Paciente}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    ID: {prescription.ID_Paciente}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Información del Medicamento
            </h3>
            <div className="bg-[#0f172a] rounded-lg p-4">
              <h4 className="text-white font-medium">
                {prescription.medication}
              </h4>
              <p className="text-gray-300 mt-2">{prescription.Receta_Detalle.dosis}</p>
              <div className="mt-4 flex justify-between text-sm text-gray-400">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Emitida: {prescription.Fecha_Receta ? new Date(prescription.Fecha_Receta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Información del Médico
            </h3>
            <div className="bg-[#0f172a] rounded-lg p-4">
              <h4 className="text-white font-medium">
                {prescription.Nombre_Medico}
              </h4>
              <p className="text-gray-400 text-sm">
                Medico General
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Estado de la Receta
            </h3>
            <div className="bg-[#0f172a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">ID de Receta:</span>
                <span className="text-gray-300 font-mono">
                  {prescription.ID_Receta}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Estado:</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                  Pendiente
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Validación Blockchain
            </h3>
            <div className="bg-[#0f172a] rounded-lg p-4">
              {!isValidated ? <button onClick={handleValidate} disabled={isValidating} className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isValidating ? <>
                      <ShieldIcon className="h-5 w-5 mr-2 animate-pulse" />
                      Validando en blockchain...
                    </> : <>
                      <ShieldIcon className="h-5 w-5 mr-2" />
                      Validar autenticidad en blockchain
                    </>}
                </button> : <div className={`p-3 rounded-lg ${validationResult === 'success' ? 'bg-green-900 bg-opacity-30 border border-green-800' : 'bg-red-900 bg-opacity-30 border border-red-800'}`}>
                  <div className="flex items-center">
                    {validationResult === 'success' ? <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" /> : <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />}
                    <span className={validationResult === 'success' ? 'text-green-300' : 'text-red-300'}>
                      {validationResult === 'success' ? 'Receta verificada correctamente en blockchain' : 'Error: La receta no pudo ser verificada'}
                    </span>
                  </div>
                  {validationResult === 'success' && <div className="mt-3 text-xs text-gray-300">
                      <div className="flex items-center justify-between mb-1">
                        <span>Hash:</span>
                        <span className="font-mono">
                          {prescription.Hash_Receta.slice(0, 10) + '...' + prescription.Hash_Receta.slice(-10)}
                        </span>
                      </div>
                    </div>}
                </div>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Dispensación
            </h3>
            <div className="bg-[#0f172a] rounded-lg p-4">
              {!isDispensed ? <button onClick={handleDispense} disabled={!isValidated || validationResult !== 'success' || isDispensing} className="w-full flex items-center justify-center px-4 py-3 bg-[#4ade80] text-[#0f172a] rounded-lg hover:bg-[#22c55e] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {isDispensing ? <>
                      <CheckIcon className="h-5 w-5 mr-2 animate-pulse" />
                      Procesando...
                    </> : <>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Marcar como dispensada
                    </>}
                </button> : <div className="p-3 bg-green-900 bg-opacity-30 border border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                    <span className="text-green-300">
                      Medicamento dispensado correctamente
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-300">
                    La dispensación ha sido registrada en el sistema y
                    notificada al médico y paciente.
                  </p>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}