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
} from "@/types/api";
import { supabase, getClinicId } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import {
  mockOwners,
  mockPets,
  mockAppointments,
  mockInvoices,
  mockInventory,
  mockUsers,
  mockDashboardData,
} from "@/lib/mock-data";

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapUser(u: any): User {
  return {
    ...u,
    full_name: u.name || u.full_name || "",
    role: (u.role || "staff") as UserRole,
  };
}

export function mapOwner(o: any): PetOwner {
  return {
    ...o,
    full_name: o.name || o.full_name || "",
    pets_count: o.pet_count ?? o.pets_count ?? 0,
  };
}

export function mapPet(p: any): Pet {
  return {
    ...p,
    status: p.health_status || p.status || "active",
    weight: p.weight_kg ?? p.weight,
    owner: p.pet_owners ? mapOwner(p.pet_owners) : p.owner ? mapOwner(p.owner) : undefined,
    vet: p.vet ? mapUser(p.vet) : undefined,
  };
}

export function mapAppointment(a: any): Appointment {
  return {
    ...a,
    date: a.appointment_date || a.date || "",
    time: a.appointment_time || a.time || "",
    pet: a.pets ? mapPet(a.pets) : a.pet ? mapPet(a.pet) : undefined,
    vet: a.users ? mapUser(a.users) : a.vet ? mapUser(a.vet) : undefined,
  };
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
  return {
    ...inv,
    pet: inv.pets ? mapPet(inv.pets) : inv.pet ? mapPet(inv.pet) : undefined,
    owner: inv.pet_owners ? mapOwner(inv.pet_owners) : inv.owner ? mapOwner(inv.owner) : undefined,
    line_items: inv.line_items || [],
    subtotal: inv.amount ?? inv.subtotal ?? 0,
    total: inv.total_amount ?? inv.total ?? 0,
  };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardData> {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    const today = new Date().toISOString().split("T")[0];

    const [
      { count: todayAppts },
      { count: pendingInv },
      { count: totalPets },
      { count: totalOwners },
      { data: recentAppts },
      { data: recentInvoices },
      { data: lowStockItems },
    ] = await Promise.all([
      supabase.from("appointments").select("*", { count: "exact", head: true })
        .eq("clinic_id", clinicId).eq("is_deleted", false).eq("appointment_date", today),
      supabase.from("invoices").select("*", { count: "exact", head: true })
        .eq("clinic_id", clinicId).eq("is_deleted", false).eq("status", "pending"),
      supabase.from("pets").select("*", { count: "exact", head: true })
        .eq("clinic_id", clinicId).eq("is_deleted", false),
      supabase.from("pet_owners").select("*", { count: "exact", head: true })
        .eq("clinic_id", clinicId).eq("is_deleted", false),
      supabase.from("appointments").select("*, pets(*), users!appointments_vet_id_fkey(*)")
        .eq("clinic_id", clinicId).eq("is_deleted", false)
        .gte("appointment_date", today).order("appointment_date").order("appointment_time").limit(5),
      supabase.from("invoices").select("*, pets(*), pet_owners!invoices_owner_id_fkey(*)")
        .eq("clinic_id", clinicId).eq("is_deleted", false)
        .order("created_at", { ascending: false }).limit(5),
      supabase.from("inventory").select("*")
        .eq("clinic_id", clinicId).eq("is_deleted", false)
        .order("quantity", { ascending: true })
        .limit(20),
    ]);

    return {
      todays_appointments: todayAppts ?? 0,
      pending_invoices: pendingInv ?? 0,
      total_pets: totalPets ?? 0,
      total_owners: totalOwners ?? 0,
      upcoming_appointments: (recentAppts || []).map(mapAppointment),
      recent_invoices: (recentInvoices || []).map(mapInvoice),
      low_stock_items: (lowStockItems || []).map(mapInventoryItem),
    };
  } catch (err) {
    console.warn("[Dashboard] Supabase failed, using mock data", err);
    return mockDashboardData;
  }
}

// ─── Owners ──────────────────────────────────────────────────────────────────

