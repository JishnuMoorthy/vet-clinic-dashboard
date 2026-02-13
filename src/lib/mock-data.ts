import type {
  User,
  AuthResponse,
  DashboardData,
  Pet,
  PetOwner,
  Appointment,
  Invoice,
  InvoiceLineItem,
  InventoryItem,
} from "@/types/api";

// ============= Mock Users & Auth =============

interface MockCredential {
  email: string;
  password: string;
  user: User;
}

export const mockUsers: User[] = [
  {
    id: "mock-admin-001",
    email: "admin@pawscare.com",
    full_name: "Admin User",
    role: "admin",
    phone: "+91-9000000001",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "mock-vet-001",
    email: "rajesh.sharma@pawscare.com",
    full_name: "Dr. Rajesh Sharma",
    role: "vet",
    phone: "+91-9000000002",
    specialties: ["Surgery", "Dermatology"],
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "mock-vet-002",
    email: "priya.nair@pawscare.com",
    full_name: "Dr. Priya Nair",
    role: "vet",
    phone: "+91-9000000004",
    specialties: ["Dentistry", "Internal Medicine"],
    is_active: true,
    created_at: "2025-02-15T00:00:00Z",
    updated_at: "2025-02-15T00:00:00Z",
  },
  {
    id: "mock-staff-001",
    email: "anjali@pawscare.com",
    full_name: "Anjali Patel",
    role: "staff",
    phone: "+91-9000000003",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "mock-staff-002",
    email: "vikram@pawscare.com",
    full_name: "Vikram Singh",
    role: "staff",
    phone: "+91-9000000005",
    is_active: false,
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z",
  },
];

const mockCredentials: MockCredential[] = [
  { email: "admin@pawscare.com", password: "Admin@2026!", user: mockUsers[0] },
  { email: "rajesh.sharma@pawscare.com", password: "Vet@2026!", user: mockUsers[1] },
  { email: "anjali@pawscare.com", password: "Staff@2026!", user: mockUsers[2] },
];

export function mockLogin(email: string, password: string): AuthResponse {
  const match = mockCredentials.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!match) throw new Error("Invalid email or password");
  return {
    access_token: `mock-token-${match.user.id}-${Date.now()}`,
    token_type: "bearer",
    user: match.user,
  };
}

// ============= Mock Pet Owners =============

export const mockOwners: PetOwner[] = [
  { id: "owner-001", full_name: "Meera Kapoor", email: "meera@gmail.com", phone: "+91-9876543210", address: "12 MG Road, Bangalore", pets_count: 2, last_visit: "2026-02-10", created_at: "2025-03-01T00:00:00Z", updated_at: "2026-02-10T00:00:00Z" },
  { id: "owner-002", full_name: "Arjun Reddy", email: "arjun.r@gmail.com", phone: "+91-9876543211", address: "45 Jubilee Hills, Hyderabad", pets_count: 1, last_visit: "2026-02-08", created_at: "2025-04-15T00:00:00Z", updated_at: "2026-02-08T00:00:00Z" },
  { id: "owner-003", full_name: "Sneha Iyer", email: "sneha.i@outlook.com", phone: "+91-9876543212", address: "78 Anna Nagar, Chennai", pets_count: 3, last_visit: "2026-02-12", created_at: "2025-01-20T00:00:00Z", updated_at: "2026-02-12T00:00:00Z" },
  { id: "owner-004", full_name: "Rohit Malhotra", email: "rohit.m@yahoo.com", phone: "+91-9876543213", address: "23 Sector 15, Noida", pets_count: 1, last_visit: "2026-01-25", created_at: "2025-06-10T00:00:00Z", updated_at: "2026-01-25T00:00:00Z" },
  { id: "owner-005", full_name: "Kavitha Menon", email: "kavitha.m@gmail.com", phone: "+91-9876543214", address: "56 Fort Kochi, Kerala", pets_count: 2, last_visit: "2026-02-11", created_at: "2025-02-28T00:00:00Z", updated_at: "2026-02-11T00:00:00Z" },
  { id: "owner-006", full_name: "Deepak Joshi", email: "deepak.j@gmail.com", phone: "+91-9876543215", address: "90 Baner Road, Pune", pets_count: 1, last_visit: "2026-02-05", created_at: "2025-07-15T00:00:00Z", updated_at: "2026-02-05T00:00:00Z" },
];

