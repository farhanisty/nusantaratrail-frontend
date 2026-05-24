import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { contentApi, locationApi } from '../../services/api';
import { HistoricalContent, Section } from '../../types';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Modal,
  Spinner,
} from '../../components/common';

const emptySection: Section = {
  heading: '',
  body: '',
  imageUrl: '',
};

export default function ContentPage() {
  const [params] = useSearchParams();
  const locationId = Number(params.get('locationId'));

  const qc = useQueryClient();

  const [contentModal, setContentModal] = useState(false);
  const [deleteContent, setDeleteContent] = useState<HistoricalContent | null>(null);
  const [editingContent, setEditingContent] = useState<HistoricalContent | null>(null);

  const [form, setForm] = useState({
    title: '',
    language: 'id',
    tags: '',
  });

  const [sections, setSections] = useState<Section[]>([
    { ...emptySection },
  ]);

  const { data: locationData, isLoading: locationLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => locationApi.getById(locationId),
    enabled: !!locationId,
  });

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['historical-content', locationId],
    queryFn: () => contentApi.getByLocation(locationId),
    enabled: !!locationId,
  });

  const location = locationData?.data?.data;

  const contents: HistoricalContent[] = useMemo(() => {
    const data = contentData?.data?.data;

    if (!data) return [];

    if (Array.isArray(data)) return data;

    return [data];
  }, [contentData]);

  const resetForm = () => {
    setForm({
      title: '',
      language: 'id',
      tags: '',
    });

    setSections([{ ...emptySection }]);
    setEditingContent(null);
  };

  const openCreateModal = () => {
    resetForm();
    setContentModal(true);
  };

  const openEditModal = (content: HistoricalContent) => {
    setEditingContent(content);

    setForm({
      title: content.title,
      language: content.language,
      tags: content.tags.join(', '),
    });

    setSections(
      content.sections.length > 0
        ? content.sections
        : [{ ...emptySection }]
    );

    setContentModal(true);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      contentApi.create({
        locationId,
        title: form.title,
        language: form.language,
        tags: form.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        sections,
      }),
    onSuccess: () => {
      toast.success('Konten sejarah berhasil dibuat');
      qc.invalidateQueries({ queryKey: ['historical-content', locationId] });
      setContentModal(false);
      resetForm();
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message ?? 'Gagal membuat konten');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      contentApi.update(editingContent!._id, {
        title: form.title,
        language: form.language,
        tags: form.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        sections,
      }),
    onSuccess: () => {
      toast.success('Konten sejarah berhasil diupdate');
      qc.invalidateQueries({ queryKey: ['historical-content', locationId] });
      setContentModal(false);
      resetForm();
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message ?? 'Gagal update konten');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentApi.delete(id),
    onSuccess: () => {
      toast.success('Konten sejarah berhasil dihapus');
      qc.invalidateQueries({ queryKey: ['historical-content', locationId] });
      setDeleteContent(null);
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message ?? 'Gagal menghapus konten');
    },
  });

  const submitForm = () => {
    if (!form.title.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    const invalidSection = sections.some(
      section => !section.heading.trim() || !section.body.trim()
    );

    if (invalidSection) {
      toast.error('Semua section wajib memiliki heading dan isi');
      return;
    }

    if (editingContent) {
      updateMutation.mutate();
      return;
    }

    createMutation.mutate();
  };

  const addSection = () => {
    setSections(prev => [...prev, { ...emptySection }]);
  };

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const updateSection = (
    index: number,
    key: keyof Section,
    value: string
  ) => {
    setSections(prev =>
      prev.map((section, i) =>
        i === index
          ? {
            ...section,
            [key]: value,
          }
          : section
      )
    );
  };

  if (locationLoading || isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <Link
        to={locationId ? `/locations/${locationId}` : '/locations'}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Konten Sejarah
              </h1>
            </div>

            {location && (
              <>
                <p className="text-gray-700 font-medium">
                  {location.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola cerita sejarah, informasi budaya, dan narasi wisata.
                </p>
              </>
            )}
          </div>

          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Konten
          </button>
        </div>
      </div>

      {contents.length === 0 ? (
        <div className="card">
          <EmptyState message="Belum ada konten sejarah untuk lokasi ini" />
        </div>
      ) : (
        <div className="space-y-6">
          {contents.map(content => (
            <div key={content._id} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {content.title}
                    </h2>

                    <Badge
                      label={
                        content.language === 'id'
                          ? 'Indonesia'
                          : 'English'
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {content.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(content)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteContent(content)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {content.sections.map((section, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">
                        {section.heading}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {section.body}
                    </p>

                    {section.imageUrl && (
                      <img
                        src={section.imageUrl}
                        alt={section.heading}
                        className="mt-4 rounded-xl w-full max-h-80 object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={contentModal}
        title={editingContent ? 'Edit Konten Sejarah' : 'Tambah Konten Sejarah'}
        onClose={() => {
          setContentModal(false);
          resetForm();
        }}
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <div>
            <label className="label">Judul Konten *</label>
            <input
              className="input"
              placeholder="Sejarah Keraton Yogyakarta"
              value={form.title}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="label">Bahasa</label>
            <select
              className="input"
              value={form.language}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  language: e.target.value,
                }))
              }
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="label">Tags</label>
            <input
              className="input"
              placeholder="budaya, kerajaan, sejarah"
              value={form.tags}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  tags: e.target.value,
                }))
              }
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                Section Konten
              </h3>

              <button
                type="button"
                onClick={addSection}
                className="text-sm text-primary-600 font-medium"
              >
                + Tambah Section
              </button>
            </div>

            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Section {index + 1}
                    </p>

                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-red-600 text-sm"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="label">Heading</label>
                      <input
                        className="input"
                        placeholder="Awal Berdirinya Keraton"
                        value={section.heading}
                        onChange={e =>
                          updateSection(index, 'heading', e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="label">Isi Cerita</label>
                      <textarea
                        rows={5}
                        className="input resize-none"
                        placeholder="Tuliskan isi sejarah atau cerita budaya..."
                        value={section.body}
                        onChange={e =>
                          updateSection(index, 'body', e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="label">
                        URL Gambar (opsional)
                      </label>

                      <input
                        className="input"
                        placeholder="https://example.com/image.jpg"
                        value={section.imageUrl}
                        onChange={e =>
                          updateSection(index, 'imageUrl', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setContentModal(false);
                resetForm();
              }}
              className="btn-secondary text-sm"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={submitForm}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="btn-primary text-sm flex items-center gap-2"
            >
              {(createMutation.isPending ||
                updateMutation.isPending) && (
                  <Spinner className="w-4 h-4" />
                )}

              {editingContent
                ? 'Update Konten'
                : 'Simpan Konten'}
            </button>
          </div>
        </div>
      </Modal >

      <ConfirmDialog
        open={!!deleteContent}
        title="Hapus Konten"
        message={`Yakin ingin menghapus konten "${deleteContent?.title}"?`}
        onConfirm={() =>
          deleteMutation.mutate(deleteContent!._id)
        }
        onCancel={() => setDeleteContent(null)}
        loading={deleteMutation.isPending}
      />
    </div >
  );
}
