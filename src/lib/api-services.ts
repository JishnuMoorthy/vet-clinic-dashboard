/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  DashboardData,
  PetOwner,
  Pet,
  Appointment,
  InventoryItem,
  Invoice,
  User,
} from "@/types/api";
import { api } from "@/lib/api";
import {
  mockOwners,
  mockPets,
  mockAppointments,
  mockInvoices,
  mockInventory,
  mockUsers,
  mockDashboardData,
} from "@/lib/mock-data";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isNetworkError(err: any): boolean {
  return err.message === "Failed to fetch" || err.message === "Load failed";
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapUser(u: any): User {
  return {
    ...u,
    full_name: u.name || u.full_name || "",
  };
}

export function mapOwner(o: any): PetOwner {
  return {
    ...o,
    full_name: o.name || o.full_name || "",
    pets_count: o.pet_count ?? o.pets_count,
  };
}

export function mapPet(p: any): Pet {
  return {
    ...p,
    status: p.health_status || p.status || "active",
    weight: p.weight_kg ?? p.weight,
    owner: p.owner ? mapOwner(p.owner) : undefined,
    vet: p.vet ? mapUser(p.vet) : undefined,
  };
}

export function mapAppointment(a: any): Appointment {
  return {
    ...a,
    date: a.appointment_date || a.date || "",
    time: a.appointment_time || a.time || "",
    pet: a.pet ? mapPet(a.pet) : undefined,
    vet: a.vet ? mapUser(a.vet) : undefined,
  };
}

export function mapInventoryItem(i: any): InventoryItem {
  const qty: number = i.quantity ?? 0;
  const reorder: number = i.reorder_level ?? 0;
  let status: "ok" | "low" | "out" = qty === 0 ? "out" : qty <= reorder ? "low" : "ok";
  if (i.is_low_stock === true && status === "ok") status = "low";
  return {
    ...i,
    category: i.item_type || i.category || "Other",
    status,
  };
}

export function mapInvoice(inv: any): Invoice {
  return {
    ...inv,
    pet: inv.pet ? mapPet(inv.pet) : undefined,
    owner: inv.owner ? mapOwner(inv.owner) : undefined,
  };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardData> {
  try {
    const [stats, appointmentsRes, invoicesRes, inventoryRes] = await Promise.all([
      api.get<Record<string, number>>("/dashboard/stats"),
      api.get<{ data: any[]; total: number }>("/appointments?skip=0&limit=5"),
      api.get<{ data: any[]; total: number }>("/invoices?skip=0&limit=5"),
      api.get<{ data: any[]; total: number }>("/inventory?low_stock_only=true&skip=0&limit=10"),
    ]);
    return {
      todays_appointments: stats.total_appointments ?? stats.todays_appointments ?? 0,
      pending_invoices: stats.pending_invoices ?? 0,
      total_pets: stats.total_pets ?? 0,
      total_owners: stats.total_owners ?? 0,
      upcoming_appointments: appointmentsRes.data.map(mapAppointment),
      recent_invoices: invoicesRes.data.map(mapInvoice),
      low_stock_items: inventoryRes.data.map(mapInventoryItem),
    };
  } catch (err: any) {
    if (isNetworkError(err)) {
      return mockDashboardData;
    }
    throw err;
  }
}

// ─── Owners ──────────────────────────────────────────────────────────────────

export async function getOwners(params?: { search?: string; skip?: number; limit?: number }) {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.skip != null) query.set("skip", String(params.skip));
    if (params?.limit != null) query.set("limit", String(params.limit));
    const qs = query.toString();
    const res = await api.get<{ data: any[]; total: number }>(`/owners${qs ? `?${qs}` : ""}`);
    return { data: res.data.map(mapOwner), total: res.total };
  } catch (err: any) {
    if (isNetworkError(err)) {
      let filtered = [...mockOwners];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.full_name.toLowerCase().includes(q) ||
            o.phone.includes(q) ||
            o.email?.toLowerCase().includes(q)
        );
      }
      const skip = params?.skip ?? 0;
      const limit = params?.limit ?? filtered.length;
      return { data: filtered.slice(skip, skip + limit), total: filtered.length };
    }
    throw err;
  }
}