export async function getOwners(params?: { search?: string; skip?: number; limit?: number }) {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    let query = supabase.from("pet_owners").select("*", { count: "exact" })
      .eq("clinic_id", clinicId).eq("is_deleted", false);

    if (params?.search) {
      const s = `%${params.search}%`;
      query = query.or(`name.ilike.${s},phone.ilike.${s},email.ilike.${s}`);
    }

    query = query.order("created_at", { ascending: false });

    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? 50;
    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // Count pets per owner
    const owners = (data || []).map(mapOwner);
    if (owners.length > 0) {
      const ownerIds = owners.map((o) => o.id);
      const { data: petCounts } = await supabase
        .from("pets")
        .select("owner_id")
        .eq("clinic_id", clinicId)
        .eq("is_deleted", false)
        .in("owner_id", ownerIds);
      
      if (petCounts) {
        const countMap: Record<string, number> = {};
        petCounts.forEach((p) => {
          countMap[p.owner_id] = (countMap[p.owner_id] || 0) + 1;
        });
        owners.forEach((o) => { o.pets_count = countMap[o.id] || 0; });
      }
    }

    return { data: owners, total: count ?? 0 };
  } catch (err) {
    console.warn("[Owners] Supabase failed, using mock data", err);
    let filtered = [...mockOwners];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) => o.full_name.toLowerCase().includes(q) || o.phone.includes(q) || o.email?.toLowerCase().includes(q)
      );
    }
    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? filtered.length;
    return { data: filtered.slice(skip, skip + limit), total: filtered.length };
  }
}

export async function getOwner(id: string): Promise<PetOwner> {
  try {
    const clinicId = getClinicId();
    const { data, error } = await supabase.from("pet_owners").select("*")
      .eq("id", id).eq("clinic_id", clinicId).eq("is_deleted", false).single();
    if (error) throw error;

    const owner = mapOwner(data);
    // Count pets
    const { count } = await supabase.from("pets").select("*", { count: "exact", head: true })
      .eq("owner_id", id).eq("clinic_id", clinicId).eq("is_deleted", false);
    owner.pets_count = count ?? 0;
    return owner;
  } catch (err) {
    console.warn("[Owner] Supabase failed, using mock data", err);
    const found = mockOwners.find((o) => o.id === id);
    if (!found) throw new Error("Owner not found");
    return found;
  }
}

export async function createOwner(data: Partial<PetOwner>): Promise<PetOwner> {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");
    const { data: row, error } = await supabase.from("pet_owners").insert({
      clinic_id: clinicId,
      name: data.full_name || "",
      phone: data.phone || "",
      email: data.email || null,
      address: data.address || null,
    }).select().single();
    if (error) throw error;
    return mapOwner(row);
  } catch (err) {
    console.warn("[CreateOwner] Supabase failed, using mock", err);
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
}

export async function updateOwner(id: string, data: Partial<PetOwner>): Promise<PetOwner> {
  try {
    const updateData: any = {};
    if (data.full_name !== undefined) updateData.name = data.full_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;

    const { data: row, error } = await supabase.from("pet_owners")
      .update(updateData).eq("id", id).select().single();
    if (error) throw error;
    return mapOwner(row);
  } catch (err) {
    console.warn("[UpdateOwner] Supabase failed, using mock", err);
    const existing = mockOwners.find((o) => o.id === id);
    return { ...(existing || {}), ...data, id, updated_at: new Date().toISOString() } as PetOwner;
  }
}

export async function deleteOwner(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("pet_owners")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("[DeleteOwner] Supabase failed", err);
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
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    let query = supabase.from("pets").select("*, pet_owners!pets_owner_id_fkey(*)", { count: "exact" })
      .eq("clinic_id", clinicId).eq("is_deleted", false);

    if (params?.search) {
      const s = `%${params.search}%`;
      query = query.or(`name.ilike.${s},breed.ilike.${s},species.ilike.${s}`);
    }
    if (params?.owner_id) query = query.eq("owner_id", params.owner_id);
    if (params?.species) query = query.eq("species", params.species);
    if (params?.health_status) query = query.eq("health_status", params.health_status);

    query = query.order("created_at", { ascending: false });
    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? 50;
    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapPet), total: count ?? 0 };
  } catch (err) {
    console.warn("[Pets] Supabase failed, using mock data", err);
    let filtered = [...mockPets];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q) || p.species.toLowerCase().includes(q) || p.owner?.full_name.toLowerCase().includes(q)
      );
    }
    if (params?.owner_id) filtered = filtered.filter((p) => p.owner_id === params.owner_id);
    if (params?.species) filtered = filtered.filter((p) => p.species.toLowerCase() === params.species!.toLowerCase());
    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? filtered.length;
    return { data: filtered.slice(skip, skip + limit), total: filtered.length };
  }
}

