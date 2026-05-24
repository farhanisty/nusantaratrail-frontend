import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, QrCode, Headphones,
  BookOpen, Star, BarChart2, Users, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../services/api';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'superadmin'] },
  { label: 'Lokasi Wisata', icon: MapPin, path: '/locations', roles: ['admin', 'superadmin'] },
  { label: 'QR Code', icon: QrCode, path: '/qrcodes', roles: ['admin', 'superadmin'] },
  { label: 'Audio Guide', icon: Headphones, path: '/audio', roles: ['admin', 'superadmin'] },
  { label: 'Konten Sejarah', icon: BookOpen, path: '/content', roles: ['admin', 'superadmin'] },
  { label: 'Review', icon: Star, path: '/reviews', roles: ['admin', 'superadmin'] },
  { label: 'Laporan', icon: BarChart2, path: '/reports', roles: ['admin', 'superadmin'] },
  { label: 'Pengguna', icon: Users, path: '/users', roles: ['superadmin'] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) =>
    isSuperAdmin() ? true : item.roles.includes(user?.role ?? '')
  );

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-700">
        <div className="w-8 h-8 bg-primary-300 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-batik" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">NusantaraTrail</p>
          <p className="text-primary-300 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-500 text-white'
                  : 'text-primary-200 hover:bg-primary-700 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-primary-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-primary-300 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-primary-200 hover:text-white hover:bg-primary-700 rounded-lg text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-batik flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-batik z-50">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-gray-800 font-semibold text-sm lg:text-base">
            {filteredNav.find((n) => location.pathname.startsWith(n.path))?.label ?? 'NusantaraTrail'}
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
