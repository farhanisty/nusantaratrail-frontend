import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, QrCode, Headphones, BookOpen, Star, Download, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { locationApi, qrApi, audioApi, reviewApi } from '../../services/api';
import { Badge, Spinner, ConfirmDialog, EmptyState, Modal } from '../../components/common';
import { QRCode, AudioGuide, Review } from '../../types';

const tabs = [
  { key: 'qr', label: 'QR Code', icon: QrCode },
  { key: 'audio', label: 'Audio Guide', icon: Headphones },
  { key: 'content', label: 'Konten Sejarah', icon: BookOpen },
  { key: 'reviews', label: 'Review', icon: Star },
];

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locationId = parseInt(id!);
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('qr');
  const [deleteQR, setDeleteQR] = useState<QRCode | null>(null);
  const [deleteReview, setDeleteReview] = useState<Review | null>(null);
  const [audioModal, setAudioModal] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioForm, setAudioForm] = useState({ title: '', language: 'id', transcript: '' });

  const { data: locData, isLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => locationApi.getById(locationId),
  });

  const { data: audioData } = useQuery({
    queryKey: ['audio', locationId],
    queryFn: () => audioApi.getByLocation(locationId),
    enabled: activeTab === 'audio',
  });

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', locationId],
    queryFn: () => reviewApi.getByLocation(locationId),
    enabled: activeTab === 'reviews',
  });

  const location = locData?.data?.data;
  const audios: AudioGuide[] = audioData?.data?.data ?? [];
  const reviewResult = reviewData?.data?.data;
  const reviews: Review[] = reviewResult?.reviews ?? [];

  const generateQR = useMutation({
    mutationFn: () => qrApi.generate(locationId),
    onSuccess: () => { toast.success('QR Code berhasil digenerate'); qc.invalidateQueries({ queryKey: ['location', locationId] }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Gagal'),
  });

  const deleteQRMutation = useMutation({
    mutationFn: (qrId: number) => qrApi.delete(qrId),
    onSuccess: () => { toast.success('QR Code dihapus'); qc.invalidateQueries({ queryKey: ['location', locationId] }); setDeleteQR(null); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Gagal'),
  });

  const uploadAudioMutation = useMutation({
    mutationFn: () => {
      if (!audioFile) throw new Error('File audio wajib dipilih');
      const form = new FormData();
      form.append('audio', audioFile);
      form.append('locationId', String(locationId));
      form.append('title', audioForm.title);
      form.append('language', audioForm.language);
      form.append('transcript', audioForm.transcript);
      return audioApi.upload(form);
    },
    onSuccess: () => { toast.success('Audio berhasil diupload'); qc.invalidateQueries({ queryKey: ['audio', locationId] }); setAudioModal(false); setAudioFile(null); setAudioForm({ title: '', language: 'id', transcript: '' }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'File audio wajib dipilih'),
  });

  const deleteAudioMutation = useMutation({
    mutationFn: (audioId: string) => audioApi.delete(audioId),
    onSuccess: () => { toast.success('Audio dihapus'); qc.invalidateQueries({ queryKey: ['audio', locationId] }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Gagal'),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewApi.delete(reviewId),
    onSuccess: () => { toast.success('Review dihapus'); qc.invalidateQueries({ queryKey: ['reviews', locationId] }); setDeleteReview(null); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Gagal'),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-primary-600" /></div>;
  if (!location) return <div className="text-center py-16 text-gray-400">Lokasi tidak ditemukan</div>;

  return (
    <div>
      {/* Back */}
      <Link to="/locations" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Lokasi
      </Link>

      {/* Location Header */}
      <div className="card mb-6">
        <div className="flex gap-4">
          {location.coverImage ? (
            <img src={location.coverImage} alt={location.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-24 h-24 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 text-2xl font-bold">{location.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{location.name}</h2>
              <Badge label={location.category} />
            </div>
            <p className="text-sm text-gray-500 mb-2">{location.address ?? 'Alamat tidak tersedia'}</p>
            <p className="text-xs text-gray-400">
              {location.latitude}, {location.longitude}
            </p>
            {location.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{location.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center ${
              activeTab === tab.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: QR Code */}
      {activeTab === 'qr' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">QR Code</h3>
            <button onClick={() => generateQR.mutate()} disabled={generateQR.isPending} className="btn-primary text-sm flex items-center gap-2">
              {generateQR.isPending ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              Generate QR
            </button>
          </div>
          {(location.qrCodes ?? []).length === 0 ? (
            <EmptyState message="Belum ada QR Code untuk lokasi ini" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(location.qrCodes ?? []).map((qr: QRCode) => (
                <div key={qr.id} className="border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-3">
                  {qr.qrImageUrl && (
                    <img src={qr.qrImageUrl} alt={qr.code} className="w-32 h-32 object-contain" />
                  )}
                  <p className="text-xs text-gray-500 text-center break-all">{qr.code}</p>
                  <div className="flex gap-2">
                    {qr.qrImageUrl && (
                      <a href={qr.qrImageUrl} download={`${qr.code}.png`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => setDeleteQR(qr)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Audio Guide */}
      {activeTab === 'audio' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Audio Guide</h3>
            <button onClick={() => setAudioModal(true)} className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload Audio
            </button>
          </div>
          {audios.length === 0 ? (
            <EmptyState message="Belum ada audio guide" />
          ) : (
            <div className="space-y-3">
              {audios.map((audio) => (
                <div key={audio._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{audio.title}</p>
                    <p className="text-xs text-gray-400">{audio.language === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'} · {audio.durationSeconds}s</p>
                    <audio controls src={audio.audioUrl} className="mt-2 w-full h-8" />
                  </div>
                  <button onClick={() => deleteAudioMutation.mutate(audio._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Reviews */}
      {activeTab === 'reviews' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Review Turis</h3>
              {reviewResult && (
                <p className="text-sm text-gray-500">
                  {reviewResult.totalReviews} review · Rating rata-rata: ⭐ {reviewResult.avgRating?.toFixed(1) ?? '-'}
                </p>
              )}
            </div>
          </div>
          {reviews.length === 0 ? (
            <EmptyState message="Belum ada review" />
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                        {review.user?.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{review.user?.name}</span>
                      <span className="text-yellow-500 text-xs">{'⭐'.repeat(review.rating)}</span>
                    </div>
                    <button onClick={() => setDeleteReview(review)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Konten Sejarah */}
      {activeTab === 'content' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Konten Sejarah</h3>
            <Link to={`/content?locationId=${locationId}`} className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Kelola Konten
            </Link>
          </div>
          <p className="text-sm text-gray-500">Buka halaman Konten Sejarah untuk mengelola konten lokasi ini.</p>
        </div>
      )}

      {/* Modal Upload Audio */}
      <Modal open={audioModal} title="Upload Audio Guide" onClose={() => setAudioModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="label">Judul Audio *</label>
            <input className="input" placeholder="Sejarah Candi Prambanan" value={audioForm.title} onChange={e => setAudioForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Bahasa</label>
            <select className="input" value={audioForm.language} onChange={e => setAudioForm(f => ({ ...f, language: e.target.value }))}>
              <option value="id">🇮🇩 Indonesia</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
          <div>
            <label className="label">File Audio * (mp3, wav, m4a)</label>
            <input type="file" accept=".mp3,.wav,.m4a,.ogg" className="input" onChange={e => setAudioFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <label className="label">Transkrip (opsional)</label>
            <textarea rows={4} className="input resize-none" placeholder="Teks narasi audio..." value={audioForm.transcript} onChange={e => setAudioForm(f => ({ ...f, transcript: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setAudioModal(false)} className="btn-secondary text-sm">Batal</button>
            <button onClick={() => uploadAudioMutation.mutate()} disabled={uploadAudioMutation.isPending} className="btn-primary text-sm flex items-center gap-2">
              {uploadAudioMutation.isPending && <Spinner className="w-4 h-4" />} Upload
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog open={!!deleteQR} title="Hapus QR Code" message={`Yakin hapus QR Code "${deleteQR?.code}"?`} onConfirm={() => deleteQRMutation.mutate(deleteQR!.id)} onCancel={() => setDeleteQR(null)} loading={deleteQRMutation.isPending} />
      <ConfirmDialog open={!!deleteReview} title="Hapus Review" message="Yakin ingin menghapus review ini?" onConfirm={() => deleteReviewMutation.mutate(deleteReview!.id)} onCancel={() => setDeleteReview(null)} loading={deleteReviewMutation.isPending} />
    </div>
  );
}
