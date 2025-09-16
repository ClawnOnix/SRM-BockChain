import React, { useState } from 'react';
import { ShareIcon, UserPlusIcon, ClockIcon, ShieldIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../Modal';
import { QRCode } from 'react-qrcode-logo';

interface ShareAccessProps {
  selectedRecetas: number[];
  setSelectedRecetas: React.Dispatch<React.SetStateAction<number[]>>;
}

export function ShareAccess({ selectedRecetas, setSelectedRecetas }: ShareAccessProps) {
  // Recipient type and name state
  const [recipientType, setRecipientType] = useState('Médico');
  const [recipientName, setRecipientName] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [recipientOptions, setRecipientOptions] = useState<{ id: string; name: string }[]>([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
    const [accessDuration, setAccessDuration] = useState('1d');
  interface SharedAccess {
  id: string;
  name: string;
  type: string;
  expiresAt: number;
  }
  const [activeShares, setActiveShares] = useState<SharedAccess[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [errorShares, setErrorShares] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalLink, setModalLink] = useState<string>('');
  const navigate = useNavigate();

  // Fetch recipient options when type changes
  React.useEffect(() => {
    if (recipientType === 'Médico') {
      setRecipientLoading(true);
      fetch('http://localhost:4000/api/medico-list')
        .then(res => res.json())
        .then(data => setRecipientOptions(Array.isArray(data) ? data.map((m: any) => ({ id: String(m.ID_Medico), name: m.Nombre_Medico })) : []))
        .catch(() => setRecipientOptions([]))
        .finally(() => setRecipientLoading(false));
    } else if (recipientType === 'Farmacia') {
      setRecipientLoading(true);
      fetch('http://localhost:4000/api/farmacia-list')
        .then(res => res.json())
        .then(data => setRecipientOptions(Array.isArray(data) ? data.map((f: any) => ({ id: String(f.ID_Farmacia), name: f.Nombre_Farmacia })) : []))
        .catch(() => setRecipientOptions([]))
        .finally(() => setRecipientLoading(false));
    } else {
      setRecipientOptions([]);
    }
  }, [recipientType]);


  // Fetch active shared accesses
  const fetchActiveShares = React.useCallback(() => {
    setLoadingShares(true);
    const user_id = localStorage.getItem('user_id');
    fetch(`http://localhost:4000/api/shared-access?user_id=${user_id}`)
      .then(res => res.json())
      .then(data => setActiveShares(Array.isArray(data) ? data : []))
      .catch((err) => {
        setErrorShares('Error al cargar accesos activos');
        console.error('Error loading shared accesses:', err);
      })
      .finally(() => setLoadingShares(false));
  }, []);

  React.useEffect(() => {
    fetchActiveShares();
  }, [fetchActiveShares]);

  const handleRevoke = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/shared-access/${id}`, { method: 'DELETE' });
      setActiveShares(shares => shares.filter(s => s.id !== id));
    } catch {
      setErrorShares('Error al revocar acceso');
    }
  };

  function getExpiresText(expiresAt: number) {
    const ms = expiresAt - Date.now();
    if (ms <= 0) return 'expirado';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 24) return `${hours} horas`;
    const days = Math.floor(hours / 24);
    return `${days} días`;
  }

  // Durations for access
  const durations = ['1d', '7d', '30d', '90d'];

  return (
    <>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {modalLink ? (
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 text-gray-800">Acceso temporal compartido correctamente</h2>
            <div className="mb-4 flex flex-col items-center">
              <QRCode value={modalLink} size={128} />
              <div className="mb-2 text-sm text-gray-700">Escanea el código QR o usa el enlace:</div>
            </div>
            <a href={modalLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{modalLink}</a>
          </div>
        ) : (
          <div className="text-red-500">Error al compartir acceso temporal.</div>
        )}
      </Modal>
      <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 mt-8">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center">
            <ShareIcon className="h-5 w-5 text-[#4ade80]" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-white">
              Compartir Acceso Temporal
            </h3>
            <p className="text-gray-400 text-sm">
              Permite acceso temporal a tus recetas con médicos o aseguradoras
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label htmlFor="recipientType" className="block text-sm font-medium text-gray-300 mb-2">
              Compartir con
            </label>
            <select
              id="recipientType"
              value={recipientType}
              onChange={e => {
                setRecipientType(e.target.value);
                setRecipientName('');
              }}
              className="bg-[#0f172a] text-white block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
            >
              <option value="Médico">Médico</option>
              <option value="Aseguradora">Aseguradora</option>
              <option value="Farmacia">Farmacia</option>
            </select>
          </div>
          {(recipientType === 'Médico' || recipientType === 'Farmacia') && (
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-300 mb-2">
                Selecciona {recipientType}
              </label>
              <input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={e => {
                  setRecipientName(e.target.value);
                  const found = recipientOptions.find(opt => opt.name === e.target.value);
                  setRecipientId(found ? found.id : '');
                }}
                list="recipientOptions"
                placeholder={recipientLoading ? 'Cargando...' : `Buscar ${recipientType}...`}
                className="bg-[#0f172a] text-white block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
                autoComplete="off"
                disabled={recipientLoading}
              />
              <datalist id="recipientOptions">
                {recipientOptions.map((option, idx) => (
                  <option key={option.id + '-' + idx} value={option.name} />
                ))}
              </datalist>
            </div>
          )}
        </div>
        <div className="flex items-end mt-4 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
              Duración del Acceso
            </label>
            <div className="flex space-x-4">
              {durations.map(duration => (
                <button key={duration} onClick={() => setAccessDuration(duration)} className={`min-w-[64px] py-2 rounded-lg text-sm font-medium transition-all duration-150 ${accessDuration === duration ? 'bg-[#4ade80] text-[#0f172a]' : 'bg-[#0f172a] text-gray-300 hover:bg-[#0f172a] hover:bg-opacity-70'}`}>
                  {duration}
                </button>
              ))}
            </div>
          </div>
          <button
            className="flex items-center justify-center py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium ml-auto"
            onClick={async () => {
              if (selectedRecetas.length === 0) {
                alert('Selecciona al menos una receta para compartir.');
                return;
              }
              // Prepare payload for backend
              const user_id = localStorage.getItem('user_id');
              let recipient_type: string | number = recipientType;
              const recipient_name: string = recipientName || recipientType;
              if ((recipientType === 'Médico' || recipientType === 'Farmacia') && recipientId) {
                recipient_type = recipientId;
              }
              const expiresMap: Record<string, number> = { '1d': 24, '7d': 168, '30d': 720, '90d': 2160 };
              const hours = expiresMap[accessDuration] || 24;
              const expires_at = Date.now() + hours * 60 * 60 * 1000;
              try {
                const res = await fetch('http://localhost:4000/api/shared-access', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ user_id, recipient_name, recipient_type, expires_at, receta_ids: selectedRecetas })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al compartir acceso');
                // Show modal with QR and link
                const link = `${window.location.origin}/receta?shared=${data.id}`;
                setModalLink(link);
                setShowModal(true);
                fetchActiveShares(); // Refetch active shares after creating
                setSelectedRecetas([]); // Uncheck all checkboxes
              } catch (err) {
                setModalLink('');
                setShowModal(true);
              }
            }}
            type="button"
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            Compartir Acceso Temporal
          </button>
        </div>       
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-300">Accesos Compartidos Activos</h4>
            <span className="px-2 py-1 bg-[#0f172a] rounded-md text-xs text-gray-400">
              {loadingShares ? '...' : `${activeShares.length} activos`}
            </span>
          </div>
          {errorShares && activeShares.length === 0 && loadingShares === false && (
            <div className="text-red-400 text-xs mb-2">{errorShares}</div>
          )}
          <div className="space-y-3">
            {loadingShares ? (
              <div className="text-gray-400 text-sm">Cargando accesos...</div>
            ) : activeShares.length === 0 ? (
              <div className="text-gray-400 text-sm">No hay accesos compartidos activos.</div>
            ) : (
              activeShares.map(share => (
                <div key={share.id} className="bg-[#0f172a] rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${share.type === 'aseguradora' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'}`}> 
                      {share.type === 'aseguradora' ? <ShieldIcon className="h-4 w-4" /> : <UserPlusIcon className="h-4 w-4" />}
                    </div>
                    <div className="ml-3">
                      <button
                        className="text-white text-sm font-medium hover:underline text-left"
                        onClick={() => navigate(`/receta?shared=${share.id}`)}
                      >
                        {share.name}
                      </button>
                      <div className="flex items-center text-gray-400 text-xs mt-1">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>Expira en {getExpiresText(share.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-xs" onClick={() => handleRevoke(share.id)}>
                    Revocar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}