import { supabase, isSupabaseConfigured } from './supabase';
import {
  mockUsers,
  mockOwners,
  mockPets,
  mockAppointments,
  mockInvoices,
  mockInventory,
  mockDashboardData,
  mockLogin,
} from './mock-data';
import type {
  User,
  AuthResponse,
  Pet,
  PetOwner,
  Appointment,
  Invoice,
  InvoiceLineItem,
  InventoryItem,
  DashboardData,
} from '@/types/api';

// ============= Auth Functions =============

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock login');
    return mockLogin(email, password);
  }

  try {
    const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from auth');

    // Fetch profile from profiles table
    const { data: profile, error: profileError } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    const user: User = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      phone: profile.phone,
      specialties: profile.specialties,
      is_active: profile.is_active,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return {
      access_token: authData.session?.access_token || '',
      token_type: 'bearer',
      user,
    };
  } catch (error) {
    console.error('[DataService] Login error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock logout');
    return;
  }

  try {
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('[DataService] Logout error:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock current user');
    // Check localStorage for mock user
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  }

  try {
    const { data: { user: authUser }, error: authError } = await supabase!.auth.getUser();

    if (authError) throw authError;
    if (!authUser) return null;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      phone: profile.phone,
      specialties: profile.specialties,
      is_active: profile.is_active,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  } catch (error) {
    console.error('[DataService] Get current user error:', error);
    return null;
  }
}

// ============= Pet Owners Functions =============

export async function fetchOwners(): Promise<PetOwner[]> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock owners');
    return mockOwners;
  }

  try {
    const { data: owners, error } = await supabase!
      .from('pet_owners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Compute pets_count and last_visit for each owner
    const ownersWithStats = await Promise.all(
      owners.map(async (owner) => {
        // Get pets count
        const { count: petsCount } = await supabase!
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', owner.id);

        // Get last visit (most recent appointment)
        const { data: lastAppointment } = await supabase!
          .from('appointments')
          .select('date, pets!inner(owner_id)')
          .eq('pets.owner_id', owner.id)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        return {
          ...owner,
          pets_count: petsCount || 0,
          last_visit: lastAppointment?.date || undefined,
        };
      })
    );

    return ownersWithStats;
  } catch (error) {
    console.error('[DataService] Fetch owners error:', error);
    throw error;
  }
}

export async function fetchOwner(id: string): Promise<PetOwner> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock owner');
    const owner = mockOwners.find((o) => o.id === id);
    if (!owner) throw new Error('Owner not found');
    return owner;
  }

  try {
    const { data: owner, error } = await supabase!
      .from('pet_owners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!owner) throw new Error('Owner not found');

    // Get pets count
    const { count: petsCount } = await supabase!
      .from('pets')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', id);

    // Get last visit
    const { data: lastAppointment } = await supabase!
      .from('appointments')
      .select('date, pets!inner(owner_id)')
      .eq('pets.owner_id', id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    return {
      ...owner,
      pets_count: petsCount || 0,
      last_visit: lastAppointment?.date || undefined,
    };
  } catch (error) {
    console.error('[DataService] Fetch owner error:', error);
    throw error;
  }
}

export async function createOwner(data: Omit<PetOwner, 'id' | 'created_at' | 'updated_at' | 'pets_count' | 'last_visit'>): Promise<PetOwner> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock create owner');
    const newOwner: PetOwner = {
      id: `owner-${Date.now()}`,
      ...data,
      pets_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockOwners.push(newOwner);
    return newOwner;
  }

  try {
    const { data: owner, error } = await supabase!
      .from('pet_owners')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return { ...owner, pets_count: 0 };
  } catch (error) {
    console.error('[DataService] Create owner error:', error);
    throw error;
  }
}

export async function updateOwner(id: string, data: Partial<PetOwner>): Promise<PetOwner> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock update owner');
    const index = mockOwners.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Owner not found');
    mockOwners[index] = { ...mockOwners[index], ...data, updated_at: new Date().toISOString() };
    return mockOwners[index];
  }

  try {
    const { data: owner, error } = await supabase!
      .from('pet_owners')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return owner;
  } catch (error) {
    console.error('[DataService] Update owner error:', error);
    throw error;
  }
}

export async function deleteOwner(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock delete owner');
    const index = mockOwners.findIndex((o) => o.id === id);
    if (index !== -1) mockOwners.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase!
      .from('pet_owners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[DataService] Delete owner error:', error);
    throw error;
  }
}

// ============= Pets Functions =============

