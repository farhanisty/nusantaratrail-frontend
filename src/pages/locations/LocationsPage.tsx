import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { locationApi } from '../../services/api';
import { Location, Category } from '../../types';
import { PageHeader, Badge, ConfirmDialog, Modal, Spinner, EmptyState } from '../../components/common';

const categories: Category[] = ['candi', 'museum', 'keraton', 'makam', 'situs', 'lainnya'];

const schema = z.object({
  name: z.string().min(3, 'Minimal 3 karakter'),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.string().min(1, 'Wajib diisi'),
  longitude: z.string().min(1, 'Wajib diisi'),
  category: z.enum(['candi', 'museum', 'keraton', 'makam', 'situs', 'lainnya']),
});

type FormData = z.infer<typeof schema>;

export default function LocationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['locations', page],
    queryFn: () => locationApi.getAll(page, 10),
  });

  const locations: Location[] = data?.data?.data ?? [];
  const meta = data?.data?.meta;

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => { setEditTarget(null); reset(); setImageFile(null); setModalOpen(true); };
  const openEdit = (loc: Location) => {
    setEditTarget(loc);
    setValue('name', loc.name);
    setValue('description', loc.description ?? '');
    setValue('address', loc.address ?? '');
    setValue('latitude', String(loc.latitude));
    setValue('longitude', String(loc.longitude));
    setValue('category', loc.category);
    setImageFile(null);
    setModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => {
      const form = new FormData();
      Object.entries(fd).forEach(([k, v]) => { if (v) form.append(k, v); });
      if (imageFile) form.append('image', imageFile);
      return locationApi.create(form);
    },
    onSuccess: () => { toast.success('Lokasi berhasil ditambahkan'); qc.invalidateQueries({ queryKey: ['locations'] }); setModalOpen(false); reset(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Gagal'),
  });

  const updateMutation = useMutation({
    mutationFn: (fd: FormData) => {
      const form = new FormData();
      Object.entries(fd).forEach(([k, v]) => { if (v) form.append(k, v); });
      if (imageFile) form.append('image', imageFile);
      return locationApi.update(editTarget!.id, form);
    },
    onSuccess: () => { toast.success('Lokasi berhasil diperbarui'); qc.invalidateQueries({ queryKey: ['locations'] }); setModalOpen(false); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Gagal'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => locationApi.delete(id),
    onSuccess: () => { toast.success('Lokasi berhasil dihapus'); qc.invalidateQueries({ queryKey: ['locations'] }); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Gagal'),
  });

  const onSubmit = (fd: FormData) => {
    editTarget ? updateMutation.mutate(fd) : createMutation.mutate(fd);
  };

  return (
    <div>
      <PageHeader
        title="Lokasi Wisata"
        description="Kelola semua lokasi wisata budaya"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Tambah Lokasi
          </button>
        }
      />

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="w-6 h-6 text-primary-600" /></div>
        ) : locations.length === 0 ? (
          <EmptyState message="Belum ada lokasi wisata" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Nama', 'Kategori', 'Alamat', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {loc.coverImage ? (
                          <img src={loc.coverImage} alt={loc.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 text-xs font-bold">{loc.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{loc.name}</p>
                          <p className="text-xs text-gray-400">{loc.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge label={loc.category} /></td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{loc.address ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${loc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {loc.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/locations/${loc.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => openEdit(loc)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(loc)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Total {meta.total} lokasi</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Prev</button>
              <span className="text-xs text-gray-500 flex items-center">{page} / {meta.totalPages}</span>
              <button disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal open={modalOpen} title={editTarget ? 'Edit Lokasi' : 'Tambah Lokasi'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nama Lokasi *</label>
            <input className="input" placeholder="Candi Prambanan" {...register('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Kategori *</label>
            <select className="input" {...register('category')}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude *</label>
              <input className="input" placeholder="-7.75208" {...register('latitude')} />
              {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude.message}</p>}
            </div>
            <div>
              <label className="label">Longitude *</label>
              <input className="input" placeholder="110.49149" {...register('longitude')} />
              {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Alamat</label>
            <input className="input" placeholder="Jl. Raya..." {...register('address')} />
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <textarea rows={3} className="input resize-none" placeholder="Deskripsi singkat lokasi..." {...register('description')} />
          </div>
          <div>
            <label className="label">Foto Cover</label>
            <input type="file" accept="image/*" className="input" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-sm flex items-center gap-2">
              {isSubmitting && <Spinner className="w-4 h-4" />}
              {editTarget ? 'Simpan Perubahan' : 'Tambah Lokasi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Lokasi"
        message={`Yakin ingin menghapus "${deleteTarget?.name}"? Aksi ini tidak dapat dibatalkan.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
