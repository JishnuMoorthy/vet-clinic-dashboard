import type {
  User,
  LoginResponse,
  DashboardData,
  Pet,
  PetParent,
  Appointment,
  MedicalRecord,
  Invoice,
  InvoiceLineItem,
  Payment,
  InventoryItem,
  ReminderLog,
  MessageLog,
  PaginatedResponse,
} from "@/types/api";

// ============= Mock Users & Auth =============

interface MockCredential {
  email: string;
  password: string;
  user: User;
}

export const mockStaffList: User[] = [
  {
    id: "mock-admin-001",
    clinic_id: "clinic-001",
    email: "admin@pawscare.com",
    name: "Admin User",
    role: "admin",
    phone: "+91-9000000001",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "mock-vet-001",
    clinic_id: "clinic-001",
    email: "rajesh.sharma@pawscare.com",
    name: "Dr. Rajesh Sharma",
    role: "vet",
    phone: "+91-9000000002",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "mock-vet-002",
    clinic_id: "clinic-001",
    email: "priya.nair@pawscare.com",
    name: "Dr. Priya Nair",
    role: "vet",
    phone: "+91-9000000004",
    is_active: true,
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
  {
    id: "mock-staff-001",
    clinic_id: "clinic-001",
    email: "anjali@pawscare.com",
    name: "Anjali Patel",
    role: "staff",
    phone: "+91-9000000003",
    is_active: true,
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2025-01-15T00:00:00Z",
  },
];

const mockCredentials: MockCredential[] = [
  { email: "admin@pawscare.com", password: "Admin@2026!", user: mockStaffList[0] },
  { email: "rajesh.sharma@pawscare.com", password: "Vet@2026!", user: mockStaffList[1] },
  { email: "anjali@pawscare.com", password: "Staff@2026!", user: mockStaffList[3] },
];

export function mockLogin(email: string, password: string): LoginResponse {
  const match = mockCredentials.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!match) throw new Error("Invalid email or password");
  return {
    access_token: `mock-token-${match.user.id}-${Date.now()}`,
    user: match.user,
  };
}

// ============= Mock Pet Parents (Owners) =============

export const mockPetParents: PetParent[] = [
  {
    id: "owner-001", clinic_id: "clinic-001", name: "Vikram Mehta",
    email: "vikram@example.com", phone: "+91-9876543210",
    address: "42 MG Road, Bangalore", govt_id_reference: "AADHAR-1234",
    pets_count: 2, last_visit: "2026-02-10",
    created_at: "2025-03-01T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "owner-002", clinic_id: "clinic-001", name: "Sneha Reddy",
    email: "sneha.r@example.com", phone: "+91-9876543211",
    address: "15 Jubilee Hills, Hyderabad",
    pets_count: 1, last_visit: "2026-02-08",
    created_at: "2025-04-12T00:00:00Z", updated_at: "2026-02-08T00:00:00Z",
  },
  {
    id: "owner-003", clinic_id: "clinic-001", name: "Arjun Kapoor",
    email: "arjun.k@example.com", phone: "+91-9876543212",
    address: "78 Bandra West, Mumbai",
    pets_count: 3, last_visit: "2026-02-12",
    created_at: "2025-01-20T00:00:00Z", updated_at: "2026-02-12T00:00:00Z",
  },
  {
    id: "owner-004", clinic_id: "clinic-001", name: "Meera Joshi",
    email: "meera.j@example.com", phone: "+91-9876543213",
    address: "5 Connaught Place, Delhi",
    pets_count: 1, last_visit: "2026-01-25",
    created_at: "2025-06-10T00:00:00Z", updated_at: "2026-01-25T00:00:00Z",
  },
  {
    id: "owner-005", clinic_id: "clinic-001", name: "Rohit Singh",
    email: "rohit.s@example.com", phone: "+91-9876543214",
    address: "22 Park Street, Kolkata",
    pets_count: 2, last_visit: "2026-02-11",
    created_at: "2025-05-05T00:00:00Z", updated_at: "2026-02-11T00:00:00Z",
  },
];

// Legacy alias
export const mockOwners = mockPetParents;

// ============= Mock Pets =============

