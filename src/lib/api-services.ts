/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  DashboardData,
  PetOwner,
  Pet,
  Appointment,
  InventoryItem,
  Invoice,
  User,
  UserRole,
  MedicalRecord,
  PetDocument,
} from "@/types/api";
import { api } from "@/lib/api";

// ─── Mappers ─────────────────────────────────────────────────────────────────
// The FastAPI backend returns flat snake_case shapes (e.g. `owner_name`,
// `pet_name`, `vet_name`). Mappers normalize these into the nested camelCase
// shapes the frontend components consume.

export function mapUser(u: any): User {
  return {
    ...u,
    full_name: u.name || u.full_name || "",
    role: (u.role || "staff") as UserRole,
    specialties: u.specialties || [],
  };
}

export function mapOwner(o: any): PetOwner {
  return {
    ...o,
    full_name: o.name || o.full_name || "",
    pets_count: o.pet_count ?? o.pets_count ?? 0,
    info_complete: o.info_complete ?? true,
  };
}

export function mapPet(p: any): Pet {
  const gender = p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : p.gender;
  const owner =
    p.owner ??
    (p.owner_name ? { id: p.owner_id, full_name: p.owner_name } : undefined);
  return {
    ...p,
    gender,
    status: p.health_status || p.status || "active",
    weight: p.weight_kg ?? p.weight,
    owner,
    info_complete: p.info_complete ?? true,
  };
}

export function mapAppointment(a: any): Appointment {
  let status = a.status || "scheduled";
  if (status === "no_show") status = "no-show";
  const owner = a.owner_name
    ? { id: a.owner_id, full_name: a.owner_name, phone: a.owner_phone || "" }
    : undefined;
  const pet = a.pet_name
    ? {
        id: a.pet_id,
        name: a.pet_name,
        species: a.pet_species,
        breed: a.pet_breed,
        photo_url: a.pet_photo_url,
        owner,
      }
    : undefined;
  const vet = a.vet_name ? { id: a.vet_id, full_name: a.vet_name } : undefined;
  return {
    ...a,
    status,
    date: a.appointment_date || a.date || "",
    time: a.appointment_time || a.time || "",
    pet,
    vet,
    owner,
  } as Appointment;
}

export function mapInventoryItem(i: any): InventoryItem {
  const qty: number = i.quantity ?? 0;
  const threshold: number = i.low_stock_threshold ?? i.reorder_level ?? 0;
  const status: "ok" | "low" | "out" = qty === 0 ? "out" : qty <= threshold ? "low" : "ok";
  return {
    ...i,
    name: i.item_name || i.name || "",
    category: i.item_type || i.category || "Other",
    reorder_level: threshold,
    unit_price: i.cost_per_unit ?? i.unit_price,
    status,
  };
}

export function mapInvoice(inv: any): Invoice {
  // Build pet/owner from flat fields (list endpoint) or nested objects (detail/join)
  const pet = inv.pets ? mapPet(inv.pets)
    : inv.pet?.name ? inv.pet
    : inv.pet_name ? { id: inv.pet_id, name: inv.pet_name }
    : undefined;
  const owner = inv.pet_owners ? mapOwner(inv.pet_owners)
    : inv.owner?.full_name ? inv.owner
    : inv.owner_name ? { id: inv.owner_id, full_name: inv.owner_name }
    : undefined;
  return {
    ...inv,
    pet,
    owner,
    line_items: (() => { const raw = inv.line_items; if (!raw) return []; if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } } return Array.isArray(raw) ? raw : []; })(),
    subtotal: inv.amount ?? inv.subtotal ?? 0,
    discount: inv.discount ?? 0,
    total: inv.total_amount ?? inv.total ?? 0,
  };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

interface BackendStats {
  total_pets: number;
  total_owners: number;
  total_appointments: number;
  upcoming_appointments: number;
  total_staff: number;
  total_inventory_items: number;
  low_stock_items: number;
  pending_invoices: number;
  total_revenue: number;
}