export async function fetchPets(): Promise<Pet[]> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock pets');
    return mockPets;
  }

  try {
    const { data: pets, error } = await supabase!
      .from('pets')
      .select('*, owner:pet_owners(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      date_of_birth: pet.date_of_birth,
      weight: pet.weight,
      microchip_id: pet.microchip_id,
      notes: pet.notes,
      status: pet.status,
      owner_id: pet.owner_id,
      owner: pet.owner,
      created_at: pet.created_at,
      updated_at: pet.updated_at,
    }));
  } catch (error) {
    console.error('[DataService] Fetch pets error:', error);
    throw error;
  }
}

export async function fetchPet(id: string): Promise<Pet> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock pet');
    const pet = mockPets.find((p) => p.id === id);
    if (!pet) throw new Error('Pet not found');
    return pet;
  }

  try {
    const { data: pet, error } = await supabase!
      .from('pets')
      .select('*, owner:pet_owners(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!pet) throw new Error('Pet not found');

    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      date_of_birth: pet.date_of_birth,
      weight: pet.weight,
      microchip_id: pet.microchip_id,
      notes: pet.notes,
      status: pet.status,
      owner_id: pet.owner_id,
      owner: pet.owner,
      created_at: pet.created_at,
      updated_at: pet.updated_at,
    };
  } catch (error) {
    console.error('[DataService] Fetch pet error:', error);
    throw error;
  }
}

export async function createPet(data: Omit<Pet, 'id' | 'created_at' | 'updated_at' | 'owner'>): Promise<Pet> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock create pet');
    const owner = mockOwners.find((o) => o.id === data.owner_id);
    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      ...data,
      owner,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockPets.push(newPet);
    return newPet;
  }

  try {
    const { data: pet, error } = await supabase!
      .from('pets')
      .insert([data])
      .select('*, owner:pet_owners(*)')
      .single();

    if (error) throw error;
    return pet;
  } catch (error) {
    console.error('[DataService] Create pet error:', error);
    throw error;
  }
}

export async function updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock update pet');
    const index = mockPets.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Pet not found');
    mockPets[index] = { ...mockPets[index], ...data, updated_at: new Date().toISOString() };
    return mockPets[index];
  }

  try {
    const { data: pet, error } = await supabase!
      .from('pets')
      .update(data)
      .eq('id', id)
      .select('*, owner:pet_owners(*)')
      .single();

    if (error) throw error;
    return pet;
  } catch (error) {
    console.error('[DataService] Update pet error:', error);
    throw error;
  }
}

export async function deletePet(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock delete pet');
    const index = mockPets.findIndex((p) => p.id === id);
    if (index !== -1) mockPets.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase!
      .from('pets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[DataService] Delete pet error:', error);
    throw error;
  }
}

// ============= Appointments Functions =============

export async function fetchAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock appointments');
    return mockAppointments;
  }

  try {
    const { data: appointments, error } = await supabase!
      .from('appointments')
      .select(`
        *,
        pet:pets(*, owner:pet_owners(*)),
        vet:profiles(*)
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    return appointments.map((apt) => ({
      id: apt.id,
      pet_id: apt.pet_id,
      pet: apt.pet,
      vet_id: apt.vet_id,
      vet: apt.vet,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      notes: apt.notes,
      status: apt.status,
      created_at: apt.created_at,
      updated_at: apt.updated_at,
    }));
  } catch (error) {
    console.error('[DataService] Fetch appointments error:', error);
    throw error;
  }
}

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'pet' | 'vet'>
): Promise<Appointment> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock create appointment');
    const pet = mockPets.find((p) => p.id === data.pet_id);
    const vet = mockUsers.find((u) => u.id === data.vet_id);
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      ...data,
      pet,
      vet,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockAppointments.push(newAppointment);
    return newAppointment;
  }

  try {
    const { data: appointment, error } = await supabase!
      .from('appointments')
      .insert([data])
      .select(`
        *,
        pet:pets(*, owner:pet_owners(*)),
        vet:profiles(*)
      `)
      .single();

    if (error) throw error;
    return appointment;
  } catch (error) {
    console.error('[DataService] Create appointment error:', error);
    throw error;
  }
}

export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
): Promise<Appointment> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock update appointment');
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Appointment not found');
    mockAppointments[index] = {
      ...mockAppointments[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockAppointments[index];
  }

  try {
    const { data: appointment, error } = await supabase!
      .from('appointments')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        pet:pets(*, owner:pet_owners(*)),
        vet:profiles(*)
      `)
      .single();

    if (error) throw error;
    return appointment;
  } catch (error) {
    console.error('[DataService] Update appointment error:', error);
    throw error;
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock delete appointment');
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index !== -1) mockAppointments.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase!
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[DataService] Delete appointment error:', error);
    throw error;
  }
}

