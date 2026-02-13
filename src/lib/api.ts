import type {
  LoginResponse,
  User,
  Pet,
  PetParent,
  Appointment,
  MedicalRecord,
  Invoice,
  Payment,
  InventoryItem,
  ReminderLog,
  MessageLog,
  DashboardData,
  PaginatedResponse,
  PagingParams,
  AppointmentFilters,
  InvoiceFilters,
  InventoryFilters,
  UserFilters,
  CreatePetRequest,
  UpdatePetRequest,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  CreatePetParentRequest,
  UpdatePetParentRequest,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
} from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// ============= Low-level fetch wrapper =============

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function buildQuery(params: Record<string, unknown>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

// ============= Exported API Client (matches BACKEND_INTEGRATION_GUARDRAILS) =============

export const apiClient = {
  // ── Auth ──
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // ── Dashboard ──
  getDashboard: () => request<DashboardData>("/clinic/dashboard"),

  // ── Pets ──
  getPets: (params: PagingParams = {}) =>
    request<PaginatedResponse<Pet>>(`/pets${buildQuery(params)}`),
  getPetById: (id: string) => request<Pet>(`/pets/${id}`),
  createPet: (data: CreatePetRequest) =>
    request<Pet>("/pets", { method: "POST", body: JSON.stringify(data) }),
  updatePet: (id: string, data: UpdatePetRequest) =>
    request<Pet>(`/pets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePet: (id: string) =>
    request<void>(`/pets/${id}`, { method: "DELETE" }),

  // ── Pet Parents / Owners ──
  getPetParents: (params: PagingParams = {}) =>
    request<PaginatedResponse<PetParent>>(`/pet_parents${buildQuery(params)}`),
  getPetParentById: (id: string) => request<PetParent>(`/pet_parents/${id}`),
  createPetParent: (data: CreatePetParentRequest) =>
    request<PetParent>("/pet_parents", { method: "POST", body: JSON.stringify(data) }),
  updatePetParent: (id: string, data: UpdatePetParentRequest) =>
    request<PetParent>(`/pet_parents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePetParent: (id: string) =>
    request<void>(`/pet_parents/${id}`, { method: "DELETE" }),

  // ── Appointments ──
  getAppointments: (params: AppointmentFilters = {}) =>
    request<PaginatedResponse<Appointment>>(`/appointments${buildQuery(params)}`),
  getAppointmentById: (id: string) => request<Appointment>(`/appointments/${id}`),
  createAppointment: (data: CreateAppointmentRequest) =>
    request<Appointment>("/appointments", { method: "POST", body: JSON.stringify(data) }),
  updateAppointment: (id: string, data: UpdateAppointmentRequest) =>
    request<Appointment>(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAppointment: (id: string) =>
    request<void>(`/appointments/${id}`, { method: "DELETE" }),
  markAppointmentComplete: (id: string) =>
    request<Appointment>(`/appointments/${id}/mark-complete`, { method: "PUT" }),

  // ── Medical Records ──
  getMedicalRecords: (params: PagingParams & { pet_id?: string } = {}) =>
    request<PaginatedResponse<MedicalRecord>>(`/medical_records${buildQuery(params)}`),
  getMedicalRecordById: (id: string) => request<MedicalRecord>(`/medical_records/${id}`),
  createMedicalRecord: (data: CreateMedicalRecordRequest) =>
    request<MedicalRecord>("/medical_records", { method: "POST", body: JSON.stringify(data) }),
  updateMedicalRecord: (id: string, data: UpdateMedicalRecordRequest) =>
    request<MedicalRecord>(`/medical_records/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMedicalRecord: (id: string) =>
    request<void>(`/medical_records/${id}`, { method: "DELETE" }),

  // ── Invoices ──
  getInvoices: (params: InvoiceFilters = {}) =>
    request<PaginatedResponse<Invoice>>(`/invoices${buildQuery(params)}`),
  getInvoiceById: (id: string) => request<Invoice>(`/invoices/${id}`),
  createInvoice: (data: CreateInvoiceRequest) =>
    request<Invoice>("/invoices", { method: "POST", body: JSON.stringify(data) }),
  updateInvoice: (id: string, data: UpdateInvoiceRequest) =>
    request<Invoice>(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  markInvoicePaid: (id: string, data: { payment_method: string; reference_id?: string }) =>
    request<Invoice>(`/invoices/${id}/mark-paid`, { method: "PUT", body: JSON.stringify(data) }),
  sendInvoiceReminder: (id: string) =>
    request<void>(`/invoices/${id}/send-reminder`, { method: "POST" }),

  // ── Payments ──
  getPayments: (params: PagingParams & { invoice_id?: string } = {}) =>
    request<PaginatedResponse<Payment>>(`/payments${buildQuery(params)}`),
  getPaymentById: (id: string) => request<Payment>(`/payments/${id}`),

  // ── Inventory ──
  getInventory: (params: InventoryFilters = {}) =>
    request<PaginatedResponse<InventoryItem>>(`/inventory${buildQuery(params)}`),
  getInventoryById: (id: string) => request<InventoryItem>(`/inventory/${id}`),
  createInventoryItem: (data: CreateInventoryItemRequest) =>
    request<InventoryItem>("/inventory", { method: "POST", body: JSON.stringify(data) }),
  updateInventoryItem: (id: string, data: UpdateInventoryItemRequest) =>
    request<InventoryItem>(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteInventoryItem: (id: string) =>
    request<void>(`/inventory/${id}`, { method: "DELETE" }),

  // ── Users / Staff ──
  getUsers: (params: UserFilters = {}) =>
    request<PaginatedResponse<User>>(`/users${buildQuery(params)}`),
  getUserById: (id: string) => request<User>(`/users/${id}`),
  createUser: (data: CreateUserRequest) =>
    request<User>("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: string, data: UpdateUserRequest) =>
    request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    request<void>(`/users/${id}`, { method: "DELETE" }),

  // ── Reminder Logs (read-only) ──
  getReminderLogs: (params: PagingParams = {}) =>
    request<PaginatedResponse<ReminderLog>>(`/reminder_logs${buildQuery(params)}`),

  // ── Message Logs (read-only) ──
  getMessageLogs: (params: PagingParams = {}) =>
    request<PaginatedResponse<MessageLog>>(`/message_logs${buildQuery(params)}`),
};

// Legacy class-based export for backward compat during migration
export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
