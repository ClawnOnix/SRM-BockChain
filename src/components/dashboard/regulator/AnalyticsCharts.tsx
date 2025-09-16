import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface AnalyticsChartsProps {
  filters: {
    query: string;
    filterType: string;
    dateRange: string;
    status: string;
  };
}

export function AnalyticsCharts({ filters }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chart datasets
  type PrescriptionDay = { name: string; Prescripciones: number; Dispensaciones: number };
  type MedicationDist = { name: string; value: number };
  type TopPrescriber = { name: string; prescriptions: number };

  const [prescriptionsByDay, setPrescriptionsByDay] = useState<PrescriptionDay[]>([]);
  const [medicationDistribution, setMedicationDistribution] = useState<MedicationDist[]>([]);
  const [topPrescribers, setTopPrescribers] = useState<TopPrescriber[]>([]);
  // Placeholder for risk trends
  const [riskLevelTrends] = useState([
    { name: '01/09', Normal: 90, Moderado: 8, Elevado: 2 },
    { name: '02/09', Normal: 88, Moderado: 10, Elevado: 2 },
    { name: '03/09', Normal: 92, Moderado: 6, Elevado: 2 },
    { name: '04/09', Normal: 85, Moderado: 12, Elevado: 3 },
    { name: '05/09', Normal: 83, Moderado: 13, Elevado: 4 }
  ]);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('http://localhost:4000/api/recetas-list')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener datos');
        return res.json();
      })
      .then(data => {
        setAnalyticsData(data);
        // --- Transform data for charts ---
        // Prescriptions by Day
        const dayMap: Record<string, PrescriptionDay> = {};
        data.forEach((row: any) => {
          const date = row.Fecha_Receta?.slice(0, 10);
          if (!date) return;
          if (!dayMap[date]) dayMap[date] = { name: date, Prescripciones: 0, Dispensaciones: 0 };
          dayMap[date].Prescripciones += 1;
          if (row.status === 'Dispensada') dayMap[date].Dispensaciones += 1;
        });
        setPrescriptionsByDay((Object.values(dayMap) as PrescriptionDay[]).sort((a, b) => a.name.localeCompare(b.name)));

        // Medication Distribution
        const medMap: Record<string, number> = {};
        data.forEach((row: any) => {
          // Extract medicine name from Receta_Detalle.medicamento
          let med = '';
          if (row.Receta_Detalle) {
            try {
              const detalle = typeof row.Receta_Detalle === 'string' ? JSON.parse(row.Receta_Detalle) : row.Receta_Detalle;
              med = detalle.medicamento || '';
            } catch {
              med = '';
            }
          }
          if (!med) return;
          medMap[med] = (medMap[med] || 0) + 1;
        });
        setMedicationDistribution(Object.entries(medMap).map(([name, value]) => ({ name, value: value as number })));

        // Top Prescribers
        const docMap: Record<string, number> = {};
        data.forEach((row: any) => {
          const doc = row.Nombre_Medico;
          if (!doc) return;
          docMap[doc] = (docMap[doc] || 0) + 1;
        });
        setTopPrescribers(
          (Object.entries(docMap)
            .map(([name, prescriptions]) => ({ name, prescriptions: prescriptions as number }))
            .sort((a, b) => b.prescriptions - a.prescriptions)
            .slice(0, 5)) as TopPrescriber[]
        );

        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo obtener datos');
        setLoading(false);
      });
  }, [timeRange, filters]);

  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];
  const RISK_COLORS = {
    Normal: '#4ade80',
    Moderado: '#facc15',
    Elevado: '#f87171'
  };

  return (
    <div className="space-y-8">
      {/* Time range selector */}
      {/* Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prescriptions and Dispensations Chart */}
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-6">Prescripciones y Dispensaciones</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prescriptionsByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                <Legend />
                <Line type="monotone" dataKey="Prescripciones" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Dispensaciones" stroke="#60a5fa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Risk Level Trends (placeholder) */}
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-6">Tendencia de Niveles de Riesgo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskLevelTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                <Legend />
                <Area type="monotone" dataKey="Normal" stackId="1" stroke={RISK_COLORS.Normal} fill={RISK_COLORS.Normal} fillOpacity={0.6} />
                <Area type="monotone" dataKey="Moderado" stackId="1" stroke={RISK_COLORS.Moderado} fill={RISK_COLORS.Moderado} fillOpacity={0.6} />
                <Area type="monotone" dataKey="Elevado" stackId="1" stroke={RISK_COLORS.Elevado} fill={RISK_COLORS.Elevado} fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Medication Distribution */}
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-6">Distribución de Medicamentos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart margin={{ top: 40, right: 40, left: 40, bottom: 40 }}>
                <Pie data={medicationDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {medicationDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} formatter={value => [`${value} prescripciones`, 'Cantidad']} />
                <Legend formatter={value => <span className="text-gray-300">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Top Prescribers */}
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-6">Principales Prescriptores</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPrescribers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} tickFormatter={value => {
                  return value.length > 15 ? value.substring(0, 15) + '...' : value;
                }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} formatter={value => [`${value} prescripciones`, 'Cantidad']} />
                <Bar dataKey="prescriptions" fill="#3b82f6" name="Prescripciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Summary statistics (optional, can be updated to use analyticsData) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Total Prescripciones</h3>
          <p className="text-2xl font-bold text-white mt-2">{analyticsData.length}</p>
          <div className="flex items-center mt-2 text-green-400 text-xs">
            <span className="font-medium">+12.5%</span>
            <span className="ml-1">vs. periodo anterior</span>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Tasa de Dispensación</h3>
          <p className="text-2xl font-bold text-white mt-2">{analyticsData.length ? ((analyticsData.filter(r => r.status === 'Dispensada').length / analyticsData.length) * 100).toFixed(1) : '0'}%</p>
          <div className="flex items-center mt-2 text-green-400 text-xs">
            <span className="font-medium">+2.1%</span>
            <span className="ml-1">vs. periodo anterior</span>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Prescripciones de Alto Riesgo</h3>
          <p className="text-2xl font-bold text-white mt-2">37</p>
          <div className="flex items-center mt-2 text-red-400 text-xs">
            <span className="font-medium">+5.7%</span>
            <span className="ml-1">vs. periodo anterior</span>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Médicos Activos</h3>
          <p className="text-2xl font-bold text-white mt-2">{topPrescribers.length}</p>
          <div className="flex items-center mt-2 text-blue-400 text-xs">
            <span className="font-medium">+3</span>
            <span className="ml-1">nuevos este mes</span>
          </div>
        </div>
      </div>
    </div>
  );
}