export async function getDashboardStats(): Promise<DashboardData> {
  const today = new Date().toISOString().split("T")[0];
  const [stats, upcoming, recentInvoices, lowStock] = await Promise.all([
    api.get<BackendStats>("/dashboard/stats"),
    api.get<{ data: any[] }>(
      `/appointments?date_from=${today}&limit=5`
    ),
    api.get<{ data: any[] }>(`/invoices?limit=5`),
    api.get<{ data: any[] }>(`/inventory?low_stock_only=true&limit=10`),
  ]);

  return {
    todays_appointments: stats.upcoming_appointments ?? 0,
    pending_invoices: stats.pending_invoices ?? 0,
    total_pets: stats.total_pets ?? 0,
    total_owners: stats.total_owners ?? 0,
    upcoming_appointments: (upcoming.data || []).map(mapAppointment),
    recent_invoices: (recentInvoices.data || []).map(mapInvoice),
    low_stock_items: (lowStock.data || []).map(mapInventoryItem),
  };
}

// ─── Owners ──────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, any> | undefined): string {
  if (!params) return "";
  const parts: string[] = [];
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  });
  return parts.length ? `?${parts.join("&")}` : "";
}

export async function getOwners(params?: { search?: string; skip?: number; limit?: number }) {
  const res = await api.get<{ data: any[]; total: number }>(`/owners${buildQuery(params)}`);
  return { data: (res.data || []).map(mapOwner), total: res.total ?? 0 };
}

export async function getOwner(id: string): Promise<PetOwner> {
  return mapOwner(await api.get<any>(`/owners/${id}`));
}

export async function createOwner(data: Partial<PetOwner>): Promise<PetOwner> {
  const payload = {
    name: data.full_name || "",
    phone: data.phone || "",
    email: data.email || null,
    address: data.address || null,
  };
  return mapOwner(await api.post<any>("/owners", payload));
}

export async function updateOwner(id: string, data: Partial<PetOwner>): Promise<PetOwner> {
  const payload: any = {};
  if (data.full_name !== undefined) payload.name = data.full_name;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.email !== undefined) payload.email = data.email;
  if (data.address !== undefined) payload.address = data.address;
  return mapOwner(await api.put<any>(`/owners/${id}`, payload));
}

export async function deleteOwner(id: string): Promise<void> {
  await api.delete(`/owners/${id}`);
}

// ─── Pets ─────────────────────────────────────────────────────────────────────

export async function getPets(params?: {
  search?: string;
  owner_id?: string;
  species?: string;
  health_status?: string;
  skip?: number;
  limit?: number;
}) {
  const res = await api.get<{ data: any[]; total: number }>(`/pets${buildQuery(params)}`);
  return { data: (res.data || []).map(mapPet), total: res.total ?? 0 };
}

export async function getPet(id: string): Promise<Pet> {
  return mapPet(await api.get<any>(`/pets/${id}`));
}

export async function createPet(data: Partial<Pet>): Promise<Pet> {
  const payload: any = {
    owner_id: data.owner_id || "",
    name: data.name || "",
    species: data.species || "Dog",
    breed: data.breed || null,
    gender: data.gender ? data.gender.toLowerCase() : null,
    date_of_birth: data.date_of_birth || null,
    weight_kg: data.weight ?? null,
    microchip_id: data.microchip_id || null,
    health_status: (data as any).status || "healthy",
    photo_url: (data as any).photo_url || null,
  };
  return mapPet(await api.post<any>("/pets", payload));
}

export async function updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.species !== undefined) payload.species = data.species;
  if (data.breed !== undefined) payload.breed = data.breed;
  if (data.gender !== undefined) payload.gender = data.gender ? data.gender.toLowerCase() : null;
  if (data.date_of_birth !== undefined) payload.date_of_birth = data.date_of_birth;
  if (data.weight !== undefined) payload.weight_kg = data.weight;
  if (data.microchip_id !== undefined) payload.microchip_id = data.microchip_id;
  if ((data as any).status !== undefined) payload.health_status = (data as any).status;
  if (data.owner_id !== undefined) payload.owner_id = data.owner_id;
  if ((data as any).photo_url !== undefined) payload.photo_url = (data as any).photo_url;
  return mapPet(await api.put<any>(`/pets/${id}`, payload));
}

