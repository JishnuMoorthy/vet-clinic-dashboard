// ============= API Entity Types =============

export type UserRole = "admin" | "vet" | "staff";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  specialties?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  date_of_birth?: string;
  weight?: number;
  microchip_id?: string;
  notes?: string;
  status: string;
  owner_id: string;
  owner?: PetOwner;
  created_at: string;
  updated_at: string;
}

export interface PetOwner {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
  pets_count?: number;
  last_visit?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  pet_id: string;
  pet?: Pet;
  vet_id: string;
  vet?: User;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  pet_id: string;
  pet?: Pet;
  owner_id: string;
  owner?: PetOwner;
  line_items: InvoiceLineItem[];
  subtotal: number;
  discount?: number;
  total: number;
  status: "paid" | "pending" | "overdue";
  due_date: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  reorder_level: number;
  unit_price?: number;
  supplier?: string;
  expiry_date?: string;
  status: "ok" | "low" | "out";
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  todays_appointments: number;
  pending_invoices: number;
  total_pets: number;
  total_owners: number;
  upcoming_appointments: Appointment[];
  recent_invoices: Invoice[];
  low_stock_items: InventoryItem[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
