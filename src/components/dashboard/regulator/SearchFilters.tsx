import React, { useState } from 'react';
import { SearchIcon, FilterIcon, CalendarIcon, DownloadIcon, FileIcon, FileTextIcon } from 'lucide-react';
interface SearchFiltersProps {
  filters: {
    query: string;
    filterType: string;
    dateRange: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
  simplified?: boolean;
}
export function SearchFilters({
  filters,
  onFilterChange,
  simplified = false
}: SearchFiltersProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);
  return <div className="bg-[#1e293b] rounded-xl shadow-lg p-5">
      <div className="flex flex-col space-y-4">
        {/* Search and Export Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={filters.query} onChange={e => onFilterChange({
            query: e.target.value
          })} placeholder="Buscar por médico, paciente o medicamento" className="bg-[#0f172a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent" />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <button onClick={() => setShowExportOptions(!showExportOptions)} className="flex items-center px-4 py-3 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors">
                <DownloadIcon className="h-5 w-5 mr-2" />
                Exportar
              </button>
              {showExportOptions && <div className="absolute right-0 mt-2 w-48 bg-[#1e293b] border border-gray-700 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-[#334155]" onClick={() => {
                  console.log('Export to PDF');
                  setShowExportOptions(false);
                }}>
                      <FileTextIcon className="h-4 w-4 mr-2 text-red-400" />
                      Exportar como PDF
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-[#334155]" onClick={() => {
                  console.log('Export to Excel');
                  setShowExportOptions(false);
                }}>
                      <FileIcon className="h-4 w-4 mr-2 text-green-400" />
                      Exportar como Excel
                    </button>
                  </div>
                </div>}
            </div>
          </div>
        </div>
        {/* Filters Row - Hide if simplified is true */}
        {!simplified && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-400 mb-1">
                Filtrar por
              </label>
              <select id="filterType" value={filters.filterType} onChange={e => onFilterChange({
            filterType: e.target.value
          })} className="bg-[#0f172a] text-white block w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent">
                <option value="all">Todos</option>
                <option value="doctor">Médico</option>
                <option value="patient">Paciente</option>
                <option value="medication">Medicamento</option>
                <option value="pharmacy">Farmacia</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-400 mb-1">
                Rango de Fechas
              </label>
              <select id="dateRange" value={filters.dateRange} onChange={e => onFilterChange({
            dateRange: e.target.value
          })} className="bg-[#0f172a] text-white block w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent">
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">
                Estado
              </label>
              <select id="status" value={filters.status} onChange={e => onFilterChange({
            status: e.target.value
          })} className="bg-[#0f172a] text-white block w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent">
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="dispensed">Dispensadas</option>
                <option value="expired">Expiradas</option>
                <option value="suspicious">Sospechosas</option>
              </select>
            </div>
          </div>}
      </div>
    </div>;
}