export async function deletePet(id: string): Promise<void> {
  await api.delete(`/pets/${id}`);
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function getAppointments(params?: {
  date_from?: string;
  date_to?: string;
  status?: string;
  pet_id?: string;
  vet_id?: string;
  skip?: number;
  limit?: number;
}) {
  const res = await api.get<{ data: any[]; total: number }>(
    `/appointments${buildQuery(params)}`
  );
  return { data: (res.data || []).map(mapAppointment), total: res.total ?? 0 };
}

export async function getAppointment(id: string): Promise<Appointment> {
  return mapAppointment(await api.get<any>(`/appointments/${id}`));
}

export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  // Resolve owner_id from pet if not provided
  let ownerId = (data as any).owner_id;
  if (!ownerId && data.pet_id) {
    const pet = await api.get<any>(`/pets/${data.pet_id}`);
    ownerId = pet?.owner_id;
  }
  const status = data.status === "no-show" ? "no_show" : data.status || "scheduled";
  const payload: any = {
    pet_id: data.pet_id || "",
    owner_id: ownerId || "",
    vet_id: data.vet_id || null,
    appointment_date: data.date || "",
    appointment_time: data.time || "",
    reason: data.reason || "",
    notes: data.notes || null,
    status,
  };
  return mapAppointment(await api.post<any>("/appointments", payload));
}