// ============= Invoices Functions =============

export async function fetchInvoices(): Promise<Invoice[]> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock invoices');
    return mockInvoices;
  }

  try {
    const { data: invoices, error } = await supabase!
      .from('invoices')
      .select(`
        *,
        pet:pets(*),
        owner:pet_owners(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch line items for each invoice
    const invoicesWithItems = await Promise.all(
      invoices.map(async (invoice) => {
        const { data: lineItems, error: itemsError } = await supabase!
          .from('invoice_line_items')
          .select('*')
          .eq('invoice_id', invoice.id);

        if (itemsError) throw itemsError;

        return {
          ...invoice,
          line_items: lineItems || [],
        };
      })
    );

    return invoicesWithItems;
  } catch (error) {
    console.error('[DataService] Fetch invoices error:', error);
    throw error;
  }
}

export async function fetchInvoice(id: string): Promise<Invoice> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock invoice');
    const invoice = mockInvoices.find((i) => i.id === id);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  try {
    const { data: invoice, error } = await supabase!
      .from('invoices')
      .select(`
        *,
        pet:pets(*),
        owner:pet_owners(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!invoice) throw new Error('Invoice not found');

    // Fetch line items
    const { data: lineItems, error: itemsError } = await supabase!
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', id);

    if (itemsError) throw itemsError;

    return {
      ...invoice,
      line_items: lineItems || [],
    };
  } catch (error) {
    console.error('[DataService] Fetch invoice error:', error);
    throw error;
  }
}

export async function createInvoice(
  data: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'pet' | 'owner'>
): Promise<Invoice> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock create invoice');
    const pet = mockPets.find((p) => p.id === data.pet_id);
    const owner = mockOwners.find((o) => o.id === data.owner_id);
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      ...data,
      pet,
      owner,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockInvoices.push(newInvoice);
    return newInvoice;
  }

  try {
    // Insert invoice
    const { line_items, ...invoiceData } = data;
    const { data: invoice, error: invoiceError } = await supabase!
      .from('invoices')
      .insert([invoiceData])
      .select(`
        *,
        pet:pets(*),
        owner:pet_owners(*)
      `)
      .single();

    if (invoiceError) throw invoiceError;

    // Insert line items
    if (line_items && line_items.length > 0) {
      const itemsToInsert = line_items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { data: insertedItems, error: itemsError } = await supabase!
        .from('invoice_line_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      return {
        ...invoice,
        line_items: insertedItems,
      };
    }

    return {
      ...invoice,
      line_items: [],
    };
  } catch (error) {
    console.error('[DataService] Create invoice error:', error);
    throw error;
  }
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock update invoice');
    const index = mockInvoices.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Invoice not found');
    mockInvoices[index] = {
      ...mockInvoices[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockInvoices[index];
  }

  try {
    const { line_items, ...invoiceData } = data;
    const { data: invoice, error } = await supabase!
      .from('invoices')
      .update(invoiceData)
      .eq('id', id)
      .select(`
        *,
        pet:pets(*),
        owner:pet_owners(*)
      `)
      .single();

    if (error) throw error;

    // If line_items are provided, update them
    // For simplicity, we'll fetch existing line items
    const { data: existingItems } = await supabase!
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', id);

    return {
      ...invoice,
      line_items: existingItems || [],
    };
  } catch (error) {
    console.error('[DataService] Update invoice error:', error);
    throw error;
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock delete invoice');
    const index = mockInvoices.findIndex((i) => i.id === id);
    if (index !== -1) mockInvoices.splice(index, 1);
    return;
  }

  try {
    // Delete line items first
    await supabase!.from('invoice_line_items').delete().eq('invoice_id', id);

    // Delete invoice
    const { error } = await supabase!.from('invoices').delete().eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[DataService] Delete invoice error:', error);
    throw error;
  }
}

// ============= Inventory Functions =============

export async function fetchInventory(): Promise<InventoryItem[]> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock inventory');
    return mockInventory;
  }

  try {
    const { data: inventory, error } = await supabase!
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return inventory;
  } catch (error) {
    console.error('[DataService] Fetch inventory error:', error);
    throw error;
  }
}

