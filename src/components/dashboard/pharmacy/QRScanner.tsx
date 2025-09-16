import React, { useEffect, useState } from 'react';
// Prescription type for recetas
interface Prescription {
  ID_Receta: number;
  Nombre_Medico: string;
  Nombre_Paciente: string;
  Correo_Medico: string;
  status: string;
  Fecha_Receta: string;
}
import { QrCodeIcon, UploadIcon, CameraIcon, RefreshCwIcon, CalendarIcon } from 'lucide-react';
import { PrescriptionValidator } from './PrescriptionValidator';
interface QRScannerProps {
  onQRScanned: (prescriptionData: any) => void;
}
export function QRScanner({
  onQRScanned
}: QRScannerProps) {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [scanMode, setScanMode] = useState<'Scanear' | 'Seleccionar'>('Seleccionar');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);




  
  // Mock function to simulate QR scanning
  const simulateScan = () => {
    setIsLoading(true);
    setError(null);
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      // Mock prescription data
      const mockPrescriptionData = {
        id: 'rx-1236',
        patient: {
          name: 'Ana Martínez',
          id: '56781234'
        },
        doctor: {
          name: 'Dr. Juan Pérez',
          license: 'MED-12345'
        },
        medication: 'Loratadina 10mg',
        dosage: '1 tableta diaria por 5 días',
        issueDate: '12/05/2023',
        expiryDate: '17/05/2023',
        status: 'Activa',
        blockchain: {
          hash: '0x7d5e6f...',
          timestamp: '1684152000',
          verified: true
        }
      };
      onQRScanned(mockPrescriptionData);
    }, 2000);
  };

  const pharmacySession = JSON.parse(localStorage.getItem('user') || 'null');
  const [recetas, setRecetas] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    async function fetchSharedRecetas() {
      if (pharmacySession && pharmacySession.ID_Usuario) {
        try {
          const farmaciaRes = await fetch(`http://localhost:4000/api/farmacias?usuarioId=${pharmacySession.ID_Usuario}`);
          const farmaciaData = await farmaciaRes.json();
          if (Array.isArray(farmaciaData) && farmaciaData.length > 0) {
            const sharedRes = await fetch(`http://localhost:4000/api/shared-entity/anyvalue?recipient_name=${farmaciaData[0].Nombre_Farmacia}&recipient_type=${farmaciaData[0].ID_Farmacia}`);
            const sharedData = await sharedRes.json();
            // sharedData should have receta_ids array
            if (sharedData && Array.isArray(sharedData.receta_ids) && sharedData.receta_ids.length > 0) {
              const recetasRes = await fetch('http://localhost:4000/api/recetas-shared', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receta_ids: sharedData.receta_ids })
              });
              const recetasList = await recetasRes.json();
              setRecetas(Array.isArray(recetasList) ? recetasList : []);
            } else {
              setRecetas([]);
            }
          } else {
            setRecetas([]);
          }
        } catch (err) {
          setRecetas([]);
        }
      }
    }
    fetchSharedRecetas();
  }, []);


  // Mock function to handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);

      // Simulate processing
      setTimeout(() => {
        setIsLoading(false);
        simulateScan();
      }, 1500);
    }
  };
  // If a prescription is selected in 'Seleccionar' mode, show PrescriptionValidator
  if (scanMode === 'Seleccionar' && selectedPrescription) {
    return (
      <div className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden">
        <PrescriptionValidator prescription={selectedPrescription} onReset={() => setSelectedPrescription(null)} />
      </div>
    );
  }
  return (
    <div className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#0f172a] p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-[#4ade80] bg-opacity-20 flex items-center justify-center mr-3">
            <QrCodeIcon className="h-6 w-6 text-[#4ade80]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">
              Escáner de Recetas
            </h2>
            <p className="text-sm text-gray-400">
              Escanea o selecciona una receta compartida
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setScanMode('Scanear')} className={`px-3 py-2 rounded-lg text-sm font-medium ${scanMode === 'Scanear' ? 'bg-[#4ade80] text-[#0f172a]' : 'bg-[#1e293b] text-gray-300'}`}>
            <CameraIcon className="h-4 w-4 inline mr-1" />
            Cámara
          </button>
          <button onClick={() => setScanMode('Seleccionar')} className={`px-3 py-2 rounded-lg text-sm font-medium ${scanMode === 'Seleccionar' ? 'bg-[#4ade80] text-[#0f172a]' : 'bg-[#1e293b] text-gray-300'}`}>
            <UploadIcon className="h-4 w-4 inline mr-1" />
            Seleccionar
          </button>
        </div>
      </div>
      {/* Scanner Area */}
  <div className="p-6">
        {scanMode === 'Scanear' ? <div className="flex flex-col items-center">
            <div className="w-full max-w-md aspect-square bg-[#0f172a] rounded-lg relative mb-6 overflow-hidden">
              {/* Camera placeholder with scanning animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-[#4ade80] relative">
                  {/* Scanning line animation */}
                  <div className={`absolute left-0 right-0 h-0.5 bg-[#4ade80] ${isLoading ? 'animate-scan' : ''}`}></div>
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#4ade80]"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#4ade80]"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#4ade80]"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#4ade80]"></div>
                </div>
              </div>
              {isLoading && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4ade80]"></div>
                </div>}
            </div>
            <button onClick={simulateScan} disabled={isLoading} className="px-6 py-3 bg-[#4ade80] text-[#0f172a] rounded-lg hover:bg-[#22c55e] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <>
                  <RefreshCwIcon className="inline-block h-5 w-5 mr-2 animate-spin" />
                  Escaneando...
                </> : <>
                  <CameraIcon className="inline-block h-5 w-5 mr-2" />
                  Escanear Código QR
                </>}
            </button>
          </div> : <div className="flex flex-col items-center">
            
            {error && <div className="w-full max-w-md bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>}
            {isLoading && <div className="flex items-center text-gray-300">
                <RefreshCwIcon className="inline-block h-5 w-5 mr-2 animate-spin" />
                Procesando imagen...
              </div>}
          </div>}
        {scanMode === 'Seleccionar' ? (
          <div className="mt-4">
            {/* Searchbox for filtering recetas by ID_Receta */}
            <div className="mb-4 flex items-center justify-center">
              <input
                type="number"
                className="w-full max-w-5xl px-4 py-3 rounded-lg bg-[#0f172a] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4ade80] text-lg"
                placeholder="Buscar por numero de receta#"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value.replace(/[^0-9]/g, ''))}
                min="0"
              />
            </div>
            {/* Vertical slider for recetas with grid layout */}
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-[#4ade80] scrollbar-track-[#0f172a]" style={{ maxHeight: '500px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recetas
                  .filter(prescription =>
                    searchTerm.trim() === '' ||
                    prescription.ID_Receta.toString().includes(searchTerm.trim())
                  )
                  .map(prescription => (
                    <div key={prescription.ID_Receta} className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden border border-[#334155]">
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
                              <span className="flex items-center justify-center h-5 w-5 -ml-7 pointer-events-none">
                                <svg className="hidden peer-checked:block text-white" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <rect width="20" height="20" rx="5" fill="#3b82f6" />
                                  <path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            </label>
                            {/* Remove Descargar QR button */}
                            {prescription.status !== 'Dispensada' && (
                              <button
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ml-2"
                                onClick={() => setSelectedPrescription(prescription)}
                              >
                                Seleccionar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {error && <div className="w-full max-w-md bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>}
            {isLoading && <div className="flex items-center text-gray-300">
              <RefreshCwIcon className="inline-block h-5 w-5 mr-2 animate-spin" />
              Procesando imagen...
            </div>}
          </div>
        )}
        {/* Instructions */}
        <div className="bg-[#0f172a] p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-white mb-2">Instrucciones:</h3>
          <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
            <li>Asegúrate que el código QR esté bien iluminado y centrado</li>
            <li>
              El código QR debe ser el generado por el sistema SRM-Blockchain
            </li>
            <li>
              Si tienes problemas con la cámara, utiliza la opción de Seleccionar receta
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}