// ============= Mock Pets =============

export const mockPets: Pet[] = [
  { id: "pet-001", name: "Bruno", species: "Dog", breed: "Golden Retriever", gender: "Male", date_of_birth: "2022-03-15", weight: 32, microchip_id: "MC-001234", notes: "Friendly, loves treats", status: "active", owner_id: "owner-001", owner: mockOwners[0], created_at: "2025-03-01T00:00:00Z", updated_at: "2026-02-10T00:00:00Z" },
  { id: "pet-002", name: "Luna", species: "Cat", breed: "Persian", gender: "Female", date_of_birth: "2023-07-20", weight: 4.5, microchip_id: "MC-001235", status: "active", owner_id: "owner-001", owner: mockOwners[0], created_at: "2025-03-01T00:00:00Z", updated_at: "2026-01-15T00:00:00Z" },
  { id: "pet-003", name: "Rocky", species: "Dog", breed: "German Shepherd", gender: "Male", date_of_birth: "2021-11-08", weight: 38, microchip_id: "MC-001236", notes: "Anxious during checkups", status: "active", owner_id: "owner-002", owner: mockOwners[1], created_at: "2025-04-15T00:00:00Z", updated_at: "2026-02-08T00:00:00Z" },
  { id: "pet-004", name: "Cleo", species: "Cat", breed: "Siamese", gender: "Female", date_of_birth: "2024-01-12", weight: 3.8, status: "active", owner_id: "owner-003", owner: mockOwners[2], created_at: "2025-01-20T00:00:00Z", updated_at: "2026-02-12T00:00:00Z" },
  { id: "pet-005", name: "Max", species: "Dog", breed: "Labrador", gender: "Male", date_of_birth: "2020-06-30", weight: 29, microchip_id: "MC-001238", status: "active", owner_id: "owner-003", owner: mockOwners[2], created_at: "2025-01-20T00:00:00Z", updated_at: "2026-02-01T00:00:00Z" },
  { id: "pet-006", name: "Whiskers", species: "Cat", breed: "Maine Coon", gender: "Male", date_of_birth: "2023-09-05", weight: 6.2, status: "active", owner_id: "owner-003", owner: mockOwners[2], created_at: "2025-01-20T00:00:00Z", updated_at: "2025-12-20T00:00:00Z" },
  { id: "pet-007", name: "Buddy", species: "Dog", breed: "Beagle", gender: "Male", date_of_birth: "2022-12-01", weight: 12, microchip_id: "MC-001240", status: "active", owner_id: "owner-004", owner: mockOwners[3], created_at: "2025-06-10T00:00:00Z", updated_at: "2026-01-25T00:00:00Z" },
  { id: "pet-008", name: "Simba", species: "Dog", breed: "Indie", gender: "Male", date_of_birth: "2021-04-18", weight: 20, status: "active", owner_id: "owner-005", owner: mockOwners[4], created_at: "2025-02-28T00:00:00Z", updated_at: "2026-02-11T00:00:00Z" },
  { id: "pet-009", name: "Milo", species: "Cat", breed: "British Shorthair", gender: "Male", date_of_birth: "2024-05-22", weight: 5, status: "active", owner_id: "owner-005", owner: mockOwners[4], created_at: "2025-02-28T00:00:00Z", updated_at: "2026-01-30T00:00:00Z" },
  { id: "pet-010", name: "Daisy", species: "Dog", breed: "Pomeranian", gender: "Female", date_of_birth: "2023-08-14", weight: 3.5, microchip_id: "MC-001243", status: "active", owner_id: "owner-006", owner: mockOwners[5], created_at: "2025-07-15T00:00:00Z", updated_at: "2026-02-05T00:00:00Z" },
];

// ============= Mock Appointments =============

const today = new Date().toISOString().split("T")[0];

