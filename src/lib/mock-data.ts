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
  MedicalRecord,
  Vaccination,
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

// ============= Mock Medical Records =============

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "rec-001", pet_id: "pet-001", appointment_id: "apt-008", vet_id: "mock-vet-001", vet: mockUsers[1],
    visit_date: "2026-02-10", chief_complaint: "Annual vaccination due",
    symptoms: "No symptoms reported — routine visit", duration_onset: "N/A", appetite_behavior: "Normal appetite, active and playful",
    weight_kg: 32, temperature_f: 101.2, heart_rate_bpm: 80, respiratory_rate: 18, body_condition_score: 6,
    physical_exam_findings: "Healthy coat, clear eyes and ears, no abnormalities detected. Teeth slightly tartar-buildup on upper molars.",
    primary_diagnosis: "Healthy — routine checkup", severity: "mild",
    prescriptions: [{ medication: "Rabies Vaccine", dosage: "1 mL", frequency: "Single dose", duration: "Annual" }],
    procedures_performed: "Rabies vaccination administered", follow_up_instructions: "Monitor injection site for 48 hours. Next annual vaccination due Feb 2027.",
    next_appointment_recommendation: "1 year", created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "rec-002", pet_id: "pet-003", vet_id: "mock-vet-001", vet: mockUsers[1],
    visit_date: "2026-01-20", chief_complaint: "Persistent scratching and hair loss on left ear",
    symptoms: "Owner reports excessive scratching for 2 weeks, hair loss around left ear, redness visible",
    duration_onset: "2 weeks", appetite_behavior: "Reduced appetite, slightly lethargic", prior_treatments: "Owner tried coconut oil topically — no improvement",
    weight_kg: 37.5, temperature_f: 102.0, heart_rate_bpm: 90, respiratory_rate: 22, body_condition_score: 5,
    physical_exam_findings: "Erythema and excoriation around left pinna. Mild secondary bacterial infection. No mites detected on skin scrape.",
    diagnostic_results: "Skin scrape negative for mites. Cytology shows bacterial overgrowth.",
    primary_diagnosis: "Allergic dermatitis with secondary bacterial infection", differential_diagnoses: "Contact allergy, food allergy, atopic dermatitis",
    severity: "moderate",
    prescriptions: [
      { medication: "Cephalexin", dosage: "500 mg", frequency: "Twice daily", duration: "14 days" },
      { medication: "Apoquel", dosage: "16 mg", frequency: "Once daily", duration: "30 days" },
    ],
    follow_up_instructions: "Keep area clean and dry. Prevent scratching with e-collar if needed. Return in 2 weeks for recheck.",
    next_appointment_recommendation: "2 weeks", created_at: "2026-01-20T00:00:00Z", updated_at: "2026-01-20T00:00:00Z",
  },
  {
    id: "rec-003", pet_id: "pet-004", vet_id: "mock-vet-002", vet: mockUsers[2],
    visit_date: "2026-01-15", chief_complaint: "Dental checkup — bad breath reported",
    symptoms: "Owner noticed foul breath for past month, reluctance to eat hard food",
    duration_onset: "1 month", appetite_behavior: "Prefers wet food, avoids kibble",
    weight_kg: 3.6, temperature_f: 101.5, heart_rate_bpm: 160, respiratory_rate: 28, body_condition_score: 4,
    physical_exam_findings: "Grade 2 periodontal disease. Gingivitis on upper premolars. Two teeth with moderate tartar buildup.",
    primary_diagnosis: "Periodontal disease — Grade 2", severity: "moderate",
    prescriptions: [
      { medication: "Clindamycin", dosage: "25 mg", frequency: "Twice daily", duration: "10 days" },
    ],
    procedures_performed: "Dental scaling and polishing under sedation",
    follow_up_instructions: "Soft food for 3 days post-procedure. Begin daily dental treats. Brush teeth 3x weekly.",
    next_appointment_recommendation: "6 months", created_at: "2026-01-15T00:00:00Z", updated_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "rec-004", pet_id: "pet-008", vet_id: "mock-vet-002", vet: mockUsers[2],
    visit_date: "2026-02-01", chief_complaint: "Limping on hind left leg after fall",
    symptoms: "Dog fell from terrace steps 2 days ago, limping since, whimpers when leg is touched",
    duration_onset: "2 days", appetite_behavior: "Normal appetite, less active than usual", prior_treatments: "Owner applied ice pack",
    weight_kg: 20, temperature_f: 101.8, heart_rate_bpm: 100, respiratory_rate: 24, body_condition_score: 5,
    physical_exam_findings: "Swelling and tenderness on left stifle. No crepitus. Drawer sign negative.",
    diagnostic_results: "X-ray shows no fracture. Mild soft tissue swelling consistent with sprain.",
    primary_diagnosis: "Left stifle sprain — Grade I", differential_diagnoses: "Partial CCL tear", severity: "mild",
    prescriptions: [
      { medication: "Meloxicam", dosage: "0.1 mg/kg", frequency: "Once daily with food", duration: "7 days" },
      { medication: "Tramadol", dosage: "2 mg/kg", frequency: "Twice daily", duration: "5 days" },
    ],
    follow_up_instructions: "Strict rest for 2 weeks — leash walks only. No jumping or running. Apply cold compress 10 min twice daily.",
    next_appointment_recommendation: "2 weeks", created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "rec-005", pet_id: "pet-009", vet_id: "mock-vet-002", vet: mockUsers[2],
    visit_date: "2026-02-09", chief_complaint: "Eye discharge and squinting",
    symptoms: "Watery discharge from left eye for 3 days, squinting in bright light",
    duration_onset: "3 days", appetite_behavior: "Normal",
    weight_kg: 5, temperature_f: 101.0, heart_rate_bpm: 180, respiratory_rate: 30, body_condition_score: 5,
    physical_exam_findings: "Conjunctival hyperemia left eye. Serous discharge. No corneal ulcer on fluorescein stain. Third eyelid slightly elevated.",
    diagnostic_results: "Fluorescein test negative. Schirmer tear test normal.",
    primary_diagnosis: "Viral conjunctivitis", differential_diagnoses: "Feline herpesvirus-1, allergic conjunctivitis", severity: "mild",
    prescriptions: [
      { medication: "Tobramycin eye drops", dosage: "1 drop", frequency: "Three times daily", duration: "7 days" },
      { medication: "L-Lysine supplement", dosage: "250 mg", frequency: "Once daily", duration: "30 days" },
    ],
    follow_up_instructions: "Keep eye clean with saline wipes. Monitor for worsening or green discharge.",
    next_appointment_recommendation: "1 week if not improving", created_at: "2026-02-09T00:00:00Z", updated_at: "2026-02-09T00:00:00Z",
  },
  {
    id: "rec-006", pet_id: "pet-005", vet_id: "mock-vet-001", vet: mockUsers[1],
    visit_date: "2026-02-10", chief_complaint: "Blood work follow-up — annual screening",
    symptoms: "No symptoms — routine wellness check",
    weight_kg: 29, temperature_f: 101.4, heart_rate_bpm: 75, respiratory_rate: 16, body_condition_score: 7,
    physical_exam_findings: "Overweight. Mild tartar on teeth. Otherwise healthy.",
    diagnostic_results: "CBC and chemistry panel within normal limits. Slight elevation in ALT (68 U/L) — monitor.",
    primary_diagnosis: "Healthy — overweight", severity: "mild",
    prescriptions: [],
    follow_up_instructions: "Reduce daily food intake by 15%. Increase daily walks to 30+ min. Recheck ALT in 3 months.",
    next_appointment_recommendation: "3 months", created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
  },
];

