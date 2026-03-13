import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as dataService from '../lib/data-service';
import { isSupabaseConfigured } from '../lib/supabase';
import { mockUsers, mockOwners, mockPets, mockAppointments, mockInvoices, mockInventory } from '../lib/mock-data';

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: vi.fn(() => false),
}));

describe('Data Service - Mock Mode (No Supabase)', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    // Ensure mock mode is active
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
  });

  describe('Auth Functions', () => {
    it('should login with valid credentials', async () => {
      const result = await dataService.loginUser('admin@pawscare.com', 'Admin@2026!');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('admin@pawscare.com');
      expect(result.user.role).toBe('admin');
    });

    it('should throw error with invalid credentials', async () => {
      await expect(
        dataService.loginUser('invalid@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should logout successfully', async () => {
      await expect(dataService.logoutUser()).resolves.toBeUndefined();
    });

    it('should get current user from localStorage', async () => {
      // Mock localStorage
      const mockUser = mockUsers[0];
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      const result = await dataService.getCurrentUser();
      expect(result).toEqual(mockUser);
      
      // Cleanup
      localStorage.removeItem('auth_user');
    });
  });

  describe('Pet Owners Functions', () => {
    it('should fetch all owners', async () => {
      const result = await dataService.fetchOwners();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('full_name');
    });

    it('should fetch a single owner by id', async () => {
      const ownerId = mockOwners[0].id;
      const result = await dataService.fetchOwner(ownerId);
      expect(result).toHaveProperty('id', ownerId);
      expect(result).toHaveProperty('full_name');
    });

    it('should throw error when fetching non-existent owner', async () => {
      await expect(
        dataService.fetchOwner('non-existent-id')
      ).rejects.toThrow('Owner not found');
    });

    it('should create a new owner', async () => {
      const newOwner = {
        full_name: 'Test Owner',
        email: 'test@example.com',
        phone: '+91-1234567890',
        address: 'Test Address',
      };
      const result = await dataService.createOwner(newOwner);
      expect(result).toHaveProperty('id');
      expect(result.full_name).toBe(newOwner.full_name);
      expect(result.pets_count).toBe(0);
    });

    it('should update an existing owner', async () => {
      const ownerId = mockOwners[0].id;
      const updates = { phone: '+91-9999999999' };
      const result = await dataService.updateOwner(ownerId, updates);
      expect(result.phone).toBe(updates.phone);
    });

    it('should delete an owner', async () => {
      const ownerId = mockOwners[0].id;
      await expect(dataService.deleteOwner(ownerId)).resolves.toBeUndefined();
    });
  });

  describe('Pets Functions', () => {
    it('should fetch all pets', async () => {
      const result = await dataService.fetchPets();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('owner');
    });

    it('should fetch a single pet by id', async () => {
      const petId = mockPets[0].id;
      const result = await dataService.fetchPet(petId);
      expect(result).toHaveProperty('id', petId);
      expect(result).toHaveProperty('name');
    });

    it('should create a new pet', async () => {
      const newPet = {
        name: 'Test Pet',
        species: 'Dog',
        breed: 'Test Breed',
        gender: 'Male',
        status: 'active',
        owner_id: mockOwners[0].id,
      };
      const result = await dataService.createPet(newPet);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(newPet.name);
    });

    it('should update an existing pet', async () => {
      const petId = mockPets[0].id;
      const updates = { weight: 35 };
      const result = await dataService.updatePet(petId, updates);
      expect(result.weight).toBe(updates.weight);
    });

    it('should delete a pet', async () => {
      const petId = mockPets[0].id;
      await expect(dataService.deletePet(petId)).resolves.toBeUndefined();
    });
  });

  describe('Appointments Functions', () => {
    it('should fetch all appointments', async () => {
      const result = await dataService.fetchAppointments();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('pet');
      expect(result[0]).toHaveProperty('vet');
    });

    it('should create a new appointment', async () => {
      const newAppointment = {
        pet_id: mockPets[0].id,
        vet_id: mockUsers[1].id,
        date: '2026-03-01',
        time: '10:00',
        reason: 'Test appointment',
        status: 'scheduled' as const,
      };
      const result = await dataService.createAppointment(newAppointment);
      expect(result).toHaveProperty('id');
      expect(result.reason).toBe(newAppointment.reason);
    });

    it('should update an existing appointment', async () => {
      const appointmentId = mockAppointments[0].id;
      const updates = { status: 'completed' as const };
      const result = await dataService.updateAppointment(appointmentId, updates);
      expect(result.status).toBe(updates.status);
    });

    it('should delete an appointment', async () => {
      const appointmentId = mockAppointments[0].id;
      await expect(dataService.deleteAppointment(appointmentId)).resolves.toBeUndefined();
    });
  });

  describe('Invoices Functions', () => {
    it('should fetch all invoices', async () => {
      const result = await dataService.fetchInvoices();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('invoice_number');
      expect(result[0]).toHaveProperty('line_items');
    });

    it('should fetch a single invoice by id', async () => {
      const invoiceId = mockInvoices[0].id;
      const result = await dataService.fetchInvoice(invoiceId);
      expect(result).toHaveProperty('id', invoiceId);
      expect(result).toHaveProperty('line_items');
    });

    it('should create a new invoice', async () => {
      const newInvoice = {
        invoice_number: 'INV-TEST-001',
        pet_id: mockPets[0].id,
        owner_id: mockOwners[0].id,
        line_items: [
          { description: 'Test Item', quantity: 1, unit_price: 100, total: 100 },
        ],
        subtotal: 100,
        total: 100,
        status: 'pending' as const,
        due_date: '2026-03-15',
      };
      const result = await dataService.createInvoice(newInvoice);
      expect(result).toHaveProperty('id');
      expect(result.invoice_number).toBe(newInvoice.invoice_number);
    });

    it('should update an existing invoice', async () => {
      const invoiceId = mockInvoices[0].id;
      const updates = { status: 'paid' as const };
      const result = await dataService.updateInvoice(invoiceId, updates);
      expect(result.status).toBe(updates.status);
    });

    it('should delete an invoice', async () => {
      const invoiceId = mockInvoices[0].id;
      await expect(dataService.deleteInvoice(invoiceId)).resolves.toBeUndefined();
    });
  });

  describe('Inventory Functions', () => {
    it('should fetch all inventory items', async () => {
      const result = await dataService.fetchInventory();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('quantity');
    });

    it('should create a new inventory item', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Medications',
        quantity: 100,
        reorder_level: 20,
        unit_price: 50,
        status: 'ok' as const,
      };
      const result = await dataService.createInventoryItem(newItem);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(newItem.name);
    });

    it('should update an existing inventory item', async () => {
      const itemId = mockInventory[0].id;
      const updates = { quantity: 50 };
      const result = await dataService.updateInventoryItem(itemId, updates);
      expect(result.quantity).toBe(updates.quantity);
    });

    it('should delete an inventory item', async () => {
      const itemId = mockInventory[0].id;
      await expect(dataService.deleteInventoryItem(itemId)).resolves.toBeUndefined();
    });
  });

  describe('Dashboard Function', () => {
    it('should fetch dashboard data', async () => {
      const result = await dataService.fetchDashboardData();
      expect(result).toHaveProperty('todays_appointments');
      expect(result).toHaveProperty('pending_invoices');
      expect(result).toHaveProperty('total_pets');
      expect(result).toHaveProperty('total_owners');
      expect(result).toHaveProperty('upcoming_appointments');
      expect(result).toHaveProperty('recent_invoices');
      expect(result).toHaveProperty('low_stock_items');
      expect(typeof result.todays_appointments).toBe('number');
      expect(typeof result.pending_invoices).toBe('number');
      expect(typeof result.total_pets).toBe('number');
      expect(typeof result.total_owners).toBe('number');
    });
  });

  describe('Staff Functions', () => {
    it('should fetch all staff members', async () => {
      const result = await dataService.fetchStaff();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('role');
    });

    it('should fetch a single staff member by id', async () => {
      const staffId = mockUsers[0].id;
      const result = await dataService.fetchStaffMember(staffId);
      expect(result).toHaveProperty('id', staffId);
      expect(result).toHaveProperty('email');
    });

    it('should create a new staff member', async () => {
      const newStaff = {
        email: 'newstaff@pawscare.com',
        full_name: 'New Staff',
        role: 'staff' as const,
        is_active: true,
      };
      const result = await dataService.createStaffMember(newStaff);
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(newStaff.email);
    });

    it('should update an existing staff member', async () => {
      const staffId = mockUsers[0].id;
      const updates = { phone: '+91-8888888888' };
      const result = await dataService.updateStaffMember(staffId, updates);
      expect(result.phone).toBe(updates.phone);
    });

    it('should delete a staff member', async () => {
      const staffId = mockUsers[0].id;
      await expect(dataService.deleteStaffMember(staffId)).resolves.toBeUndefined();
    });
  });
});
