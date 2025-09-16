import React , {useState} from 'react';
import { QrCodeIcon, ClipboardCheckIcon, UserIcon, LogOutIcon } from 'lucide-react';
import { Logo } from '../../Logo';
import { useNavigate } from 'react-router-dom';
interface PharmacyDashboardLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
}
export function PharmacyDashboardLayout({
  children,
  activeSection,
  onNavigate
}: PharmacyDashboardLayoutProps) {
  const navItems = [{
    id: 'validar-receta',
    label: 'Validar Receta',
    icon: QrCodeIcon
  }, {
    id: 'historial-dispensaciones',
    label: 'Historial de Dispensaciones',
    icon: ClipboardCheckIcon
  }, {
    id: 'mi-perfil',
    label: 'Mi Perfil',
    icon: UserIcon
  }];
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };
  const pharmacySession = JSON.parse(localStorage.getItem('user') || 'null');
  const [pharmacy, setPharmacy] = useState(null);

  React.useEffect(() => {
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
  return <div className="flex h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e293b] flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Logo />
        </div>
        <div className="flex-1 py-6 flex flex-col justify-between">
          <nav className="px-2 space-y-1">
            {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => onNavigate(item.id)} className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full
                    ${activeSection === item.id ? 'bg-[#4ade80] text-[#0f172a]' : 'text-gray-300 hover:bg-[#0f172a] hover:text-white'}
                  `}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>;
          })}
          </nav>
          <div className="px-2 mt-6">
            <button onClick={handleLogout} className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-[#0f172a] hover:text-white rounded-lg w-full">
              <LogOutIcon className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          <p>{pharmacy?.Nombre_Farmacia || 'Farmacia'}</p>
          <p>{pharmacy?.Direccion_Farmacia || 'Sucursal'}</p>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">{children}</div>
      </div>
    </div>;
}