export const mockPets: Pet[] = [
  {
    id: "pet-001", clinic_id: "clinic-001", pet_parent_id: "owner-001",
    name: "Bruno", species: "Dog", breed: "Golden Retriever", gender: "male",
    date_of_birth: "2022-06-15", weight_kg: 32, microchip_id: "MC-001-2022",
    medical_notes: "Friendly, loves treats", pet_parent: mockPetParents[0],
    created_at: "2025-03-01T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "pet-002", clinic_id: "clinic-001", pet_parent_id: "owner-001",
    name: "Whiskers", species: "Cat", breed: "Persian", gender: "female",
    date_of_birth: "2023-01-20", weight_kg: 4.5,
    pet_parent: mockPetParents[0],
    created_at: "2025-03-01T00:00:00Z", updated_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "pet-003", clinic_id: "clinic-001", pet_parent_id: "owner-002",
    name: "Coco", species: "Dog", breed: "Labrador", gender: "female",
    date_of_birth: "2021-11-08", weight_kg: 28, microchip_id: "MC-003-2021",
    pet_parent: mockPetParents[1],
    created_at: "2025-04-12T00:00:00Z", updated_at: "2026-02-08T00:00:00Z",
  },
  {
    id: "pet-004", clinic_id: "clinic-001", pet_parent_id: "owner-003",
    name: "Max", species: "Dog", breed: "German Shepherd", gender: "male",
    date_of_birth: "2020-03-22", weight_kg: 38, microchip_id: "MC-004-2020",
    medical_notes: "Needs joint supplements",
    pet_parent: mockPetParents[2],
    created_at: "2025-01-20T00:00:00Z", updated_at: "2026-02-12T00:00:00Z",
  },
  {
    id: "pet-005", clinic_id: "clinic-001", pet_parent_id: "owner-003",
    name: "Nemo", species: "Fish", breed: "Clownfish", gender: "male",
    pet_parent: mockPetParents[2],
    created_at: "2025-07-01T00:00:00Z", updated_at: "2025-07-01T00:00:00Z",
  },
  {
    id: "pet-006", clinic_id: "clinic-001", pet_parent_id: "owner-003",
    name: "Milo", species: "Cat", breed: "Siamese", gender: "male",
    date_of_birth: "2024-05-10", weight_kg: 3.8,
    pet_parent: mockPetParents[2],
    created_at: "2025-08-01T00:00:00Z", updated_at: "2026-01-20T00:00:00Z",
  },
  {
    id: "pet-007", clinic_id: "clinic-001", pet_parent_id: "owner-004",
    name: "Bella", species: "Dog", breed: "Beagle", gender: "female",
    date_of_birth: "2023-08-14", weight_kg: 12,
    pet_parent: mockPetParents[3],
    created_at: "2025-06-10T00:00:00Z", updated_at: "2026-01-25T00:00:00Z",
  },
  {
    id: "pet-008", clinic_id: "clinic-001", pet_parent_id: "owner-005",
    name: "Rocky", species: "Dog", breed: "Rottweiler", gender: "male",
    date_of_birth: "2021-02-28", weight_kg: 45, microchip_id: "MC-008-2021",
    pet_parent: mockPetParents[4],
    created_at: "2025-05-05T00:00:00Z", updated_at: "2026-02-11T00:00:00Z",
  },
  {
    id: "pet-009", clinic_id: "clinic-001", pet_parent_id: "owner-005",
    name: "Luna", species: "Cat", breed: "Maine Coon", gender: "female",
    date_of_birth: "2024-01-01", weight_kg: 6,
    pet_parent: mockPetParents[4],
    created_at: "2025-05-05T00:00:00Z", updated_at: "2026-02-05T00:00:00Z",
  },
];

// ============= Mock Appointments =============

