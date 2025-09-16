import React, { useState } from 'react';
import { RegulatorDashboardLayout } from '../components/dashboard/regulator/RegulatorDashboardLayout';
import { SearchFilters } from '../components/dashboard/regulator/SearchFilters';
import { PrescriptionsTable } from '../components/dashboard/regulator/PrescriptionsTable';
import { AnalyticsCharts } from '../components/dashboard/regulator/AnalyticsCharts';
import { RegulatorProfile } from '../components/dashboard/regulator/RegulatorProfile';
export function RegulatorDashboard() {
  const [activeSection, setActiveSection] = useState('monitoreo');
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    filterType: 'all',
    dateRange: 'all',
    status: 'all'
  });
  const handleFilterChange = newFilters => {
    setSearchFilters({
      ...searchFilters,
      ...newFilters
    });
  };
  return <RegulatorDashboardLayout activeSection={activeSection} onNavigate={setActiveSection}>
      {activeSection === 'monitoreo' && <div className="space-y-8">
          <h1 className="text-2xl font-bold text-white">
            Monitoreo de Prescripciones
          </h1>
          <p className="text-gray-300">
            Supervise y analice las prescripciones emitidas en el sistema
            SRM-Blockchain.
          </p>
          <PrescriptionsTable filters={searchFilters} />
        </div>}
      {activeSection === 'analisis' && <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">
            Análisis y Tendencias
          </h1>
          <p className="text-gray-300">
            Visualice tendencias, patrones y estadísticas de prescripciones y
            dispensaciones.
          </p>
          <AnalyticsCharts filters={searchFilters} />
        </div>}
      {activeSection === 'mi-perfil' && <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
          <RegulatorProfile />
        </div>}
  {/* Removed duplicate TwoFactorSlide (handled inside profile security card) */}
    </RegulatorDashboardLayout>;
}