export async function getOwner(id: string): Promise<PetOwner> {
  try {
    const o = await api.get<any>(`/owners/${id}`);
    return mapOwner(o);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const found = mockOwners.find((o) => o.id === id);
      if (!found) throw new Error("Owner not found");
      return found;
    }
    throw err;
  }
}

export async function createOwner(data: Partial<PetOwner>): Promise<PetOwner> {
  try {
    const o = await api.post<any>("/owners", data);
    return mapOwner(o);
  } catch (err: any) {
    if (isNetworkError(err)) {
      return {
        id: `owner-${Date.now()}`,
        full_name: data.full_name || "",
        phone: data.phone || "",
        email: data.email,
        address: data.address,
        pets_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw err;
  }
}

export async function updateOwner(id: string, data: Partial<PetOwner>): Promise<PetOwner> {
  try {
    const o = await api.put<any>(`/owners/${id}`, data);
    return mapOwner(o);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const existing = mockOwners.find((o) => o.id === id);
      return {
        ...(existing || {}),
        ...data,
        id,
        updated_at: new Date().toISOString(),
      } as PetOwner;
    }
    throw err;
  }
}

export async function deleteOwner(id: string): Promise<void> {
  try {
    await api.delete(`/owners/${id}`);
  } catch (err: any) {
    if (isNetworkError(err)) return;
    throw err;
  }
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
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.owner_id) query.set("owner_id", params.owner_id);
    if (params?.species) query.set("species", params.species);
    if (params?.health_status) query.set("health_status", params.health_status);
    if (params?.skip != null) query.set("skip", String(params.skip));
    if (params?.limit != null) query.set("limit", String(params.limit));
    const qs = query.toString();
    const res = await api.get<{ data: any[]; total: number }>(`/pets${qs ? `?${qs}` : ""}`);
    return { data: res.data.map(mapPet), total: res.total };
  } catch (err: any) {
    if (isNetworkError(err)) {
      let filtered = [...mockPets];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.breed?.toLowerCase().includes(q) ||
            p.species.toLowerCase().includes(q) ||
            p.owner?.full_name.toLowerCase().includes(q)
        );
      }
      if (params?.owner_id) {
        filtered = filtered.filter((p) => p.owner_id === params.owner_id);
      }
      if (params?.species) {
        filtered = filtered.filter((p) => p.species.toLowerCase() === params.species!.toLowerCase());
      }
      const skip = params?.skip ?? 0;
      const limit = params?.limit ?? filtered.length;
      return { data: filtered.slice(skip, skip + limit), total: filtered.length };
    }
    throw err;
  }
}

export async function getPet(id: string): Promise<Pet> {
  try {
    const p = await api.get<any>(`/pets/${id}`);
    return mapPet(p);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const found = mockPets.find((p) => p.id === id);
      if (!found) throw new Error("Pet not found");
      return found;
    }
    throw err;
  }
}

export async function createPet(data: Partial<Pet>): Promise<Pet> {
  try {
    const p = await api.post<any>("/pets", data);
    return mapPet(p);
  } catch (err: any) {
    if (isNetworkError(err)) {
      return {
        id: `pet-${Date.now()}`,
        name: data.name || "",
        species: data.species || "Dog",
        breed: data.breed,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        weight: data.weight,
        microchip_id: data.microchip_id,
        notes: data.notes,
        status: "active",
        owner_id: data.owner_id || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw err;
  }
}

export async function updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
  try {
    const p = await api.put<any>(`/pets/${id}`, data);
    return mapPet(p);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const existing = mockPets.find((p) => p.id === id);
      return {
        ...(existing || {}),
        ...data,
        id,
        updated_at: new Date().toISOString(),
      } as Pet;
    }
    throw err;
  }
}

