// ─── Auth ─────────────────────────────────────────────────────
export type Role = 'superadmin' | 'admin' | 'tourist';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// ─── Location ─────────────────────────────────────────────────
export type Category = 'candi' | 'museum' | 'keraton' | 'makam' | 'situs' | 'lainnya';

export interface Location {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  category: Category;
  coverImage?: string;
  isActive: boolean;
  createdAt: string;
  user?: User;
  reviews?: Review[];
  qrCodes?: QRCode[];
}

// ─── QR Code ──────────────────────────────────────────────────
export interface QRCode {
  id: number;
  code: string;
  qrImageUrl?: string;
  isActive: boolean;
  locationId: number;
  createdAt: string;
}

// ─── Audio Guide ──────────────────────────────────────────────
export interface AudioGuide {
  _id: string;
  locationId: number;
  language: 'id' | 'en';
  title: string;
  audioUrl: string;
  durationSeconds: number;
  transcript?: string;
  uploadedBy: number;
  createdAt: string;
}

// ─── Historical Content ───────────────────────────────────────
export interface Section {
  heading: string;
  body: string;
  imageUrl?: string;
}

export interface HistoricalContent {
  _id: string;
  locationId: number;
  language: 'id' | 'en';
  title: string;
  sections: Section[];
  tags: string[];
  createdAt: string;
}

// ─── Review ───────────────────────────────────────────────────
export interface Review {
  id: number;
  rating: number;
  comment?: string;
  locationId: number;
  userId: number;
  user?: User;
  createdAt: string;
}

// ─── Visit Stats ──────────────────────────────────────────────
export interface VisitStats {
  total: number;
  byLocation: { locationId: number; _count: { id: number } }[];
}

// ─── API Response ─────────────────────────────────────────────
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