export async function getPet(id: string): Promise<Pet> {
  try {
    const clinicId = getClinicId();
    const { data, error } = await supabase.from("pets")
      .select("*, pet_owners!pets_owner_id_fkey(*)")
      .eq("id", id).eq("clinic_id", clinicId).eq("is_deleted", false).single();
    if (error) throw error;
    return mapPet(data);
  } catch (err) {
    console.warn("[Pet] Supabase failed, using mock data", err);
    const found = mockPets.find((p) => p.id === id);
    if (!found) throw new Error("Pet not found");
    return found;
  }
}

export async function createPet(data: Partial<Pet>): Promise<Pet> {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");
    const { data: row, error } = await supabase.from("pets").insert({
      clinic_id: clinicId,
      name: data.name || "",
      species: data.species || "Dog",
      breed: data.breed || null,
      gender: data.gender ? data.gender.toLowerCase() : null,
      date_of_birth: data.date_of_birth || null,
      weight_kg: data.weight ?? null,
      microchip_id: data.microchip_id || null,
      health_status: data.status || "healthy",
      owner_id: data.owner_id || "",
    }).select().single();
    if (error) throw error;
    return mapPet(row);
  } catch (err) {
    console.warn("[CreatePet] Supabase failed, using mock", err);
    return {
      id: `pet-${Date.now()}`, name: data.name || "", species: data.species || "Dog",
      breed: data.breed, gender: data.gender, date_of_birth: data.date_of_birth,
      weight: data.weight, microchip_id: data.microchip_id, notes: data.notes,
      status: "active", owner_id: data.owner_id || "",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
  }
}

export async function updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.species !== undefined) updateData.species = data.species;
    if (data.breed !== undefined) updateData.breed = data.breed;
    if (data.gender !== undefined) updateData.gender = data.gender ? data.gender.toLowerCase() : null;
    if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth;
    if (data.weight !== undefined) updateData.weight_kg = data.weight;
    if (data.microchip_id !== undefined) updateData.microchip_id = data.microchip_id;
    if (data.status !== undefined) updateData.health_status = data.status;
    if (data.owner_id !== undefined) updateData.owner_id = data.owner_id;

    const { data: row, error } = await supabase.from("pets")
      .update(updateData).eq("id", id).select().single();
    if (error) throw error;
    return mapPet(row);
  } catch (err) {
    console.warn("[UpdatePet] Supabase failed, using mock", err);
    const existing = mockPets.find((p) => p.id === id);
    return { ...(existing || {}), ...data, id, updated_at: new Date().toISOString() } as Pet;
  }
}

export async function deletePet(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("pets")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("[DeletePet] Supabase failed", err);
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
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    let query = supabase.from("appointments")
      .select("*, pets(*), users!appointments_vet_id_fkey(*), pet_owners!appointments_owner_id_fkey(*)", { count: "exact" })
      .eq("clinic_id", clinicId).eq("is_deleted", false);

    if (params?.date_from) query = query.gte("appointment_date", params.date_from);
    if (params?.date_to) query = query.lte("appointment_date", params.date_to);

    query = query.order("appointment_date", { ascending: false }).order("appointment_time", { ascending: false });
    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? 50;
    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapAppointment), total: count ?? 0 };
  } catch (err) {
    console.warn("[Appointments] Supabase failed, using mock data", err);
    return { data: [...mockAppointments], total: mockAppointments.length };
  }
}