export const mockAppointments: Appointment[] = [
  {
    id: "appt-001", clinic_id: "clinic-001", pet_id: "pet-001", vet_id: "mock-vet-001",
    pet: mockPets[0], vet: mockStaffList[1],
    appointment_date: "2026-02-13", start_time: "09:00", end_time: "09:30",
    reason: "Annual vaccination", status: "scheduled",
    created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "appt-002", clinic_id: "clinic-001", pet_id: "pet-003", vet_id: "mock-vet-002",
    pet: mockPets[2], vet: mockStaffList[2],
    appointment_date: "2026-02-13", start_time: "10:00", end_time: "10:30",
    reason: "Skin checkup", notes: "Follow-up from last visit", status: "scheduled",
    created_at: "2026-02-05T00:00:00Z", updated_at: "2026-02-05T00:00:00Z",
  },
  {
    id: "appt-003", clinic_id: "clinic-001", pet_id: "pet-004", vet_id: "mock-vet-001",
    pet: mockPets[3], vet: mockStaffList[1],
    appointment_date: "2026-02-13", start_time: "11:30", end_time: "12:00",
    reason: "Joint pain assessment", status: "scheduled",
    created_at: "2026-02-07T00:00:00Z", updated_at: "2026-02-07T00:00:00Z",
  },
  {
    id: "appt-004", clinic_id: "clinic-001", pet_id: "pet-007", vet_id: "mock-vet-002",
    pet: mockPets[6], vet: mockStaffList[2],
    appointment_date: "2026-02-13", start_time: "14:00", end_time: "14:30",
    reason: "Dental cleaning", status: "scheduled",
    created_at: "2026-02-08T00:00:00Z", updated_at: "2026-02-08T00:00:00Z",
  },
  {
    id: "appt-005", clinic_id: "clinic-001", pet_id: "pet-008", vet_id: "mock-vet-001",
    pet: mockPets[7], vet: mockStaffList[1],
    appointment_date: "2026-02-13", start_time: "15:30", end_time: "16:00",
    reason: "Post-surgery follow-up", status: "scheduled",
    created_at: "2026-02-09T00:00:00Z", updated_at: "2026-02-09T00:00:00Z",
  },
  {
    id: "appt-006", clinic_id: "clinic-001", pet_id: "pet-002", vet_id: "mock-vet-001",
    pet: mockPets[1], vet: mockStaffList[1],
    appointment_date: "2026-02-10", start_time: "09:30", end_time: "10:00",
    reason: "Grooming consultation", status: "completed",
    created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "appt-007", clinic_id: "clinic-001", pet_id: "pet-009", vet_id: "mock-vet-002",
    pet: mockPets[8], vet: mockStaffList[2],
    appointment_date: "2026-02-14", start_time: "10:00", end_time: "10:30",
    reason: "General checkup", status: "scheduled",
    created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "appt-008", clinic_id: "clinic-001", pet_id: "pet-006", vet_id: "mock-vet-001",
    pet: mockPets[5], vet: mockStaffList[1],
    appointment_date: "2026-02-08", start_time: "11:00", end_time: "11:30",
    reason: "Vaccination", status: "cancelled",
    created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-07T00:00:00Z",
  },
];

// ============= Mock Medical Records =============

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "mr-001", clinic_id: "clinic-001", pet_id: "pet-001", vet_id: "mock-vet-001",
    visit_date: "2026-02-10", symptoms: "Lethargy, decreased appetite",
    diagnosis: "Mild viral infection", prescription: "Amoxicillin 250mg twice daily for 7 days",
    follow_up_date: "2026-02-17",
    pet: mockPets[0], vet: mockStaffList[1],
    created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "mr-002", clinic_id: "clinic-001", pet_id: "pet-003", vet_id: "mock-vet-002",
    visit_date: "2026-02-08", symptoms: "Itchy skin, hair loss on back",
    diagnosis: "Dermatitis - allergic reaction", prescription: "Medicated shampoo, antihistamines",
    pet: mockPets[2], vet: mockStaffList[2],
    created_at: "2026-02-08T00:00:00Z", updated_at: "2026-02-08T00:00:00Z",
  },
  {
    id: "mr-003", clinic_id: "clinic-001", pet_id: "pet-004", vet_id: "mock-vet-001",
    visit_date: "2026-01-15", symptoms: "Limping on right hind leg",
    diagnosis: "Early arthritis", prescription: "Joint supplements, reduced exercise",
    follow_up_date: "2026-02-13",
    pet: mockPets[3], vet: mockStaffList[1],
    created_at: "2026-01-15T00:00:00Z", updated_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "mr-004", clinic_id: "clinic-001", pet_id: "pet-008", vet_id: "mock-vet-001",
    visit_date: "2026-01-20", symptoms: "ACL tear, limping severely",
    diagnosis: "Torn anterior cruciate ligament", prescription: "Surgical repair performed",
    follow_up_date: "2026-02-13",
    pet: mockPets[7], vet: mockStaffList[1],
    created_at: "2026-01-20T00:00:00Z", updated_at: "2026-01-20T00:00:00Z",
  },
];

// ============= Mock Invoices =============

