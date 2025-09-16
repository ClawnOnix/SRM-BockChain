import React, { useState, useEffect } from 'react';
import { getMedicationRisk } from '../../../utils/medicationRisk';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

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
  // Risk trends from real data
  const [riskLevelTrends, setRiskLevelTrends] = useState<any[]>([]);

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

        // --- Risk Level Trends by Day ---
        const riskDayMap: Record<string, { name: string; Normal: number; Moderado: number; "Alto riesgo": number }> = {};
        data.forEach((row: any) => {
          const date = row.Fecha_Receta?.slice(0, 10);
          if (!date) return;
          let med = '';
          if (row.Receta_Detalle) {
            try {
              const detalle = typeof row.Receta_Detalle === 'string' ? JSON.parse(row.Receta_Detalle) : row.Receta_Detalle;
              med = detalle.medicamento || '';
            } catch {
              med = '';
            }
          }
          const risk = getMedicationRisk(med);
          if (!riskDayMap[date]) riskDayMap[date] = { name: date, Normal: 0, Moderado: 0, "Alto riesgo": 0 };
          if (risk === 'Normal') riskDayMap[date].Normal += 1;
          else if (risk === 'Riesgo moderado') riskDayMap[date].Moderado += 1;
          else if (risk === 'Alto riesgo') riskDayMap[date]["Alto riesgo"] += 1;
        });
        setRiskLevelTrends(Object.values(riskDayMap).sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo obtener datos');
        setLoading(false);
      });
  }, [timeRange, filters]);

  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];

  // Custom scrollable legend for PieChart
  const renderScrollableLegend = (props: any) => {
    const { payload } = props;
    return (
      <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {payload.map((entry: any, idx: number) => {
          const truncated = entry.value.length > 20 ? entry.value.slice(0, 20) + '...' : entry.value;
          return (
            <div key={`legend-item-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 14, background: entry.color, display: 'inline-block', borderRadius: 3, marginRight: 6 }} />
              <span title={entry.value} style={{ color: '#93c5fd', fontSize: 13, cursor: 'pointer' }}>{truncated}</span>
            </div>
          );
        })}
      </div>
    );
  };
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
                // ...existing code...
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
                // ...existing code...
                <Area type="monotone" dataKey="Normal" stackId="1" stroke={RISK_COLORS.Normal} fill={RISK_COLORS.Normal} fillOpacity={0.6} />
                <Area type="monotone" dataKey="Moderado" stackId="1" stroke={RISK_COLORS.Moderado} fill={RISK_COLORS.Moderado} fillOpacity={0.6} />
                <Area type="monotone" dataKey="Alto riesgo" stackId="1" stroke={RISK_COLORS.Elevado} fill={RISK_COLORS.Elevado} fillOpacity={0.6} />
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
                <Pie data={medicationDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name.length > 20 ? name.slice(0, 20) + '...' : name} ${(percent * 100).toFixed(0)}%`}>
                  {medicationDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                  itemStyle={{ color: '#fff', fontWeight: 500 }}
                  formatter={value => [`${value} prescripciones`, 'Cantidad']} 
                />
                {/* Custom scrollable legend with tooltips */}
                {renderScrollableLegend({ payload: medicationDistribution.map((entry, idx) => ({ value: entry.name, color: COLORS[idx % COLORS.length] })) })}
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
        </div>
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Tasa de Dispensación</h3>
          <p className="text-2xl font-bold text-white mt-2">{
            analyticsData.length
              ? (
                  analyticsData.filter(row => row.status === 'Dispensada').length / analyticsData.length * 100
                ).toFixed(1)
              : '0'
          }%</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Prescripciones de Alto Riesgo</h3>
          <p className="text-2xl font-bold text-white mt-2">{
            analyticsData.filter(row => {
              let med = '';
              if (row.Receta_Detalle) {
                try {
                  const detalle = typeof row.Receta_Detalle === 'string' ? JSON.parse(row.Receta_Detalle) : row.Receta_Detalle;
                  med = detalle.medicamento || '';
                } catch {
                  med = '';
                }
              }
              return getMedicationRisk(med) === 'Alto riesgo';
            }).length
          }</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Médicos Activos</h3>
          <p className="text-2xl font-bold text-white mt-2">{topPrescribers.length}</p>
        </div>
      </div>
    </div>
  );
}