export async function deletePet(id: string): Promise<void> {
  try {
    await api.delete(`/pets/${id}`);
  } catch (err: any) {
    if (isNetworkError(err)) return;
    throw err;
  }
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function getAppointments(params?: {
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    if (params?.skip != null) query.set("skip", String(params.skip));
    if (params?.limit != null) query.set("limit", String(params.limit));
    const qs = query.toString();
    const res = await api.get<{ data: any[]; total: number }>(`/appointments${qs ? `?${qs}` : ""}`);
    return { data: res.data.map(mapAppointment), total: res.total };
  } catch (err: any) {
    if (isNetworkError(err)) {
      const filtered = [...mockAppointments];
      return { data: filtered, total: filtered.length };
    }
    throw err;
  }
}

export async function getAppointment(id: string): Promise<Appointment> {
  try {
    const a = await api.get<any>(`/appointments/${id}`);
    return mapAppointment(a);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const found = mockAppointments.find((a) => a.id === id);
      if (!found) throw new Error("Appointment not found");
      return found;
    }
    throw err;
  }
}

export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  try {
    const a = await api.post<any>("/appointments", {
      ...data,
      appointment_date: data.date,
      appointment_time: data.time,
    });
    return mapAppointment(a);
  } catch (err: any) {
    if (isNetworkError(err)) {
      return {
        id: `apt-${Date.now()}`,
        pet_id: data.pet_id || "",
        vet_id: data.vet_id || "",
        date: data.date || "",
        time: data.time || "",
        reason: data.reason || "",
        notes: data.notes,
        status: "scheduled",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw err;
  }
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
  try {
    const a = await api.put<any>(`/appointments/${id}`, {
      ...data,
      appointment_date: data.date,
      appointment_time: data.time,
    });
    return mapAppointment(a);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const existing = mockAppointments.find((a) => a.id === id);
      return {
        ...(existing || {}),
        ...data,
        id,
        updated_at: new Date().toISOString(),
      } as Appointment;
    }
    throw err;
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  try {
    await api.delete(`/appointments/${id}`);
  } catch (err: any) {
    if (isNetworkError(err)) return;
    throw err;
  }
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function getInventory(params?: {
  item_type?: string;
  search?: string;
  low_stock_only?: boolean;
  skip?: number;
  limit?: number;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.item_type) query.set("item_type", params.item_type);
    if (params?.search) query.set("search", params.search);
    if (params?.low_stock_only) query.set("low_stock_only", "true");
    if (params?.skip != null) query.set("skip", String(params.skip));
    if (params?.limit != null) query.set("limit", String(params.limit));
    const qs = query.toString();
    const res = await api.get<{ data: any[]; total: number }>(`/inventory${qs ? `?${qs}` : ""}`);
    return { data: res.data.map(mapInventoryItem), total: res.total };
  } catch (err: any) {
    if (isNetworkError(err)) {
      let filtered = [...mockInventory];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
        );
      }
      if (params?.low_stock_only) {
        filtered = filtered.filter((i) => i.status === "low" || i.status === "out");
      }
      const skip = params?.skip ?? 0;
      const limit = params?.limit ?? filtered.length;
      return { data: filtered.slice(skip, skip + limit), total: filtered.length };
    }
    throw err;
  }
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  try {
    const i = await api.get<any>(`/inventory/${id}`);
    return mapInventoryItem(i);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const found = mockInventory.find((i) => i.id === id);
      if (!found) throw new Error("Inventory item not found");
      return found;
    }
    throw err;
  }
}

export async function createInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
  try {
    const i = await api.post<any>("/inventory", { ...data, item_type: data.category });
    return mapInventoryItem(i);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const qty = data.quantity ?? 0;
      const reorder = data.reorder_level ?? 0;
      const status: "ok" | "low" | "out" = qty === 0 ? "out" : qty <= reorder ? "low" : "ok";
      return {
        id: `item-${Date.now()}`,
        name: data.name || "",
        category: data.category || "Other",
        quantity: qty,
        reorder_level: reorder,
        unit_price: data.unit_price,
        supplier: data.supplier,
        expiry_date: data.expiry_date,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw err;
  }
}