export async function getAppointment(id: string): Promise<Appointment> {
  try {
    const clinicId = getClinicId();
    const { data, error } = await supabase.from("appointments")
      .select("*, pets(*), users!appointments_vet_id_fkey(*), pet_owners!appointments_owner_id_fkey(*)")
      .eq("id", id).eq("clinic_id", clinicId).eq("is_deleted", false).single();
    if (error) throw error;
    return mapAppointment(data);
  } catch (err) {
    console.warn("[Appointment] Supabase failed, using mock data", err);
    const found = mockAppointments.find((a) => a.id === id);
    if (!found) throw new Error("Appointment not found");
    return found;
  }
}

export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    // We need owner_id. If not provided, look it up from the pet.
    let ownerId = (data as any).owner_id;
    if (!ownerId && data.pet_id) {
      const { data: pet } = await supabase.from("pets").select("owner_id").eq("id", data.pet_id).single();
      ownerId = pet?.owner_id;
    }

    const { data: row, error } = await supabase.from("appointments").insert({
      clinic_id: clinicId,
      pet_id: data.pet_id || "",
      owner_id: ownerId || "",
      vet_id: data.vet_id || null,
      appointment_date: data.date || "",
      appointment_time: data.time || "",
      reason: data.reason || "",
      notes: data.notes || null,
      status: data.status || "scheduled",
    }).select().single();
    if (error) throw error;
    return mapAppointment(row);
  } catch (err) {
    console.warn("[CreateAppointment] Supabase failed, using mock", err);
    return {
      id: `apt-${Date.now()}`, pet_id: data.pet_id || "", vet_id: data.vet_id || "",
      date: data.date || "", time: data.time || "", reason: data.reason || "",
      notes: data.notes, status: "scheduled",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
  }
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
  try {
    const updateData: any = {};
    if (data.date !== undefined) updateData.appointment_date = data.date;
    if (data.time !== undefined) updateData.appointment_time = data.time;
    if (data.pet_id !== undefined) updateData.pet_id = data.pet_id;
    if (data.vet_id !== undefined) updateData.vet_id = data.vet_id;
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;
    if ((data as any).owner_id !== undefined) updateData.owner_id = (data as any).owner_id;

    const { data: row, error } = await supabase.from("appointments")
      .update(updateData).eq("id", id).select().single();
    if (error) throw error;
    return mapAppointment(row);
  } catch (err) {
    console.warn("[UpdateAppointment] Supabase failed, using mock", err);
    const existing = mockAppointments.find((a) => a.id === id);
    return { ...(existing || {}), ...data, id, updated_at: new Date().toISOString() } as Appointment;
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("appointments")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("[DeleteAppointment] Supabase failed", err);
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
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    let query = supabase.from("inventory").select("*", { count: "exact" })
      .eq("clinic_id", clinicId).eq("is_deleted", false);

    if (params?.search) {
      const s = `%${params.search}%`;
      query = query.or(`item_name.ilike.${s},item_type.ilike.${s}`);
    }
    if (params?.item_type) query = query.eq("item_type", params.item_type);

    query = query.order("created_at", { ascending: false });
    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? 50;
    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    let items = (data || []).map(mapInventoryItem);
    if (params?.low_stock_only) {
      items = items.filter((i) => i.status === "low" || i.status === "out");
    }

    return { data: items, total: params?.low_stock_only ? items.length : (count ?? 0) };
  } catch (err) {
    console.warn("[Inventory] Supabase failed, using mock data", err);
    let filtered = [...mockInventory];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (params?.low_stock_only) filtered = filtered.filter((i) => i.status === "low" || i.status === "out");
    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? filtered.length;
    return { data: filtered.slice(skip, skip + limit), total: filtered.length };
  }
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  try {
    const clinicId = getClinicId();
    const { data, error } = await supabase.from("inventory").select("*")
      .eq("id", id).eq("clinic_id", clinicId).eq("is_deleted", false).single();
    if (error) throw error;
    return mapInventoryItem(data);
  } catch (err) {
    console.warn("[InventoryItem] Supabase failed, using mock data", err);
    const found = mockInventory.find((i) => i.id === id);
    if (!found) throw new Error("Inventory item not found");
    return found;
  }
}