export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
): Promise<Appointment> {
  const payload: any = {};
  if (data.date !== undefined) payload.appointment_date = data.date;
  if (data.time !== undefined) payload.appointment_time = data.time;
  if (data.pet_id !== undefined) payload.pet_id = data.pet_id;
  if (data.vet_id !== undefined) payload.vet_id = data.vet_id;
  if (data.reason !== undefined) payload.reason = data.reason;
  if (data.notes !== undefined) payload.notes = data.notes;
  if (data.status !== undefined)
    payload.status = data.status === "no-show" ? "no_show" : data.status;
  if ((data as any).owner_id !== undefined) payload.owner_id = (data as any).owner_id;
  return mapAppointment(await api.put<any>(`/appointments/${id}`, payload));
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function getInventory(params?: {
  item_type?: string;
  search?: string;
  low_stock_only?: boolean;
  skip?: number;
  limit?: number;
}) {
  const res = await api.get<{ data: any[]; total: number }>(
    `/inventory${buildQuery(params)}`
  );
  return { data: (res.data || []).map(mapInventoryItem), total: res.total ?? 0 };
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  return mapInventoryItem(await api.get<any>(`/inventory/${id}`));
}

export async function createInventoryItem(
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  const payload: any = {
    item_name: data.name || "",
    item_type: data.category || "Other",
    quantity: data.quantity ?? 0,
    low_stock_threshold: data.reorder_level ?? 10,
    unit: (data as any).unit || null,
    cost_per_unit: data.unit_price ?? null,
    supplier: data.supplier || null,
  };
  return mapInventoryItem(await api.post<any>("/inventory", payload));
}

export async function updateInventoryItem(
  id: string,
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  const payload: any = {};
  if (data.name !== undefined) payload.item_name = data.name;
  if (data.category !== undefined) payload.item_type = data.category;
  if (data.quantity !== undefined) payload.quantity = data.quantity;
  if (data.reorder_level !== undefined) payload.low_stock_threshold = data.reorder_level;
  if (data.unit_price !== undefined) payload.cost_per_unit = data.unit_price;
  if (data.supplier !== undefined) payload.supplier = data.supplier;
  return mapInventoryItem(await api.put<any>(`/inventory/${id}`, payload));
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await api.delete(`/inventory/${id}`);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(params?: { skip?: number; limit?: number }) {
  const res = await api.get<{ data: any[]; total: number }>(
    `/invoices${buildQuery(params)}`
  );
  return { data: (res.data || []).map(mapInvoice), total: res.total ?? 0 };
}

export async function getInvoice(id: string): Promise<Invoice> {
  return mapInvoice(await api.get<any>(`/invoices/${id}`));
}

export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  const payload: any = {
    owner_id: data.owner_id || "",
    pet_id: data.pet_id || "",
    amount: data.subtotal ?? data.total ?? 0,
    tax_amount: 0,
    total_amount: data.total ?? 0,
    due_date: data.due_date || null,
    issue_date: new Date().toISOString().split("T")[0],
    notes: (data as any).notes || null,
    status: data.status || "pending",
  };
  return mapInvoice(await api.post<any>("/invoices", payload));
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  const payload: any = {};
  if (data.status !== undefined) payload.status = data.status;
  if (data.total !== undefined) payload.total_amount = data.total;
  if (data.subtotal !== undefined) payload.amount = data.subtotal;
  if (data.due_date !== undefined) payload.due_date = data.due_date;
  if ((data as any).notes !== undefined) payload.notes = (data as any).notes;
  return mapInvoice(await api.put<any>(`/invoices/${id}`, payload));
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/invoices/${id}`);
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export async function getStaff(params?: { skip?: number; limit?: number }) {
  const res = await api.get<{ data: any[]; total: number }>(`/staff${buildQuery(params)}`);
  return { data: (res.data || []).map(mapUser), total: res.total ?? 0 };
}

export async function getStaffMember(id: string): Promise<User> {
  return mapUser(await api.get<any>(`/staff/${id}`));
}

export async function createStaff(data: Partial<User>): Promise<User> {
  const payload: any = {
    name: data.full_name || "",
    email: data.email || "",
    role: data.role || "staff",
    phone: data.phone || null,
    password: (data as any).password || `Mia${Date.now().toString(36)}!`,
  };
  return mapUser(await api.post<any>("/staff", payload));
}

export async function updateStaff(id: string, data: Partial<User>): Promise<User> {
  const payload: any = {};
  if (data.full_name !== undefined) payload.name = data.full_name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.role !== undefined) payload.role = data.role;
  if (data.is_active !== undefined) payload.is_active = data.is_active;
  return mapUser(await api.put<any>(`/staff/${id}`, payload));
}

export async function deleteStaff(id: string): Promise<void> {
  await api.delete(`/staff/${id}`);
}

// ─── Services / Vaccinations / Pet Documents ─────────────────────────────────
// These resources do not yet have backend routes. They return empty results so
// pages render gracefully; mutations throw a clear "not implemented" error.

const NOT_IMPLEMENTED = new Error("This feature is not yet available on the backend.");

// ─── Services catalog ─────────────────────────────────────────────────────────

function mapService(s: any) {
  return {
    id: s.id,
    clinic_id: s.clinic_id,
    name: s.name,
    category: s.category,
    price: Number(s.price ?? 0),
    description: s.description || "",
    is_active: !!s.is_active,
    created_at: s.created_at,
    updated_at: s.updated_at,
  };
}

export async function getServices(): Promise<any[]> {
  const res = await api.get<{ data: any[]; total: number }>("/services?limit=200");
  return (res.data || []).map(mapService);
}

export async function createService(data: any): Promise<any> {
  const payload = {
    name: data.name,
    category: data.category,
    price: Number(data.price ?? 0),
    description: data.description ?? null,
    is_active: data.is_active ?? true,
  };
  return mapService(await api.post<any>("/services", payload));
}

export async function updateService(id: string, data: any): Promise<any> {
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.category !== undefined) payload.category = data.category;
  if (data.price !== undefined) payload.price = Number(data.price);
  if (data.description !== undefined) payload.description = data.description;
  if (data.is_active !== undefined) payload.is_active = data.is_active;
  return mapService(await api.put<any>(`/services/${id}`, payload));
}

export async function deleteService(id: string): Promise<void> {
  await api.delete(`/services/${id}`);
}

// ─── Medical Records ──────────────────────────────────────────────────────────

export function mapMedicalRecord(r: any): MedicalRecord {
  let notesObj: any = {};
  if (r.notes && typeof r.notes === "string") {
    try {
      notesObj = JSON.parse(r.notes);
    } catch {
      /* ignore */
    }
  } else if (r.notes && typeof r.notes === "object") {
    notesObj = r.notes;
  }
  return {
    id: r.id,
    pet_id: r.pet_id,
    vet_id: r.vet_id,
    appointment_id: r.appointment_id,
    visit_date: r.record_date || r.visit_date || "",
    chief_complaint: notesObj.chief_complaint || r.chief_complaint || r.diagnosis || "",
    symptoms: notesObj.symptoms || r.symptoms || "",
    duration_onset: notesObj.duration_onset || r.duration_onset || "",
    appetite_behavior: notesObj.appetite_behavior || r.appetite_behavior || "",
    prior_treatments: notesObj.prior_treatments || r.prior_treatments || "",
    weight_kg: notesObj.vitals?.weight_kg ?? r.weight_kg,
    temperature_f: notesObj.vitals?.temperature_f ?? r.temperature_f,
    heart_rate_bpm: notesObj.vitals?.heart_rate_bpm ?? r.heart_rate_bpm,
    respiratory_rate: notesObj.vitals?.respiratory_rate ?? r.respiratory_rate,
    body_condition_score: notesObj.vitals?.body_condition_score ?? r.body_condition_score,
    physical_exam_findings:
      notesObj.physical_exam_findings || r.physical_exam_findings || "",
    diagnostic_results: notesObj.diagnostic_results || r.diagnostic_results || "",
    primary_diagnosis:
      r.primary_diagnosis || notesObj.primary_diagnosis || r.diagnosis || "",
    differential_diagnoses:
      notesObj.differential_diagnoses || r.differential_diagnoses || "",
    severity: r.severity || notesObj.severity || "mild",
    prescriptions: (() => { const raw = notesObj.prescriptions || r.prescriptions_json || r.prescriptions || []; if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } } return Array.isArray(raw) ? raw : []; })(),
    procedures_performed: notesObj.procedures_performed || r.procedures_performed || r.treatment || "",
    follow_up_instructions: notesObj.follow_up_instructions || r.follow_up_instructions || "",
    next_appointment_recommendation: notesObj.next_appointment_recommendation || r.next_appointment_recommendation || "",
    follow_up: notesObj.follow_up || r.follow_up_json || r.follow_up,
    created_at: r.created_at || "",
    updated_at: r.updated_at || "",
  };
}

export async function getMedicalRecords(params?: {
  pet_id?: string;
}): Promise<MedicalRecord[]> {
  const res = await api.get<{ data: any[] }>(
    `/medical-records${buildQuery(params)}`
  );
  return (res.data || []).map(mapMedicalRecord);
}

export async function createMedicalRecord(data: any): Promise<any> {
  return api.post<any>("/medical-records", data);
}

export async function updateMedicalRecord(id: string, data: any): Promise<any> {
  return mapMedicalRecord(await api.put<any>(`/medical-records/${id}`, data));
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  await api.delete(`/medical-records/${id}`);
}

// ─── Vaccinations ─────────────────────────────────────────────────────────────

export async function getVaccinations(_params?: { pet_id?: string }): Promise<any[]> {
  return [];
}
export async function createVaccination(_data: any): Promise<any> {
  throw NOT_IMPLEMENTED;
}
export async function updateVaccination(_id: string, _data: any): Promise<any> {
  throw NOT_IMPLEMENTED;
}
export async function deleteVaccination(_id: string): Promise<void> {
  throw NOT_IMPLEMENTED;
}

// ─── Pet Documents ────────────────────────────────────────────────────────────

// Temporary photo upload: reads the file as a base64 data URL so we can persist
// it directly on the pet record (no Supabase Storage bucket required yet).
// Cap at ~2 MB to keep row size sane.
export async function uploadPetFile(file: File, _petId: string): Promise<string> {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Photo too large (max 2 MB). Please choose a smaller image.");
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export async function getPetDocuments(_petId: string): Promise<PetDocument[]> {
  return [];
}

export async function createPetDocument(_data: Partial<PetDocument>): Promise<PetDocument> {
  throw NOT_IMPLEMENTED;
}

export async function deletePetDocument(_id: string): Promise<void> {
  throw NOT_IMPLEMENTED;
}
