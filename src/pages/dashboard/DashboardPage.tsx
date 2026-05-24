import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, Eye, QrCode } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { visitApi, locationApi } from '../../services/api';
import { StatCard, Spinner, PageHeader } from '../../components/common';

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['visit-stats'],
    queryFn: () => visitApi.getStats(),
  });

  const { data: locationsData, isLoading: locLoading } = useQuery({
    queryKey: ['locations', 1, 100],
    queryFn: () => locationApi.getAll(1, 100),
  });

  const stats = statsData?.data?.data;
  const locations = locationsData?.data?.data ?? [];

  // Gabungkan nama lokasi ke stats
  const chartData = (stats?.byLocation ?? []).slice(0, 8).map((s: any) => {
    const loc = locations.find((l: any) => l.id === s.locationId);
    return {
      name: loc?.name ?? `Lokasi ${s.locationId}`,
      kunjungan: s._count.id,
    };
  });

  if (statsLoading || locLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan aktivitas NusantaraTrail"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Lokasi"
          value={locationsData?.data?.meta?.total ?? 0}
          icon={MapPin}
          color="primary"
        />
        <StatCard
          label="Total Kunjungan"
          value={stats?.total ?? 0}
          icon={Eye}
          color="blue"
        />
        <StatCard
          label="Lokasi Aktif"
          value={locations.filter((l: any) => l.isActive).length}
          icon={QrCode}
          color="green"
        />
        <StatCard
          label="QR Terscan"
          value={stats?.total ?? 0}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Chart */}
      <div className="card mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Kunjungan per Lokasi</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada data kunjungan</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="kunjungan" fill="#c97d10" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Lokasi Terpopuler */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Lokasi Terpopuler</h3>
        <div className="space-y-3">
          {chartData.slice(0, 5).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.kunjungan} kunjungan</span>
            </div>
          ))}
          {chartData.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
          )}
        </div>
      </div>
    </div>
  );
}
