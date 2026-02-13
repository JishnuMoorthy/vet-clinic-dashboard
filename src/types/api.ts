// ============= Mia VMS — TypeScript Types (aligned with DATABASE_SCHEMA_INSTRUCTIONS_V0) =============

// ============= Enums =============

export type UserRole = "admin" | "vet" | "staff";
export type Gender = "male" | "female" | "unknown";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type InvoiceStatus = "draft" | "issued" | "paid" | "cancelled";
export type PaymentMethod = "upi" | "cash" | "card";
export type PaymentStatus = "pending" | "paid" | "failed";
export type ReminderEntityType = "appointment" | "medication" | "vaccination" | "payment";
export type ReminderChannel = "whatsapp";
export type ReminderStatus = "sent" | "failed";
export type MessageStatus = "queued" | "sent" | "failed";

// ============= Core Entities =============

export interface Clinic {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface User {
  id: string;
  clinic_id: string;
  name: string;
  phone?: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PetParent {
  id: string;
  clinic_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  govt_id_reference?: string;
  pets_count?: number;
  last_visit?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Pet {
  id: string;
  clinic_id: string;
  pet_parent_id: string;
  name: string;
  species: string;
  breed: string;
  gender: Gender;
  date_of_birth?: string;
  registration_number?: string;
  weight_kg?: number;
  is_sterilized?: boolean;
  microchip_id?: string;
  medical_notes?: string;
  pet_parent?: PetParent;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  pet_id: string;
  vet_id: string;
  appointment_date: string;
  start_time: string;
  end_time?: string;
  status: AppointmentStatus;
  notes?: string;
  reason?: string;
  pet?: Pet;
  vet?: User;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MedicalRecord {
  id: string;
  clinic_id: string;
  pet_id: string;
  vet_id: string;
  visit_date: string;
  symptoms: string;
  diagnosis: string;
  prescription?: string;
  follow_up_date?: string;
  pet?: Pet;
  vet?: User;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Invoice {
  id: string;
  clinic_id: string;
  pet_id: string;
  invoice_number: string;
  total_amount: number;
  gst_amount?: number;
  status: InvoiceStatus;
  line_items?: InvoiceLineItem[];
  pet?: Pet;
  owner?: PetParent;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Payment {
  id: string;
  clinic_id: string;
  invoice_id: string;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference_id?: string;
  invoice?: Invoice;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface InventoryItem {
  id: string;
  clinic_id: string;
  name: string;
  category?: string;
  quantity: number;
  low_stock_threshold: number;
  unit_price?: number;
  supplier?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ReminderLog {
  id: string;
  clinic_id: string;
  entity_type: ReminderEntityType;
  entity_id: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  failure_reason?: string;
  sent_at?: string;
  created_at: string;
}

export interface MessageLog {
  id: string;
  clinic_id: string;
  recipient_phone: string;
  template_name: string;
  payload?: Record<string, unknown>;
  status: MessageStatus;
  provider_message_id?: string;
  created_at: string;
}

// ============= Auth =============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Keep backward compat alias
export type AuthResponse = LoginResponse;

// ============= Request Types =============

export interface CreatePetRequest {
  name: string;
  species: string;
  breed: string;
  gender: Gender;
  date_of_birth?: string;
  pet_parent_id: string;
  weight_kg?: number;
  is_sterilized?: boolean;
  microchip_id?: string;
  medical_notes?: string;
}

export type UpdatePetRequest = Partial<CreatePetRequest>;

export interface CreateAppointmentRequest {
  pet_id: string;
  vet_id: string;
  appointment_date: string;
  start_time: string;
  end_time?: string;
  reason?: string;
  notes?: string;
}

export type UpdateAppointmentRequest = Partial<CreateAppointmentRequest> & {
  status?: AppointmentStatus;
};

export interface CreatePetParentRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  govt_id_reference?: string;
}

export type UpdatePetParentRequest = Partial<CreatePetParentRequest>;

export interface CreateInvoiceRequest {
  pet_id: string;
  line_items: InvoiceLineItem[];
  discount_percent?: number;
  notes?: string;
}

export type UpdateInvoiceRequest = Partial<CreateInvoiceRequest> & {
  status?: InvoiceStatus;
};

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password: string;
}

export type UpdateUserRequest = Partial<Omit<CreateUserRequest, "password">>;

export interface CreateMedicalRecordRequest {
  pet_id: string;
  vet_id: string;
  visit_date: string;
  symptoms: string;
  diagnosis: string;
  prescription?: string;
  follow_up_date?: string;
}

export type UpdateMedicalRecordRequest = Partial<CreateMedicalRecordRequest>;

export interface CreateInventoryItemRequest {
  name: string;
  category?: string;
  quantity: number;
  low_stock_threshold: number;
  unit_price?: number;
  supplier?: string;
  expiry_date?: string;
}

export type UpdateInventoryItemRequest = Partial<CreateInventoryItemRequest>;

// ============= API Responses =============

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface PagingParams {
  skip?: number;
  limit?: number;
}

export interface AppointmentFilters extends PagingParams {
  date_from?: string;
  date_to?: string;
  vet_id?: string;
  status?: AppointmentStatus;
}

export interface InvoiceFilters extends PagingParams {
  status?: InvoiceStatus;
  pet_id?: string;
}

export interface InventoryFilters extends PagingParams {
  category?: string;
}

export interface UserFilters extends PagingParams {
  role?: UserRole;
}

// ============= Dashboard =============

export interface DashboardData {
  todays_appointments: number;
  pending_invoices: number;
  total_pets: number;
  total_owners: number;
  upcoming_appointments: Appointment[];
  recent_invoices: Invoice[];
  low_stock_items: InventoryItem[];
}

// Legacy alias for backward compat
export type PetOwner = PetParent;
