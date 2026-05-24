import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

// ─── Loading Spinner ──────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx('animate-spin', className ?? 'w-5 h-5')} />;
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ message = 'Tidak ada data' }: { message?: string }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────
export function PageHeader({
  title, description, action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
export function StatCard({
  label, value, icon: Icon, color = 'primary',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────
const badgeColors: Record<string, string> = {
  candi: 'bg-orange-100 text-orange-700',
  museum: 'bg-blue-100 text-blue-700',
  keraton: 'bg-purple-100 text-purple-700',
  makam: 'bg-gray-100 text-gray-700',
  situs: 'bg-green-100 text-green-700',
  lainnya: 'bg-yellow-100 text-yellow-700',
  admin: 'bg-blue-100 text-blue-700',
  superadmin: 'bg-red-100 text-red-700',
  tourist: 'bg-green-100 text-green-700',
};

export function Badge({ label }: { label: string }) {
  return (
    <span className={clsx('badge', badgeColors[label] ?? 'bg-gray-100 text-gray-700')}>
      {label}
    </span>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────
export function ConfirmDialog({
  open, title, message, onConfirm, onCancel, loading,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm">Batal</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger text-sm flex items-center gap-2">
            {loading && <Spinner className="w-4 h-4" />} Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({
  open, title, onClose, children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
