import { useQuery } from '@tanstack/react-query';
import { visitApi, locationApi } from '../../services/api';
import { PageHeader, Spinner } from '../../components/common';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ReportsPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['visit-stats'],
    queryFn: () => visitApi.getStats(),
  });

  const { data: locData } = useQuery({
    queryKey: ['locations', 1, 100],
    queryFn: () => locationApi.getAll(1, 100),
  });

  const stats = statsData?.data?.data;
  const locations = locData?.data?.data ?? [];

  const chartData = (stats?.byLocation ?? []).map((s: any) => {
    const loc = locations.find((l: any) => l.id === s.locationId);
    return { name: loc?.name ?? `Lokasi ${s.locationId}`, kunjungan: s._count.id };
  });

  if (statsLoading) return <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-primary-600" /></div>;

  return (
    <div>
      <PageHeader title="Laporan Kunjungan" description="Statistik dan analitik kunjungan wisatawan" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{stats?.total ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Kunjungan</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{locations.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Lokasi</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{chartData[0]?.kunjungan ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Kunjungan Terbanyak</p>
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Kunjungan per Lokasi</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada data kunjungan</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="kunjungan" fill="#c97d10" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Detail per Lokasi</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Ranking', 'Lokasi', 'Total Kunjungan', 'Persentase'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {chartData.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full inline-flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.kunjungan}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-24">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ width: `${stats?.total ? (item.kunjungan / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {stats?.total ? ((item.kunjungan / stats.total) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
