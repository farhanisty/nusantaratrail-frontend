import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, Plus, Trash2, Download, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { qrApi, locationApi } from '../../services/api';
import { Location, QRCode } from '../../types';
import { PageHeader, ConfirmDialog, Spinner, EmptyState, Badge } from '../../components/common';

export default function QRCodesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<QRCode & { locationName: string } | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  // Ambil semua lokasi beserta QR-nya
  const { data, isLoading } = useQuery({
    queryKey: ['locations', 1, 100],
    queryFn: () => locationApi.getAll(1, 100),
  });

  const locations: Location[] = data?.data?.data ?? [];

  // Flatten semua QR dari semua lokasi
  const allQRCodes = locations.flatMap((loc) =>
    (loc.qrCodes ?? []).map((qr) => ({
      ...qr,
      locationName: loc.name,
      locationId: loc.id,
      locationCategory: loc.category,
    }))
  );

  // Filter berdasarkan search
  const filtered = allQRCodes.filter(
    (qr) =>
      qr.code.toLowerCase().includes(search.toLowerCase()) ||
      qr.locationName.toLowerCase().includes(search.toLowerCase())
  );

  const generateMutation = useMutation({
    mutationFn: (locationId: number) => {
      setGeneratingId(locationId);
      return qrApi.generate(locationId);
    },
    onSuccess: () => {
      toast.success('QR Code berhasil digenerate');
      qc.invalidateQueries({ queryKey: ['locations'] });
      setGeneratingId(null);
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message ?? 'Gagal generate QR');
      setGeneratingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => qrApi.delete(id),
    onSuccess: () => {
      toast.success('QR Code berhasil dihapus');
      qc.invalidateQueries({ queryKey: ['locations'] });
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Gagal menghapus QR'),
  });

  return (
    <div>
      <PageHeader
        title="QR Code"
        description={`Total ${allQRCodes.length} QR Code dari ${locations.length} lokasi`}
      />

      {/* Search & Info */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Cari kode atau nama lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Generate QR per Lokasi */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Generate QR Baru</h3>
        <p className="text-sm text-gray-500 mb-4">Pilih lokasi untuk generate QR Code baru.</p>
        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner className="w-5 h-5 text-primary-600" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{loc.name}</p>
                    <p className="text-xs text-gray-400">
                      {(loc.qrCodes ?? []).length} QR aktif
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => generateMutation.mutate(loc.id)}
                  disabled={generatingId === loc.id}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 flex-shrink-0 ml-2"
                >
                  {generatingId === loc.id ? (
                    <Spinner className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  Generate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daftar Semua QR */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Semua QR Code
            {search && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                — {filtered.length} hasil
              </span>
            )}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6 text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={search ? 'Tidak ada QR Code yang cocok' : 'Belum ada QR Code. Generate dari lokasi di atas.'}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
            {filtered.map((qr) => (
              <div
                key={qr.id}
                className="flex flex-col items-center border border-gray-100 rounded-xl p-4 hover:border-primary-200 hover:shadow-sm transition-all"
              >
                {/* QR Image */}
                {qr.qrImageUrl ? (
                  <img
                    src={qr.qrImageUrl}
                    alt={qr.code}
                    className="w-28 h-28 object-contain mb-3"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <QrCode className="w-10 h-10 text-gray-300" />
                  </div>
                )}

                {/* Info */}
                <div className="w-full text-center mb-3">
                  <Link
                    to={`/locations/${qr.locationId}`}
                    className="text-xs font-semibold text-primary-600 hover:underline line-clamp-1"
                  >
                    {qr.locationName}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5 break-all">{qr.code}</p>
                  <div className="flex justify-center mt-1.5">
                    <Badge label={qr.locationCategory} />
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`badge text-xs mb-3 ${qr.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                >
                  {qr.isActive ? 'Aktif' : 'Nonaktif'}
                </span>

                {/* Actions */}
                <div className="flex gap-2 w-full justify-center">
                  {qr.qrImageUrl && (
                    <a
                      href={qr.qrImageUrl}
                      download={`${qr.code}.png`}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        ...qr,
                        locationName: qr.locationName,
                      })
                    }
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus QR Code"
        message={`Yakin ingin menghapus QR Code "${deleteTarget?.code}" dari lokasi "${deleteTarget?.locationName}"?`}
        onConfirm={() => deleteMutation.mutate(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