// ============= Mock Vaccinations =============

export const mockVaccinations: Vaccination[] = [
  { id: "vax-001", pet_id: "pet-001", vaccine_name: "Rabies", date_administered: "2026-02-10", next_due_date: "2027-02-10", batch_number: "RB-2026-4421", administered_by_id: "mock-vet-001", administered_by: mockUsers[1], created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z" },
  { id: "vax-002", pet_id: "pet-001", vaccine_name: "DHPP", date_administered: "2025-08-15", next_due_date: "2026-08-15", batch_number: "DH-2025-1102", administered_by_id: "mock-vet-001", administered_by: mockUsers[1], created_at: "2025-08-15T00:00:00Z", updated_at: "2025-08-15T00:00:00Z" },
  { id: "vax-003", pet_id: "pet-003", vaccine_name: "Rabies", date_administered: "2025-06-20", next_due_date: "2026-06-20", batch_number: "RB-2025-3305", administered_by_id: "mock-vet-001", administered_by: mockUsers[1], created_at: "2025-06-20T00:00:00Z", updated_at: "2025-06-20T00:00:00Z" },
  { id: "vax-004", pet_id: "pet-004", vaccine_name: "FVRCP", date_administered: "2025-04-10", next_due_date: "2026-01-10", batch_number: "FV-2025-0982", administered_by_id: "mock-vet-002", administered_by: mockUsers[2], created_at: "2025-04-10T00:00:00Z", updated_at: "2025-04-10T00:00:00Z" },
  { id: "vax-005", pet_id: "pet-005", vaccine_name: "DHPP", date_administered: "2025-03-01", next_due_date: "2026-03-01", batch_number: "DH-2025-0567", administered_by_id: "mock-vet-001", administered_by: mockUsers[1], created_at: "2025-03-01T00:00:00Z", updated_at: "2025-03-01T00:00:00Z" },
  { id: "vax-006", pet_id: "pet-002", vaccine_name: "FVRCP", date_administered: "2025-09-12", next_due_date: "2026-09-12", batch_number: "FV-2025-2210", administered_by_id: "mock-vet-002", administered_by: mockUsers[2], created_at: "2025-09-12T00:00:00Z", updated_at: "2025-09-12T00:00:00Z" },
  { id: "vax-007", pet_id: "pet-007", vaccine_name: "Rabies", date_administered: "2025-01-15", next_due_date: "2026-01-15", batch_number: "RB-2025-0089", administered_by_id: "mock-vet-001", administered_by: mockUsers[1], created_at: "2025-01-15T00:00:00Z", updated_at: "2025-01-15T00:00:00Z" },
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