export async function createInventoryItem(
  data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
): Promise<InventoryItem> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock create inventory item');
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockInventory.push(newItem);
    return newItem;
  }

  try {
    const { data: item, error } = await supabase!
      .from('inventory')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return item;
  } catch (error) {
    console.error('[DataService] Create inventory item error:', error);
    throw error;
  }
}

export async function updateInventoryItem(
  id: string,
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock update inventory item');
    const index = mockInventory.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Inventory item not found');
    mockInventory[index] = {
      ...mockInventory[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockInventory[index];
  }

  try {
    const { data: item, error } = await supabase!
      .from('inventory')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return item;
  } catch (error) {
    console.error('[DataService] Update inventory item error:', error);
    throw error;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock delete inventory item');
    const index = mockInventory.findIndex((i) => i.id === id);
    if (index !== -1) mockInventory.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase!.from('inventory').delete().eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[DataService] Delete inventory item error:', error);
    throw error;
  }
}

// ============= Dashboard Function =============

export async function fetchDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock dashboard data');
    return mockDashboardData;
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Today's appointments count
    const { count: todaysCount } = await supabase!
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'scheduled');

    // Pending invoices count
    const { count: pendingInvoicesCount } = await supabase!
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'overdue']);

    // Total pets count
    const { count: totalPetsCount } = await supabase!
      .from('pets')
      .select('*', { count: 'exact', head: true });

    // Total owners count
    const { count: totalOwnersCount } = await supabase!
      .from('pet_owners')
      .select('*', { count: 'exact', head: true });

    // Upcoming appointments
    const { data: upcomingAppointments } = await supabase!
      .from('appointments')
      .select(`
        *,
        pet:pets(*, owner:pet_owners(*)),
        vet:profiles(*)
      `)
      .eq('status', 'scheduled')
      .order('date', { ascending: true })
      .limit(5);

    // Recent invoices
    const recentInvoicesData = await fetchInvoices();
    const recentInvoices = recentInvoicesData.slice(0, 5);

    // Low stock items
    const { data: lowStockItems } = await supabase!
      .from('inventory')
      .select('*')
      .in('status', ['low', 'out']);

    return {
      todays_appointments: todaysCount || 0,
      pending_invoices: pendingInvoicesCount || 0,
      total_pets: totalPetsCount || 0,
      total_owners: totalOwnersCount || 0,
      upcoming_appointments: upcomingAppointments || [],
      recent_invoices: recentInvoices,
      low_stock_items: lowStockItems || [],
    };
  } catch (error) {
    console.error('[DataService] Fetch dashboard data error:', error);
    throw error;
  }
}

// ============= Staff Functions =============

export async function fetchStaff(): Promise<User[]> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock staff');
    return mockUsers;
  }

  try {
    const { data: staff, error } = await supabase!
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return staff;
  } catch (error) {
    console.error('[DataService] Fetch staff error:', error);
    throw error;
  }
}

export async function fetchStaffMember(id: string): Promise<User> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Using mock staff member');
    const staff = mockUsers.find((u) => u.id === id);
    if (!staff) throw new Error('Staff member not found');
    return staff;
  }

  try {
    const { data: staff, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!staff) throw new Error('Staff member not found');
    return staff;
  } catch (error) {
    console.error('[DataService] Fetch staff member error:', error);
    throw error;
  }
}

export async function createStaffMember(
  data: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }
): Promise<User> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock create staff member');
    const newStaff: User = {
      id: `staff-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      phone: data.phone,
      specialties: data.specialties,
      is_active: data.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsers.push(newStaff);
    return newStaff;
  }

  try {
    // For creating users, we'll directly insert into profiles
    // In a real scenario, you'd use Supabase Admin API to create auth users
    // For this implementation, we'll just create the profile
    const { password, ...profileData } = data;
    const { data: staff, error } = await supabase!
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;
    return staff;
  } catch (error) {
    console.error('[DataService] Create staff member error:', error);
    throw error;
  }
}

export async function updateStaffMember(id: string, data: Partial<User>): Promise<User> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock update staff member');
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Staff member not found');
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockUsers[index];
  }

  try {
    const { data: staff, error } = await supabase!
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return staff;
  } catch (error) {
    console.error('[DataService] Update staff member error:', error);
    throw error;
  }
}

export async function deleteStaffMember(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[DataService] Mock delete staff member');
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) mockUsers.splice(index, 1);
    return;
  }

  try {
    const { error } = await supabase!.from('profiles').delete().eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[DataService] Delete staff member error:', error);
    throw error;
  }
}