export const mockInvoices: Invoice[] = [
  {
    id: "inv-001", clinic_id: "clinic-001", pet_id: "pet-001",
    invoice_number: "INV-2026-001", total_amount: 2300, gst_amount: 414,
    status: "issued",
    line_items: [
      { description: "Annual Vaccination", quantity: 1, unit_price: 1500, total: 1500 },
      { description: "General Checkup", quantity: 1, unit_price: 800, total: 800 },
    ],
    pet: mockPets[0], owner: mockPetParents[0],
    created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "inv-002", clinic_id: "clinic-001", pet_id: "pet-003",
    invoice_number: "INV-2026-002", total_amount: 2500, gst_amount: 450,
    status: "paid",
    line_items: [
      { description: "Skin Treatment", quantity: 1, unit_price: 2000, total: 2000 },
      { description: "Medicated Shampoo", quantity: 2, unit_price: 350, total: 700 },
    ],
    pet: mockPets[2], owner: mockPetParents[1],
    created_at: "2026-01-28T00:00:00Z", updated_at: "2026-02-05T00:00:00Z",
  },
  {
    id: "inv-003", clinic_id: "clinic-001", pet_id: "pet-004",
    invoice_number: "INV-2026-003", total_amount: 4100, gst_amount: 738,
    status: "issued",
    line_items: [
      { description: "X-Ray", quantity: 2, unit_price: 1200, total: 2400 },
      { description: "Joint Supplements (30 days)", quantity: 1, unit_price: 900, total: 900 },
      { description: "Consultation", quantity: 1, unit_price: 800, total: 800 },
    ],
    pet: mockPets[3], owner: mockPetParents[2],
    created_at: "2026-01-15T00:00:00Z", updated_at: "2026-01-30T00:00:00Z",
  },
  {
    id: "inv-004", clinic_id: "clinic-001", pet_id: "pet-007",
    invoice_number: "INV-2026-004", total_amount: 3000, gst_amount: 540,
    status: "draft",
    line_items: [
      { description: "Dental Cleaning", quantity: 1, unit_price: 3000, total: 3000 },
    ],
    pet: mockPets[6], owner: mockPetParents[3],
    created_at: "2026-02-12T00:00:00Z", updated_at: "2026-02-12T00:00:00Z",
  },
  {
    id: "inv-005", clinic_id: "clinic-001", pet_id: "pet-008",
    invoice_number: "INV-2026-005", total_amount: 18000, gst_amount: 3240,
    status: "paid",
    line_items: [
      { description: "Surgery (ACL Repair)", quantity: 1, unit_price: 15000, total: 15000 },
      { description: "Anesthesia", quantity: 1, unit_price: 3000, total: 3000 },
      { description: "Post-Op Medications", quantity: 1, unit_price: 1200, total: 1200 },
    ],
    pet: mockPets[7], owner: mockPetParents[4],
    created_at: "2026-01-20T00:00:00Z", updated_at: "2026-02-01T00:00:00Z",
  },
];

// ============= Mock Payments =============

export const mockPayments: Payment[] = [
  {
    id: "pay-001", clinic_id: "clinic-001", invoice_id: "inv-002",
    payment_method: "upi", amount: 2500, status: "paid",
    reference_id: "UPI-REF-20260205-001", invoice: mockInvoices[1],
    created_at: "2026-02-05T00:00:00Z", updated_at: "2026-02-05T00:00:00Z",
  },
  {
    id: "pay-002", clinic_id: "clinic-001", invoice_id: "inv-005",
    payment_method: "card", amount: 18000, status: "paid",
    reference_id: "CARD-REF-20260201-002", invoice: mockInvoices[4],
    created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z",
  },
];

// ============= Mock Inventory =============