export async function createInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");
    const { data: row, error } = await supabase.from("inventory").insert({
      clinic_id: clinicId,
      item_name: data.name || "",
      item_type: data.category || "Other",
      quantity: data.quantity ?? 0,
      low_stock_threshold: data.reorder_level ?? 10,
      unit: (data as any).unit || null,
      cost_per_unit: data.unit_price ?? null,
      supplier: data.supplier || null,
    }).select().single();
    if (error) throw error;
    return mapInventoryItem(row);
  } catch (err) {
    console.warn("[CreateInventory] Supabase failed, using mock", err);
    const qty = data.quantity ?? 0;
    const reorder = data.reorder_level ?? 0;
    const status: "ok" | "low" | "out" = qty === 0 ? "out" : qty <= reorder ? "low" : "ok";
    return {
      id: `item-${Date.now()}`, name: data.name || "", category: data.category || "Other",
      quantity: qty, reorder_level: reorder, unit_price: data.unit_price, supplier: data.supplier,
      expiry_date: data.expiry_date, status,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.item_name = data.name;
    if (data.category !== undefined) updateData.item_type = data.category;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.reorder_level !== undefined) updateData.low_stock_threshold = data.reorder_level;
    if (data.unit_price !== undefined) updateData.cost_per_unit = data.unit_price;
    if (data.supplier !== undefined) updateData.supplier = data.supplier;

    const { data: row, error } = await supabase.from("inventory")
      .update(updateData).eq("id", id).select().single();
    if (error) throw error;
    return mapInventoryItem(row);
  } catch (err) {
    console.warn("[UpdateInventory] Supabase failed, using mock", err);
    const existing = mockInventory.find((i) => i.id === id);
    const merged = { ...(existing || {}), ...data, id };
    const qty = merged.quantity ?? 0;
    const reorder = merged.reorder_level ?? 0;
    merged.status = qty === 0 ? "out" : qty <= reorder ? "low" : "ok";
    merged.updated_at = new Date().toISOString();
    return merged as InventoryItem;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("inventory")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("[DeleteInventory] Supabase failed", err);
  }
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(params?: { skip?: number; limit?: number }) {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    let query = supabase.from("invoices")
      .select("*, pets(*), pet_owners!invoices_owner_id_fkey(*)", { count: "exact" })
      .eq("clinic_id", clinicId).eq("is_deleted", false);

    query = query.order("created_at", { ascending: false });
    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? 50;
    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapInvoice), total: count ?? 0 };
  } catch (err) {
    console.warn("[Invoices] Supabase failed, using mock data", err);
    return { data: [...mockInvoices], total: mockInvoices.length };
  }
}

export async function getInvoice(id: string): Promise<Invoice> {
  try {
    const clinicId = getClinicId();
    const { data, error } = await supabase.from("invoices")
      .select("*, pets(*), pet_owners!invoices_owner_id_fkey(*)")
      .eq("id", id).eq("clinic_id", clinicId).eq("is_deleted", false).single();
    if (error) throw error;
    return mapInvoice(data);
  } catch (err) {
    console.warn("[Invoice] Supabase failed, using mock data", err);
    const found = mockInvoices.find((i) => i.id === id);
    if (!found) throw new Error("Invoice not found");
    return found;
  }
}

export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");
    const { data: row, error } = await supabase.from("invoices").insert({
      clinic_id: clinicId,
      invoice_number: data.invoice_number || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      pet_id: data.pet_id || "",
      owner_id: data.owner_id || "",
      amount: data.subtotal ?? data.total ?? 0,
      tax_amount: data.discount ?? 0,
      total_amount: data.total ?? 0,
      status: data.status || "pending",
      due_date: data.due_date || null,
      issue_date: new Date().toISOString().split("T")[0],
      notes: (data as any).notes || null,
    }).select().single();
    if (error) throw error;
    return mapInvoice(row);
  } catch (err) {
    console.warn("[CreateInvoice] Supabase failed, using mock", err);
    return {
      id: `inv-${Date.now()}`,
      invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      pet_id: data.pet_id || "", owner_id: data.owner_id || "",
      line_items: data.line_items || [], subtotal: data.subtotal || 0,
      discount: data.discount, total: data.total || 0, status: "pending",
      due_date: data.due_date || "",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
  }
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  try {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.total !== undefined) updateData.total_amount = data.total;
    if (data.subtotal !== undefined) updateData.amount = data.subtotal;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if ((data as any).notes !== undefined) updateData.notes = (data as any).notes;

    const { data: row, error } = await supabase.from("invoices")
      .update(updateData).eq("id", id).select().single();
    if (error) throw error;
    return mapInvoice(row);
  } catch (err) {
    console.warn("[UpdateInvoice] Supabase failed, using mock", err);
    const existing = mockInvoices.find((i) => i.id === id);
    return { ...(existing || {}), ...data, id, updated_at: new Date().toISOString() } as Invoice;
  }
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export async function getStaff(params?: { skip?: number; limit?: number }) {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    let query = supabase.from("users").select("*", { count: "exact" })
      .eq("clinic_id", clinicId).eq("is_deleted", false);

    query = query.order("created_at", { ascending: false });
    const skip = params?.skip ?? 0;
    const limit = params?.limit ?? 50;
    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapUser), total: count ?? 0 };
  } catch (err) {
    console.warn("[Staff] Supabase failed, using mock data", err);
    return { data: [...mockUsers], total: mockUsers.length };
  }
}