export async function updateInventoryItem(
  id: string,
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  try {
    const i = await api.put<any>(`/inventory/${id}`, { ...data, item_type: data.category });
    return mapInventoryItem(i);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const existing = mockInventory.find((i) => i.id === id);
      const merged = { ...(existing || {}), ...data, id };
      const qty = merged.quantity ?? 0;
      const reorder = merged.reorder_level ?? 0;
      merged.status = qty === 0 ? "out" : qty <= reorder ? "low" : "ok";
      merged.updated_at = new Date().toISOString();
      return merged as InventoryItem;
    }
    throw err;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    await api.delete(`/inventory/${id}`);
  } catch (err: any) {
    if (isNetworkError(err)) return;
    throw err;
  }
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(params?: { skip?: number; limit?: number }) {
  try {
    const query = new URLSearchParams();
    if (params?.skip != null) query.set("skip", String(params.skip));
    if (params?.limit != null) query.set("limit", String(params.limit));
    const qs = query.toString();
    const res = await api.get<{ data: any[]; total: number }>(`/invoices${qs ? `?${qs}` : ""}`);
    return { data: res.data.map(mapInvoice), total: res.total };
  } catch (err: any) {
    if (isNetworkError(err)) {
      return { data: [...mockInvoices], total: mockInvoices.length };
    }
    throw err;
  }
}

export async function getInvoice(id: string): Promise<Invoice> {
  try {
    const inv = await api.get<any>(`/invoices/${id}`);
    return mapInvoice(inv);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const found = mockInvoices.find((i) => i.id === id);
      if (!found) throw new Error("Invoice not found");
      return found;
    }
    throw err;
  }
}

export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  try {
    const inv = await api.post<any>("/invoices", data);
    return mapInvoice(inv);
  } catch (err: any) {
    if (isNetworkError(err)) {
      return {
        id: `inv-${Date.now()}`,
        invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        pet_id: data.pet_id || "",
        owner_id: data.owner_id || "",
        line_items: data.line_items || [],
        subtotal: data.subtotal || 0,
        discount: data.discount,
        total: data.total || 0,
        status: "pending",
        due_date: data.due_date || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw err;
  }
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  try {
    const inv = await api.put<any>(`/invoices/${id}`, data);
    return mapInvoice(inv);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const existing = mockInvoices.find((i) => i.id === id);
      return {
        ...(existing || {}),
        ...data,
        id,
        updated_at: new Date().toISOString(),
      } as Invoice;
    }
    throw err;
  }
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export async function getStaff(params?: { skip?: number; limit?: number }) {
  try {
    const query = new URLSearchParams();
    if (params?.skip != null) query.set("skip", String(params.skip));
    if (params?.limit != null) query.set("limit", String(params.limit));
    const qs = query.toString();
    const res = await api.get<{ data: any[]; total: number }>(`/staff${qs ? `?${qs}` : ""}`);
    return { data: res.data.map(mapUser), total: res.total };
  } catch (err: any) {
    if (isNetworkError(err)) {
      return { data: [...mockUsers], total: mockUsers.length };
    }
    throw err;
  }
}

export async function getStaffMember(id: string): Promise<User> {
  try {
    const u = await api.get<any>(`/staff/${id}`);
    return mapUser(u);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const found = mockUsers.find((u) => u.id === id);
      if (!found) throw new Error("Staff member not found");
      return found;
    }
    throw err;
  }
}

export async function createStaff(data: Partial<User>): Promise<User> {
  try {
    const u = await api.post<any>("/staff", data);
    return mapUser(u);
  } catch (err: any) {
    if (isNetworkError(err)) {
      return {
        id: `staff-${Date.now()}`,
        full_name: data.full_name || "",
        email: data.email || "",
        role: data.role || "staff",
        phone: data.phone,
        specialties: data.specialties,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw err;
  }
}

export async function updateStaff(id: string, data: Partial<User>): Promise<User> {
  try {
    const u = await api.put<any>(`/staff/${id}`, data);
    return mapUser(u);
  } catch (err: any) {
    if (isNetworkError(err)) {
      const existing = mockUsers.find((u) => u.id === id);
      return {
        ...(existing || {}),
        ...data,
        id,
        updated_at: new Date().toISOString(),
      } as User;
    }
    throw err;
  }
}

export async function deleteStaff(id: string): Promise<void> {
  try {
    await api.delete(`/staff/${id}`);
  } catch (err: any) {
    if (isNetworkError(err)) return;
    throw err;
  }
}
