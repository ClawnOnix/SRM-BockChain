import React from 'react';
import { MonitorIcon, LineChartIcon, UserIcon, LogOutIcon, FileTextIcon } from 'lucide-react';
import { Logo } from '../../Logo';
import { useNavigate } from 'react-router-dom';
interface RegulatorDashboardLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
}
export function RegulatorDashboardLayout({
  children,
  activeSection,
  onNavigate
}: RegulatorDashboardLayoutProps) {
  const navItems = [{
    id: 'monitoreo',
    label: 'Monitoreo',
    icon: MonitorIcon
  }, {
    id: 'analisis',
    label: 'Análisis y Tendencias',
    icon: LineChartIcon
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
  return <div className="flex h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e293b] flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-[#3b82f6] flex items-center justify-center">
              <FileTextIcon className="h-8 w-8 text-[#0f172a]" />
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold text-white">
                SRM-Blockchain
              </span>
              <p className="text-xs text-[#93c5fd]">Entidad Reguladora</p>
            </div>
          </div>
        </div>
        <div className="flex-1 py-6 flex flex-col justify-between">
          <nav className="px-2 space-y-1">
            {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => onNavigate(item.id)} className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full
                    ${activeSection === item.id ? 'bg-[#3b82f6] text-white' : 'text-gray-300 hover:bg-[#0f172a] hover:text-white'}
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
          <p>Agencia Nacional de Regulación</p>
          <p>Departamento de Control Farmacéutico</p>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </div>
    </div>;
}