export async function getStaffMember(id: string): Promise<User> {
  try {
    const clinicId = getClinicId();
    const { data, error } = await supabase.from("users").select("*")
      .eq("id", id).eq("clinic_id", clinicId).eq("is_deleted", false).single();
    if (error) throw error;
    return mapUser(data);
  } catch (err) {
    console.warn("[StaffMember] Supabase failed, using mock data", err);
    const found = mockUsers.find((u) => u.id === id);
    if (!found) throw new Error("Staff member not found");
    return found;
  }
}

export async function createStaff(data: Partial<User>): Promise<User> {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");

    // Hash a default password
    const defaultPassword = "changeme123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const { data: row, error } = await supabase.from("users").insert({
      clinic_id: clinicId,
      name: data.full_name || "",
      email: data.email || "",
      role: data.role || "staff",
      phone: data.phone || null,
      password_hash: passwordHash,
      is_active: true,
    }).select().single();
    if (error) throw error;
    return mapUser(row);
  } catch (err) {
    console.warn("[CreateStaff] Supabase failed, using mock", err);
    return {
      id: `staff-${Date.now()}`, full_name: data.full_name || "", email: data.email || "",
      role: data.role || "staff", phone: data.phone, specialties: data.specialties,
      is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
  }
}

export async function updateStaff(id: string, data: Partial<User>): Promise<User> {
  try {
    const updateData: any = {};
    if (data.full_name !== undefined) updateData.name = data.full_name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const { data: row, error } = await supabase.from("users")
      .update(updateData).eq("id", id).select().single();
    if (error) throw error;
    return mapUser(row);
  } catch (err) {
    console.warn("[UpdateStaff] Supabase failed, using mock", err);
    const existing = mockUsers.find((u) => u.id === id);
    return { ...(existing || {}), ...data, id, updated_at: new Date().toISOString() } as User;
  }
}

export async function deleteStaff(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("users")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("[DeleteStaff] Supabase failed", err);
  }
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getServices() {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");
    const { data, error } = await supabase.from("services").select("*")
      .eq("clinic_id", clinicId).eq("is_deleted", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("[Services] Supabase failed, returning empty", err);
    return [];
  }
}

export async function createService(data: any): Promise<any> {
  try {
    const clinicId = getClinicId();
    if (!clinicId) throw new Error("No clinic");
    const { data: row, error } = await supabase.from("services").insert({
      clinic_id: clinicId,
      name: data.name || "",
      category: data.category || "other",
      price: data.price ?? 0,
      description: data.description || null,
      is_active: data.is_active ?? true,
    }).select().single();
    if (error) throw error;
    return row;
  } catch (err) {
    console.warn("[CreateService] Supabase failed", err);
    throw err;
  }
}

export async function updateService(id: string, data: any): Promise<any> {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const { data: row, error } = await supabase.from("services")
      .update(updateData).eq("id", id).select().single();
    if (error) throw error;
    return row;
  } catch (err) {
    console.warn("[UpdateService] Supabase failed", err);
    throw err;
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("services")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("[DeleteService] Supabase failed", err);
    throw err;
  }
}