export const mockAppointments: Appointment[] = [
  { id: "apt-001", pet_id: "pet-001", pet: mockPets[0], vet_id: "mock-vet-001", vet: mockUsers[1], date: today, time: "09:00", reason: "Annual vaccination", status: "scheduled", created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z" },
  { id: "apt-002", pet_id: "pet-003", pet: mockPets[2], vet_id: "mock-vet-001", vet: mockUsers[1], date: today, time: "10:30", reason: "Skin allergy follow-up", notes: "Check rash on left ear", status: "scheduled", created_at: "2026-02-05T00:00:00Z", updated_at: "2026-02-05T00:00:00Z" },
  { id: "apt-003", pet_id: "pet-004", pet: mockPets[3], vet_id: "mock-vet-002", vet: mockUsers[2], date: today, time: "11:00", reason: "Dental checkup", status: "scheduled", created_at: "2026-02-08T00:00:00Z", updated_at: "2026-02-08T00:00:00Z" },
  { id: "apt-004", pet_id: "pet-007", pet: mockPets[6], vet_id: "mock-vet-002", vet: mockUsers[2], date: today, time: "14:00", reason: "Limping — right front leg", status: "scheduled", created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z" },
  { id: "apt-005", pet_id: "pet-010", pet: mockPets[9], vet_id: "mock-vet-001", vet: mockUsers[1], date: today, time: "15:30", reason: "Grooming & general checkup", status: "scheduled", created_at: "2026-02-11T00:00:00Z", updated_at: "2026-02-11T00:00:00Z" },
  { id: "apt-006", pet_id: "pet-002", pet: mockPets[1], vet_id: "mock-vet-001", vet: mockUsers[1], date: "2026-02-14", time: "09:30", reason: "Vaccination booster", status: "scheduled", created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z" },
  { id: "apt-007", pet_id: "pet-008", pet: mockPets[7], vet_id: "mock-vet-002", vet: mockUsers[2], date: "2026-02-14", time: "11:00", reason: "Post-surgery follow-up", status: "scheduled", created_at: "2026-02-12T00:00:00Z", updated_at: "2026-02-12T00:00:00Z" },
  { id: "apt-008", pet_id: "pet-005", pet: mockPets[4], vet_id: "mock-vet-001", vet: mockUsers[1], date: "2026-02-10", time: "10:00", reason: "Blood work", status: "completed", created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-10T00:00:00Z" },
  { id: "apt-009", pet_id: "pet-009", pet: mockPets[8], vet_id: "mock-vet-002", vet: mockUsers[2], date: "2026-02-09", time: "14:30", reason: "Eye infection", status: "completed", created_at: "2026-02-05T00:00:00Z", updated_at: "2026-02-09T00:00:00Z" },
  { id: "apt-010", pet_id: "pet-006", pet: mockPets[5], vet_id: "mock-vet-001", vet: mockUsers[1], date: "2026-02-08", time: "16:00", reason: "Deworming", status: "cancelled", created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-07T00:00:00Z" },
];

// ============= Mock Invoices =============

export const mockInvoices: Invoice[] = [
  {
    id: "inv-001", invoice_number: "INV-2026-001", pet_id: "pet-001", pet: mockPets[0], owner_id: "owner-001", owner: mockOwners[0],
    line_items: [
      { id: "li-001", description: "Annual vaccination (Rabies)", quantity: 1, unit_price: 1500, total: 1500 },
      { id: "li-002", description: "Consultation fee", quantity: 1, unit_price: 500, total: 500 },
    ],
    subtotal: 2000, discount: 200, total: 1800, status: "paid", due_date: "2026-02-15", payment_method: "UPI", created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "inv-002", invoice_number: "INV-2026-002", pet_id: "pet-003", pet: mockPets[2], owner_id: "owner-002", owner: mockOwners[1],
    line_items: [
      { id: "li-003", description: "Skin allergy treatment", quantity: 1, unit_price: 2000, total: 2000 },
      { id: "li-004", description: "Medication (Antihistamine)", quantity: 2, unit_price: 350, total: 700 },
    ],
    subtotal: 2700, total: 2700, status: "pending", due_date: "2026-02-20", created_at: "2026-02-08T00:00:00Z", updated_at: "2026-02-08T00:00:00Z",
  },
  {
    id: "inv-003", invoice_number: "INV-2026-003", pet_id: "pet-005", pet: mockPets[4], owner_id: "owner-003", owner: mockOwners[2],
    line_items: [
      { id: "li-005", description: "Blood work panel", quantity: 1, unit_price: 3500, total: 3500 },
      { id: "li-006", description: "Consultation fee", quantity: 1, unit_price: 500, total: 500 },
    ],
    subtotal: 4000, total: 4000, status: "overdue", due_date: "2026-02-05", created_at: "2026-01-30T00:00:00Z", updated_at: "2026-02-05T00:00:00Z",
  },
  {
    id: "inv-004", invoice_number: "INV-2026-004", pet_id: "pet-007", pet: mockPets[6], owner_id: "owner-004", owner: mockOwners[3],
    line_items: [
      { id: "li-007", description: "X-Ray (front leg)", quantity: 1, unit_price: 2500, total: 2500 },
      { id: "li-008", description: "Pain medication", quantity: 1, unit_price: 600, total: 600 },
      { id: "li-009", description: "Consultation fee", quantity: 1, unit_price: 500, total: 500 },
    ],
    subtotal: 3600, total: 3600, status: "pending", due_date: "2026-02-25", created_at: "2026-02-12T00:00:00Z", updated_at: "2026-02-12T00:00:00Z",
  },
  {
    id: "inv-005", invoice_number: "INV-2026-005", pet_id: "pet-010", pet: mockPets[9], owner_id: "owner-006", owner: mockOwners[5],
    line_items: [
      { id: "li-010", description: "Grooming (full)", quantity: 1, unit_price: 1200, total: 1200 },
    ],
    subtotal: 1200, total: 1200, status: "paid", due_date: "2026-02-10", payment_method: "Card", created_at: "2026-02-05T00:00:00Z", updated_at: "2026-02-05T00:00:00Z",
  },
];

// ============= Mock Inventory =============

export const mockInventory: InventoryItem[] = [
  { id: "item-001", name: "Rabies Vaccine", category: "Vaccines", quantity: 45, reorder_level: 20, unit_price: 800, supplier: "VetPharma India", expiry_date: "2027-06-30", status: "ok", created_at: "2025-01-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z" },
  { id: "item-002", name: "Antibiotic Amoxicillin 250mg", category: "Medications", quantity: 8, reorder_level: 15, unit_price: 120, supplier: "MediVet Supplies", expiry_date: "2026-12-31", status: "low", created_at: "2025-01-01T00:00:00Z", updated_at: "2026-02-10T00:00:00Z" },
  { id: "item-003", name: "Surgical Gloves (Box)", category: "Consumables", quantity: 25, reorder_level: 10, unit_price: 450, supplier: "MedSupply Co", status: "ok", created_at: "2025-01-01T00:00:00Z", updated_at: "2026-01-15T00:00:00Z" },
  { id: "item-004", name: "Flea Treatment Spray", category: "Medications", quantity: 3, reorder_level: 10, unit_price: 350, supplier: "PetCare Direct", expiry_date: "2026-09-30", status: "low", created_at: "2025-03-01T00:00:00Z", updated_at: "2026-02-08T00:00:00Z" },
  { id: "item-005", name: "IV Fluid Saline 500ml", category: "Consumables", quantity: 0, reorder_level: 20, unit_price: 180, supplier: "MediVet Supplies", expiry_date: "2027-03-31", status: "out", created_at: "2025-01-01T00:00:00Z", updated_at: "2026-02-12T00:00:00Z" },
  { id: "item-006", name: "Deworming Tablets", category: "Medications", quantity: 60, reorder_level: 25, unit_price: 50, supplier: "VetPharma India", expiry_date: "2027-01-15", status: "ok", created_at: "2025-01-01T00:00:00Z", updated_at: "2026-01-20T00:00:00Z" },
  { id: "item-007", name: "X-Ray Film (Pack)", category: "Equipment", quantity: 12, reorder_level: 5, unit_price: 2200, supplier: "DiagnoVet", status: "ok", created_at: "2025-06-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z" },
  { id: "item-008", name: "Antiseptic Solution 1L", category: "Consumables", quantity: 4, reorder_level: 8, unit_price: 280, supplier: "MedSupply Co", expiry_date: "2026-08-15", status: "low", created_at: "2025-01-01T00:00:00Z", updated_at: "2026-02-05T00:00:00Z" },
];

// ============= Dashboard Data =============

export const mockDashboardData: DashboardData = {
  todays_appointments: mockAppointments.filter((a) => a.date === today && a.status === "scheduled").length,
  pending_invoices: mockInvoices.filter((i) => i.status === "pending" || i.status === "overdue").length,
  total_pets: mockPets.length,
  total_owners: mockOwners.length,
  upcoming_appointments: mockAppointments.filter((a) => a.status === "scheduled").slice(0, 5),
  recent_invoices: mockInvoices.slice(0, 5),
  low_stock_items: mockInventory.filter((i) => i.status === "low" || i.status === "out"),
};