export const mockInventory: InventoryItem[] = [
  {
    id: "item-001", clinic_id: "clinic-001", name: "Rabies Vaccine",
    category: "Vaccines", quantity: 45, low_stock_threshold: 20,
    unit_price: 450, supplier: "VetPharma India", expiry_date: "2027-06-30",
    created_at: "2025-06-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "item-002", clinic_id: "clinic-001", name: "Amoxicillin 250mg",
    category: "Antibiotics", quantity: 8, low_stock_threshold: 15,
    unit_price: 120, supplier: "MedVet Supplies", expiry_date: "2026-12-31",
    created_at: "2025-04-01T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "item-003", clinic_id: "clinic-001", name: "Surgical Gloves (Box)",
    category: "Supplies", quantity: 3, low_stock_threshold: 10,
    unit_price: 350, supplier: "MedEquip Co",
    created_at: "2025-03-01T00:00:00Z", updated_at: "2026-02-12T00:00:00Z",
  },
  {
    id: "item-004", clinic_id: "clinic-001", name: "Flea & Tick Treatment",
    category: "Parasiticides", quantity: 0, low_stock_threshold: 10,
    unit_price: 680, supplier: "VetPharma India", expiry_date: "2027-03-15",
    created_at: "2025-05-01T00:00:00Z", updated_at: "2026-02-13T00:00:00Z",
  },
  {
    id: "item-005", clinic_id: "clinic-001", name: "IV Fluid (Saline 500ml)",
    category: "Fluids", quantity: 25, low_stock_threshold: 10,
    unit_price: 180, supplier: "MedEquip Co", expiry_date: "2027-09-30",
    created_at: "2025-07-01T00:00:00Z", updated_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "item-006", clinic_id: "clinic-001", name: "Bandage Roll (10cm)",
    category: "Supplies", quantity: 50, low_stock_threshold: 20,
    unit_price: 45, supplier: "MedEquip Co",
    created_at: "2025-06-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "item-007", clinic_id: "clinic-001", name: "Deworming Tablets",
    category: "Parasiticides", quantity: 5, low_stock_threshold: 15,
    unit_price: 90, supplier: "VetPharma India", expiry_date: "2026-08-31",
    created_at: "2025-04-15T00:00:00Z", updated_at: "2026-02-08T00:00:00Z",
  },
];

// ============= Mock Reminder Logs =============

export const mockReminderLogs: ReminderLog[] = [
  {
    id: "rem-001", clinic_id: "clinic-001", entity_type: "appointment",
    entity_id: "appt-001", channel: "whatsapp", status: "sent",
    sent_at: "2026-02-12T09:00:00Z", created_at: "2026-02-12T09:00:00Z",
  },
  {
    id: "rem-002", clinic_id: "clinic-001", entity_type: "payment",
    entity_id: "inv-003", channel: "whatsapp", status: "sent",
    sent_at: "2026-02-10T10:00:00Z", created_at: "2026-02-10T10:00:00Z",
  },
  {
    id: "rem-003", clinic_id: "clinic-001", entity_type: "vaccination",
    entity_id: "pet-007", channel: "whatsapp", status: "failed",
    failure_reason: "Phone number not on WhatsApp",
    created_at: "2026-02-11T08:30:00Z",
  },
];

// ============= Mock Message Logs =============

export const mockMessageLogs: MessageLog[] = [
  {
    id: "msg-001", clinic_id: "clinic-001", recipient_phone: "+91-9876543210",
    template_name: "appointment_reminder", status: "sent",
    payload: { pet_name: "Bruno", date: "2026-02-13", time: "09:00" },
    provider_message_id: "wamid-001",
    created_at: "2026-02-12T09:00:00Z",
  },
  {
    id: "msg-002", clinic_id: "clinic-001", recipient_phone: "+91-9876543212",
    template_name: "payment_reminder", status: "sent",
    payload: { invoice_number: "INV-2026-003", amount: "₹4,100" },
    provider_message_id: "wamid-002",
    created_at: "2026-02-10T10:00:00Z",
  },
  {
    id: "msg-003", clinic_id: "clinic-001", recipient_phone: "+91-9876543213",
    template_name: "vaccination_due", status: "failed",
    payload: { pet_name: "Bella", vaccine: "Rabies booster" },
    created_at: "2026-02-11T08:30:00Z",
  },
];

// ============= Dashboard Data =============

export const mockDashboardData: DashboardData = {
  todays_appointments: 5,
  pending_invoices: 2,
  total_pets: mockPets.length,
  total_owners: mockPetParents.length,
  upcoming_appointments: mockAppointments.filter((a) => a.status === "scheduled").slice(0, 5),
  recent_invoices: mockInvoices.slice(0, 3),
  low_stock_items: mockInventory.filter((i) => i.quantity <= i.low_stock_threshold),
};

// ============= Helper for pagination =============

export function paginate<T>(items: T[], skip = 0, limit = 50): PaginatedResponse<T> {
  const paged = items.slice(skip, skip + limit);
  return {
    items: paged,
    total: items.length,
    skip,
    limit,
  };
}
