import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // === CONSTANTS ===
    const CLINIC_ID = "d48c814a-0d9f-4615-a925-9a355a0564c1";
    const ADMIN_ID = "10d037fd-8ec7-4f76-8a15-83725fdd8e5b";
    const VET1_ID = "1d81cb72-f9a8-4025-b6cc-d6072e496475"; // drsmith
    const VET2_ID = "39ac7f8a-d7d2-4066-81d0-9f2efcf2972a"; // radhika
    const VET3_ID = "f52a20b3-efb8-4f65-a8a0-1ecffebb886c"; // mohit
    const STAFF_ID = "5f84a9be-ddcd-4e26-b131-75d0c81498ac";

    // Owner UUIDs
    const O = {
      o1: "a0000001-0000-0000-0000-000000000001",
      o2: "a0000001-0000-0000-0000-000000000002",
      o3: "a0000001-0000-0000-0000-000000000003",
      o4: "a0000001-0000-0000-0000-000000000004",
      o5: "a0000001-0000-0000-0000-000000000005",
      o6: "a0000001-0000-0000-0000-000000000006",
      o7: "a0000001-0000-0000-0000-000000000007",
      o8: "a0000001-0000-0000-0000-000000000008",
      o9: "a0000001-0000-0000-0000-000000000009",
      o10: "a0000001-0000-0000-0000-000000000010",
      o11: "a0000001-0000-0000-0000-000000000011",
      o12: "a0000001-0000-0000-0000-000000000012",
      o13: "a0000001-0000-0000-0000-000000000013",
      o14: "a0000001-0000-0000-0000-000000000014",
      o15: "a0000001-0000-0000-0000-000000000015",
    };

    // Pet UUIDs
    const P = {
      p1: "b0000001-0000-0000-0000-000000000001",
      p2: "b0000001-0000-0000-0000-000000000002",
      p3: "b0000001-0000-0000-0000-000000000003",
      p4: "b0000001-0000-0000-0000-000000000004",
      p5: "b0000001-0000-0000-0000-000000000005",
      p6: "b0000001-0000-0000-0000-000000000006",
      p7: "b0000001-0000-0000-0000-000000000007",
      p8: "b0000001-0000-0000-0000-000000000008",
      p9: "b0000001-0000-0000-0000-000000000009",
      p10: "b0000001-0000-0000-0000-000000000010",
      p11: "b0000001-0000-0000-0000-000000000011",
      p12: "b0000001-0000-0000-0000-000000000012",
      p13: "b0000001-0000-0000-0000-000000000013",
      p14: "b0000001-0000-0000-0000-000000000014",
      p15: "b0000001-0000-0000-0000-000000000015",
      p16: "b0000001-0000-0000-0000-000000000016",
      p17: "b0000001-0000-0000-0000-000000000017",
      p18: "b0000001-0000-0000-0000-000000000018",
      p19: "b0000001-0000-0000-0000-000000000019",
      p20: "b0000001-0000-0000-0000-000000000020",
      p21: "b0000001-0000-0000-0000-000000000021",
      p22: "b0000001-0000-0000-0000-000000000022",
      p23: "b0000001-0000-0000-0000-000000000023",
      p24: "b0000001-0000-0000-0000-000000000024",
      p25: "b0000001-0000-0000-0000-000000000025",
    };

    // Appointment UUIDs
    const A: Record<string, string> = {};
    for (let i = 1; i <= 20; i++) {
      A[`a${i}`] = `c0000001-0000-0000-0000-${String(i).padStart(12, "0")}`;
    }

    // Service UUIDs
    const S: Record<string, string> = {};
    for (let i = 1; i <= 12; i++) {
      S[`s${i}`] = `d0000001-0000-0000-0000-${String(i).padStart(12, "0")}`;
    }

    // Invoice UUIDs
    const INV: Record<string, string> = {};
    for (let i = 1; i <= 10; i++) {
      INV[`i${i}`] = `e0000001-0000-0000-0000-${String(i).padStart(12, "0")}`;
    }

    // Inventory UUIDs
    const IT: Record<string, string> = {};
    for (let i = 1; i <= 15; i++) {
      IT[`t${i}`] = `f0000001-0000-0000-0000-${String(i).padStart(12, "0")}`;
    }

    // Medical Record UUIDs
    const MR: Record<string, string> = {};
    for (let i = 1; i <= 10; i++) {
      MR[`m${i}`] = `70000001-0000-0000-0000-${String(i).padStart(12, "0")}`;
    }

    // Vaccination UUIDs
    const V: Record<string, string> = {};
    for (let i = 1; i <= 12; i++) {
      V[`v${i}`] = `80000001-0000-0000-0000-${String(i).padStart(12, "0")}`;
    }

    // Medicine UUIDs
    const MED: Record<string, string> = {};
    for (let i = 1; i <= 8; i++) {
      MED[`md${i}`] = `90000001-0000-0000-0000-${String(i).padStart(12, "0")}`;
    }

    // === STEP 1: DELETE ALL DATA (order matters for referential integrity) ===
    const deleteTables = [
      "vaccinations", "prescriptions", "medical_records", "payments",
      "invoices", "appointments", "pet_documents", "pets", "pet_owners",
      "inventory", "services", "medicines", "message_logs", "reminder_logs"
    ];

    for (const table of deleteTables) {
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) console.error(`Delete ${table}:`, error.message);
    }

    // === STEP 2: UPDATE CLINIC ===
    await supabase.from("clinics").update({
      name: "Mia Vet Clinic",
      address: "102, Pali Hill Road, Bandra West, Mumbai, Maharashtra 400050",
      phone: "+91-22-2600-1234",
      email: "hello@miavet.com",
      license_number: "MH-VET-2024-00487",
      established_date: "2020-03-15",
    }).eq("id", CLINIC_ID);

    // === STEP 3: UPDATE USER NAMES ===
    await supabase.from("users").update({ name: "Dr. Mia Sharma", phone: "+91-98200-11001", specialties: ["clinic_management", "general_practice"] }).eq("id", ADMIN_ID);
    await supabase.from("users").update({ name: "Dr. Rajesh Iyer", phone: "+91-98200-22002", specialties: ["dermatology", "internal_medicine"] }).eq("id", VET1_ID);
    await supabase.from("users").update({ name: "Dr. Radhika Menon", phone: "+91-98200-33003", specialties: ["surgery", "orthopedics"] }).eq("id", VET2_ID);
    await supabase.from("users").update({ name: "Dr. Mohit Patil", phone: "+91-98200-44004", specialties: ["dentistry", "emergency_care"] }).eq("id", VET3_ID);
    await supabase.from("users").update({ name: "Anjali Patel", phone: "+91-98200-55005" }).eq("id", STAFF_ID);

    // === STEP 4: PET OWNERS ===
    const owners = [
      { id: O.o1, clinic_id: CLINIC_ID, name: "Priya Kapoor", email: "priya.kapoor@gmail.com", phone: "+91-98765-43210", address: "14, Carter Road, Bandra West", city: "Mumbai", state: "Maharashtra", zip_code: "400050" },
      { id: O.o2, clinic_id: CLINIC_ID, name: "Amit Deshmukh", email: "amit.deshmukh@yahoo.com", phone: "+91-98765-43211", address: "7B, Hiranandani Gardens, Powai", city: "Mumbai", state: "Maharashtra", zip_code: "400076" },
      { id: O.o3, clinic_id: CLINIC_ID, name: "Sneha Nair", email: "sneha.nair@outlook.com", phone: "+91-98765-43212", address: "22, Koregaon Park", city: "Pune", state: "Maharashtra", zip_code: "411001" },
      { id: O.o4, clinic_id: CLINIC_ID, name: "Vikram Reddy", email: "vikram.reddy@gmail.com", phone: "+91-98765-43213", address: "45, Indiranagar, 100 Feet Road", city: "Bangalore", state: "Karnataka", zip_code: "560038" },
      { id: O.o5, clinic_id: CLINIC_ID, name: "Ananya Joshi", email: "ananya.joshi@gmail.com", phone: "+91-98765-43214", address: "8, Juhu Scheme, Vile Parle West", city: "Mumbai", state: "Maharashtra", zip_code: "400049" },
      { id: O.o6, clinic_id: CLINIC_ID, name: "Rohan Mehta", email: "rohan.mehta@hotmail.com", phone: "+91-98765-43215", address: "3rd Floor, Palm Beach Road, Vashi", city: "Navi Mumbai", state: "Maharashtra", zip_code: "400703" },
      { id: O.o7, clinic_id: CLINIC_ID, name: "Kavita Sharma", email: "kavita.sharma@gmail.com", phone: "+91-98765-43216", address: "12, SB Road, Deccan Gymkhana", city: "Pune", state: "Maharashtra", zip_code: "411004" },
      { id: O.o8, clinic_id: CLINIC_ID, name: "Suresh Pillai", email: "suresh.pillai@yahoo.com", phone: "+91-98765-43217", address: "56, Linking Road, Santacruz West", city: "Mumbai", state: "Maharashtra", zip_code: "400054" },
      { id: O.o9, clinic_id: CLINIC_ID, name: "Deepa Gupta", email: "deepa.gupta@gmail.com", phone: "+91-98765-43218", address: "9, Aundh Road", city: "Pune", state: "Maharashtra", zip_code: "411007" },
      { id: O.o10, clinic_id: CLINIC_ID, name: "Arjun Singh", email: "arjun.singh@gmail.com", phone: "+91-98765-43219", address: "18, Versova, Andheri West", city: "Mumbai", state: "Maharashtra", zip_code: "400061" },
      { id: O.o11, clinic_id: CLINIC_ID, name: "Meera Krishnan", email: "meera.k@gmail.com", phone: "+91-98765-43220", address: "31, Hill Road, Bandra West", city: "Mumbai", state: "Maharashtra", zip_code: "400050" },
      { id: O.o12, clinic_id: CLINIC_ID, name: "Rahul Tiwari", email: "rahul.tiwari@outlook.com", phone: "+91-98765-43221", address: "5A, Magarpatta City", city: "Pune", state: "Maharashtra", zip_code: "411028" },
      { id: O.o13, clinic_id: CLINIC_ID, name: "Nisha Patel", email: "nisha.patel@gmail.com", phone: "+91-98765-43222", address: "27, Worli Sea Face", city: "Mumbai", state: "Maharashtra", zip_code: "400018" },
      { id: O.o14, clinic_id: CLINIC_ID, name: "Karan Malhotra", email: "karan.m@yahoo.com", phone: "+91-98765-43223", address: "10, Colaba Causeway", city: "Mumbai", state: "Maharashtra", zip_code: "400005" },
      { id: O.o15, clinic_id: CLINIC_ID, name: "Lakshmi Rao", email: "lakshmi.rao@gmail.com", phone: "+91-98765-43224", address: "42, JP Nagar, 6th Phase", city: "Bangalore", state: "Karnataka", zip_code: "560078" },
    ];
    const { error: ownerErr } = await supabase.from("pet_owners").insert(owners);
    if (ownerErr) console.error("Owners:", ownerErr.message);

    // === STEP 5: PETS (25) ===
    const pets = [
      { id: P.p1, clinic_id: CLINIC_ID, owner_id: O.o1, name: "Bruno", species: "Dog", breed: "Labrador Retriever", gender: "male", date_of_birth: "2022-06-15", weight_kg: 28.5, color: "Golden", health_status: "healthy", microchip_id: "IN-900-001-234-567" },
      { id: P.p2, clinic_id: CLINIC_ID, owner_id: O.o1, name: "Cleo", species: "Cat", breed: "Persian", gender: "female", date_of_birth: "2023-01-20", weight_kg: 4.2, color: "White", health_status: "healthy" },
      { id: P.p3, clinic_id: CLINIC_ID, owner_id: O.o2, name: "Simba", species: "Dog", breed: "Golden Retriever", gender: "male", date_of_birth: "2021-03-10", weight_kg: 32.0, color: "Golden", health_status: "healthy", microchip_id: "IN-900-002-345-678" },
      { id: P.p4, clinic_id: CLINIC_ID, owner_id: O.o2, name: "Whiskers", species: "Cat", breed: "Indian Domestic Shorthair", gender: "male", date_of_birth: "2023-08-05", weight_kg: 3.8, color: "Tabby", health_status: "healthy" },
      { id: P.p5, clinic_id: CLINIC_ID, owner_id: O.o3, name: "Tiger", species: "Dog", breed: "German Shepherd", gender: "male", date_of_birth: "2020-11-22", weight_kg: 35.0, color: "Black & Tan", health_status: "caution", microchip_id: "IN-900-003-456-789" },
      { id: P.p6, clinic_id: CLINIC_ID, owner_id: O.o4, name: "Lucky", species: "Dog", breed: "Indian Spitz", gender: "female", date_of_birth: "2022-09-14", weight_kg: 8.5, color: "White", health_status: "healthy" },
      { id: P.p7, clinic_id: CLINIC_ID, owner_id: O.o5, name: "Sheru", species: "Dog", breed: "Pomeranian", gender: "male", date_of_birth: "2023-04-02", weight_kg: 3.2, color: "Orange", health_status: "healthy", microchip_id: "IN-900-005-678-901" },
      { id: P.p8, clinic_id: CLINIC_ID, owner_id: O.o5, name: "Mitthu", species: "Bird", breed: "Indian Ringneck Parrot", gender: "male", date_of_birth: "2022-01-10", weight_kg: 0.13, color: "Green", health_status: "healthy" },
      { id: P.p9, clinic_id: CLINIC_ID, owner_id: O.o6, name: "Golu", species: "Dog", breed: "Beagle", gender: "male", date_of_birth: "2021-07-30", weight_kg: 12.5, color: "Tricolor", health_status: "healthy", microchip_id: "IN-900-006-789-012" },
      { id: P.p10, clinic_id: CLINIC_ID, owner_id: O.o6, name: "Moti", species: "Dog", breed: "Rottweiler", gender: "male", date_of_birth: "2020-05-18", weight_kg: 42.0, color: "Black & Mahogany", health_status: "healthy", microchip_id: "IN-900-006-890-123" },
      { id: P.p11, clinic_id: CLINIC_ID, owner_id: O.o7, name: "Bella", species: "Dog", breed: "Shih Tzu", gender: "female", date_of_birth: "2023-02-14", weight_kg: 5.5, color: "White & Brown", health_status: "healthy" },
      { id: P.p12, clinic_id: CLINIC_ID, owner_id: O.o8, name: "Raja", species: "Dog", breed: "Indian Pariah", gender: "male", date_of_birth: "2021-12-01", weight_kg: 18.0, color: "Brown", health_status: "healthy", microchip_id: "IN-900-008-012-345" },
      { id: P.p13, clinic_id: CLINIC_ID, owner_id: O.o9, name: "Princess", species: "Cat", breed: "Siamese", gender: "female", date_of_birth: "2022-05-25", weight_kg: 3.5, color: "Seal Point", health_status: "healthy" },
      { id: P.p14, clinic_id: CLINIC_ID, owner_id: O.o9, name: "Bunny", species: "Rabbit", breed: "Holland Lop", gender: "female", date_of_birth: "2024-01-10", weight_kg: 1.8, color: "White & Brown", health_status: "healthy" },
      { id: P.p15, clinic_id: CLINIC_ID, owner_id: O.o10, name: "Max", species: "Dog", breed: "Labrador Retriever", gender: "male", date_of_birth: "2023-06-20", weight_kg: 25.0, color: "Black", health_status: "healthy", microchip_id: "IN-900-010-234-567" },
      { id: P.p16, clinic_id: CLINIC_ID, owner_id: O.o11, name: "Cookie", species: "Dog", breed: "Cocker Spaniel", gender: "female", date_of_birth: "2022-10-08", weight_kg: 11.0, color: "Golden", health_status: "caution" },
      { id: P.p17, clinic_id: CLINIC_ID, owner_id: O.o12, name: "Rocky", species: "Dog", breed: "Doberman", gender: "male", date_of_birth: "2021-01-15", weight_kg: 38.0, color: "Black & Rust", health_status: "healthy", microchip_id: "IN-900-012-456-789" },
      { id: P.p18, clinic_id: CLINIC_ID, owner_id: O.o12, name: "Ginny", species: "Cat", breed: "Persian", gender: "female", date_of_birth: "2023-09-12", weight_kg: 3.0, color: "Calico", health_status: "healthy" },
      { id: P.p19, clinic_id: CLINIC_ID, owner_id: O.o13, name: "Cheeku", species: "Dog", breed: "Pug", gender: "male", date_of_birth: "2022-04-18", weight_kg: 7.8, color: "Fawn", health_status: "healthy" },
      { id: P.p20, clinic_id: CLINIC_ID, owner_id: O.o13, name: "Shadow", species: "Cat", breed: "Bombay", gender: "male", date_of_birth: "2023-07-01", weight_kg: 4.0, color: "Black", health_status: "healthy" },
      { id: P.p21, clinic_id: CLINIC_ID, owner_id: O.o14, name: "Oscar", species: "Dog", breed: "French Bulldog", gender: "male", date_of_birth: "2023-03-22", weight_kg: 11.5, color: "Brindle", health_status: "healthy" },
      { id: P.p22, clinic_id: CLINIC_ID, owner_id: O.o14, name: "Nemo", species: "Dog", breed: "Dachshund", gender: "male", date_of_birth: "2022-08-30", weight_kg: 9.0, color: "Red", health_status: "healthy" },
      { id: P.p23, clinic_id: CLINIC_ID, owner_id: O.o15, name: "Laila", species: "Dog", breed: "Golden Retriever", gender: "female", date_of_birth: "2021-11-05", weight_kg: 27.0, color: "Golden", health_status: "healthy", microchip_id: "IN-900-015-789-012" },
      { id: P.p24, clinic_id: CLINIC_ID, owner_id: O.o15, name: "Pepper", species: "Cat", breed: "Indian Domestic Shorthair", gender: "female", date_of_birth: "2024-02-14", weight_kg: 2.5, color: "Black & White", health_status: "healthy" },
      { id: P.p25, clinic_id: CLINIC_ID, owner_id: O.o3, name: "Buddy", species: "Dog", breed: "Labrador Retriever", gender: "male", date_of_birth: "2023-10-01", weight_kg: 22.0, color: "Chocolate", health_status: "healthy" },
    ];
    const { error: petErr } = await supabase.from("pets").insert(pets);
    if (petErr) console.error("Pets:", petErr.message);

    // === STEP 6: SERVICES (12) ===
    const services = [
      { id: S.s1, clinic_id: CLINIC_ID, name: "General Consultation", category: "consultation", price: 500, description: "Standard veterinary consultation and physical exam", is_active: true },
      { id: S.s2, clinic_id: CLINIC_ID, name: "Vaccination - Anti-Rabies", category: "vaccination", price: 800, description: "Anti-rabies vaccine (Defensor/Nobivac Rabies)", is_active: true },
      { id: S.s3, clinic_id: CLINIC_ID, name: "Vaccination - DHPP", category: "vaccination", price: 1200, description: "Distemper, Hepatitis, Parvovirus, Parainfluenza combo vaccine", is_active: true },
      { id: S.s4, clinic_id: CLINIC_ID, name: "Dental Cleaning", category: "procedure", price: 2500, description: "Professional dental scaling and polishing under sedation", is_active: true },
      { id: S.s5, clinic_id: CLINIC_ID, name: "Spay Surgery (Female)", category: "surgery", price: 5000, description: "Ovariohysterectomy for female dogs/cats", is_active: true },
      { id: S.s6, clinic_id: CLINIC_ID, name: "Neuter Surgery (Male)", category: "surgery", price: 3500, description: "Castration surgery for male dogs/cats", is_active: true },
      { id: S.s7, clinic_id: CLINIC_ID, name: "X-Ray (Digital)", category: "diagnostic", price: 1500, description: "Digital radiograph, single view", is_active: true },
      { id: S.s8, clinic_id: CLINIC_ID, name: "Blood Test - CBC", category: "diagnostic", price: 800, description: "Complete blood count with differential", is_active: true },
      { id: S.s9, clinic_id: CLINIC_ID, name: "Deworming", category: "medication", price: 300, description: "Broad-spectrum deworming tablet/syrup", is_active: true },
      { id: S.s10, clinic_id: CLINIC_ID, name: "Tick & Flea Treatment", category: "procedure", price: 600, description: "Topical tick and flea treatment (Fipronil/Permethrin)", is_active: true },
      { id: S.s11, clinic_id: CLINIC_ID, name: "Full Grooming", category: "grooming", price: 1200, description: "Bath, haircut, nail trim, ear cleaning", is_active: true },
      { id: S.s12, clinic_id: CLINIC_ID, name: "Emergency Consultation", category: "consultation", price: 1500, description: "After-hours emergency veterinary consultation", is_active: true },
    ];
    const { error: svcErr } = await supabase.from("services").insert(services);
    if (svcErr) console.error("Services:", svcErr.message);

    // === STEP 7: INVENTORY (15) ===
    const inventory = [
      { id: IT.t1, clinic_id: CLINIC_ID, item_name: "Rabies Vaccine (Defensor)", item_type: "vaccine", quantity: 45, low_stock_threshold: 10, cost_per_unit: 180, supplier: "Zoetis India", unit: "vial", last_restocked_date: "2026-03-15" },
      { id: IT.t2, clinic_id: CLINIC_ID, item_name: "DHPP Vaccine (Nobivac)", item_type: "vaccine", quantity: 30, low_stock_threshold: 10, cost_per_unit: 350, supplier: "MSD Animal Health", unit: "vial", last_restocked_date: "2026-03-10" },
      { id: IT.t3, clinic_id: CLINIC_ID, item_name: "Leptospirosis Vaccine", item_type: "vaccine", quantity: 8, low_stock_threshold: 10, cost_per_unit: 280, supplier: "Vetnex India", unit: "vial", last_restocked_date: "2026-02-20" },
      { id: IT.t4, clinic_id: CLINIC_ID, item_name: "Amoxicillin 250mg", item_type: "medication", quantity: 120, low_stock_threshold: 20, cost_per_unit: 8, supplier: "Indian Immunologicals", unit: "tablet", last_restocked_date: "2026-03-20" },
      { id: IT.t5, clinic_id: CLINIC_ID, item_name: "Metronidazole 400mg", item_type: "medication", quantity: 80, low_stock_threshold: 15, cost_per_unit: 5, supplier: "Cipla Vet", unit: "tablet", last_restocked_date: "2026-03-18" },
      { id: IT.t6, clinic_id: CLINIC_ID, item_name: "Ivermectin 10mg/ml", item_type: "medication", quantity: 15, low_stock_threshold: 5, cost_per_unit: 120, supplier: "Vetnex India", unit: "bottle", last_restocked_date: "2026-03-01" },
      { id: IT.t7, clinic_id: CLINIC_ID, item_name: "Meloxicam 1.5mg/ml", item_type: "medication", quantity: 25, low_stock_threshold: 8, cost_per_unit: 95, supplier: "Intas Pharma", unit: "bottle", last_restocked_date: "2026-03-12" },
      { id: IT.t8, clinic_id: CLINIC_ID, item_name: "Cephalexin 500mg", item_type: "medication", quantity: 3, low_stock_threshold: 15, cost_per_unit: 12, supplier: "Cipla Vet", unit: "tablet", last_restocked_date: "2026-02-28" },
      { id: IT.t9, clinic_id: CLINIC_ID, item_name: "Surgical Gloves (M)", item_type: "supply", quantity: 200, low_stock_threshold: 50, cost_per_unit: 7, supplier: "Medline India", unit: "pair", last_restocked_date: "2026-03-22" },
      { id: IT.t10, clinic_id: CLINIC_ID, item_name: "Disposable Syringes 5ml", item_type: "supply", quantity: 150, low_stock_threshold: 30, cost_per_unit: 4, supplier: "Hindustan Syringes", unit: "piece", last_restocked_date: "2026-03-20" },
      { id: IT.t11, clinic_id: CLINIC_ID, item_name: "Cotton Bandage Roll", item_type: "supply", quantity: 40, low_stock_threshold: 10, cost_per_unit: 25, supplier: "Medline India", unit: "roll", last_restocked_date: "2026-03-15" },
      { id: IT.t12, clinic_id: CLINIC_ID, item_name: "IV Fluid (Ringer Lactate)", item_type: "supply", quantity: 20, low_stock_threshold: 10, cost_per_unit: 65, supplier: "Baxter India", unit: "bottle", last_restocked_date: "2026-03-05" },
      { id: IT.t13, clinic_id: CLINIC_ID, item_name: "Surgical Sutures (Vicryl)", item_type: "supply", quantity: 0, low_stock_threshold: 5, cost_per_unit: 150, supplier: "Ethicon India", unit: "pack", last_restocked_date: "2026-01-20" },
      { id: IT.t14, clinic_id: CLINIC_ID, item_name: "Ear Drops (Otomax)", item_type: "medication", quantity: 12, low_stock_threshold: 5, cost_per_unit: 280, supplier: "MSD Animal Health", unit: "bottle", last_restocked_date: "2026-03-08" },
      { id: IT.t15, clinic_id: CLINIC_ID, item_name: "Fipronil Spray 100ml", item_type: "medication", quantity: 18, low_stock_threshold: 8, cost_per_unit: 350, supplier: "Merial India", unit: "bottle", last_restocked_date: "2026-03-14" },
    ];
    const { error: invErr } = await supabase.from("inventory").insert(inventory);
    if (invErr) console.error("Inventory:", invErr.message);

    // === STEP 8: MEDICINES ===
    const medicines = [
      { id: MED.md1, clinic_id: CLINIC_ID, name: "Amoxicillin", dosage: "250mg", frequency: "Twice daily", duration_days: 7, side_effects: "Diarrhea, vomiting", contraindications: "Penicillin allergy" },
      { id: MED.md2, clinic_id: CLINIC_ID, name: "Metronidazole", dosage: "400mg", frequency: "Twice daily", duration_days: 5, side_effects: "Loss of appetite, drooling", contraindications: "Liver disease" },
      { id: MED.md3, clinic_id: CLINIC_ID, name: "Ivermectin", dosage: "0.2mg/kg", frequency: "Once weekly", duration_days: 28, side_effects: "Lethargy, tremors in sensitive breeds", contraindications: "Collies, MDR1 gene mutation" },
      { id: MED.md4, clinic_id: CLINIC_ID, name: "Meloxicam", dosage: "0.1mg/kg", frequency: "Once daily", duration_days: 5, side_effects: "GI upset", contraindications: "Kidney disease, dehydration" },
      { id: MED.md5, clinic_id: CLINIC_ID, name: "Cephalexin", dosage: "500mg", frequency: "Twice daily", duration_days: 10, side_effects: "Vomiting, diarrhea", contraindications: "Cephalosporin allergy" },
      { id: MED.md6, clinic_id: CLINIC_ID, name: "Prednisolone", dosage: "5mg", frequency: "Once daily (tapering)", duration_days: 14, side_effects: "Increased thirst, urination", contraindications: "Diabetes, active infection" },
      { id: MED.md7, clinic_id: CLINIC_ID, name: "Ondansetron", dosage: "0.5mg/kg", frequency: "Twice daily", duration_days: 3, side_effects: "Constipation", contraindications: "None significant" },
      { id: MED.md8, clinic_id: CLINIC_ID, name: "Doxycycline", dosage: "5mg/kg", frequency: "Twice daily", duration_days: 21, side_effects: "Nausea, esophageal irritation", contraindications: "Puppies under 6 months" },
    ];
    const { error: medErr } = await supabase.from("medicines").insert(medicines);
    if (medErr) console.error("Medicines:", medErr.message);

    // === STEP 9: APPOINTMENTS (20) — relative to today ===
    const today = new Date();
    const d = (offset: number) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString().split("T")[0];
    };

    const appointments = [
      // Past completed
      { id: A.a1, clinic_id: CLINIC_ID, pet_id: P.p1, owner_id: O.o1, vet_id: VET1_ID, appointment_date: d(-12), appointment_time: "10:00", reason: "Annual vaccination - DHPP booster", status: "completed", notes: "All vaccines administered successfully" },
      { id: A.a2, clinic_id: CLINIC_ID, pet_id: P.p5, owner_id: O.o3, vet_id: VET1_ID, appointment_date: d(-10), appointment_time: "11:30", reason: "Severe tick infestation & lethargy", status: "completed", notes: "Started on Doxycycline for suspected tick fever" },
      { id: A.a3, clinic_id: CLINIC_ID, pet_id: P.p3, owner_id: O.o2, vet_id: VET2_ID, appointment_date: d(-9), appointment_time: "09:30", reason: "Limping on right front leg", status: "completed", notes: "X-ray done, mild soft tissue sprain" },
      { id: A.a4, clinic_id: CLINIC_ID, pet_id: P.p9, owner_id: O.o6, vet_id: VET3_ID, appointment_date: d(-8), appointment_time: "14:00", reason: "Dental cleaning", status: "completed", notes: "Scaling done under sedation, mild gingivitis" },
      { id: A.a5, clinic_id: CLINIC_ID, pet_id: P.p16, owner_id: O.o11, vet_id: VET1_ID, appointment_date: d(-7), appointment_time: "10:30", reason: "Persistent ear infection", status: "completed", notes: "Otomax prescribed, follow-up in 10 days" },
      { id: A.a6, clinic_id: CLINIC_ID, pet_id: P.p13, owner_id: O.o9, vet_id: VET2_ID, appointment_date: d(-6), appointment_time: "15:00", reason: "Vomiting and diarrhea since 2 days", status: "completed", notes: "GI upset, started on Metronidazole + bland diet" },
      { id: A.a7, clinic_id: CLINIC_ID, pet_id: P.p19, owner_id: O.o13, vet_id: VET3_ID, appointment_date: d(-5), appointment_time: "11:00", reason: "Skin allergy - itching and redness", status: "completed", notes: "Prednisolone prescribed, advised medicated shampoo" },
      { id: A.a8, clinic_id: CLINIC_ID, pet_id: P.p12, owner_id: O.o8, vet_id: VET1_ID, appointment_date: d(-4), appointment_time: "09:00", reason: "Annual checkup and deworming", status: "completed", notes: "Good health, deworming tablet given" },
      // Past cancelled/no-show
      { id: A.a9, clinic_id: CLINIC_ID, pet_id: P.p7, owner_id: O.o5, vet_id: VET2_ID, appointment_date: d(-3), appointment_time: "16:00", reason: "Vaccination - Anti-Rabies", status: "cancelled", notes: "Owner called to reschedule" },
      { id: A.a10, clinic_id: CLINIC_ID, pet_id: P.p21, owner_id: O.o14, vet_id: VET1_ID, appointment_date: d(-2), appointment_time: "10:00", reason: "General checkup", status: "no_show" },
      // Today
      { id: A.a11, clinic_id: CLINIC_ID, pet_id: P.p2, owner_id: O.o1, vet_id: VET1_ID, appointment_date: d(0), appointment_time: "09:30", reason: "Annual vaccination", status: "scheduled" },
      { id: A.a12, clinic_id: CLINIC_ID, pet_id: P.p6, owner_id: O.o4, vet_id: VET2_ID, appointment_date: d(0), appointment_time: "10:30", reason: "Skin rash on belly", status: "scheduled" },
      { id: A.a13, clinic_id: CLINIC_ID, pet_id: P.p10, owner_id: O.o6, vet_id: VET3_ID, appointment_date: d(0), appointment_time: "11:30", reason: "Annual checkup & blood work", status: "scheduled" },
      { id: A.a14, clinic_id: CLINIC_ID, pet_id: P.p15, owner_id: O.o10, vet_id: VET1_ID, appointment_date: d(0), appointment_time: "14:00", reason: "Limping after park visit", status: "scheduled" },
      // Future
      { id: A.a15, clinic_id: CLINIC_ID, pet_id: P.p23, owner_id: O.o15, vet_id: VET2_ID, appointment_date: d(1), appointment_time: "10:00", reason: "Spay surgery consultation", status: "scheduled" },
      { id: A.a16, clinic_id: CLINIC_ID, pet_id: P.p17, owner_id: O.o12, vet_id: VET1_ID, appointment_date: d(2), appointment_time: "11:00", reason: "Vaccination - DHPP booster", status: "scheduled" },
      { id: A.a17, clinic_id: CLINIC_ID, pet_id: P.p11, owner_id: O.o7, vet_id: VET3_ID, appointment_date: d(3), appointment_time: "09:30", reason: "Grooming + nail trim", status: "scheduled" },
      { id: A.a18, clinic_id: CLINIC_ID, pet_id: P.p4, owner_id: O.o2, vet_id: VET2_ID, appointment_date: d(5), appointment_time: "14:30", reason: "Deworming", status: "scheduled" },
      { id: A.a19, clinic_id: CLINIC_ID, pet_id: P.p16, owner_id: O.o11, vet_id: VET1_ID, appointment_date: d(7), appointment_time: "10:30", reason: "Ear infection follow-up", status: "scheduled" },
      { id: A.a20, clinic_id: CLINIC_ID, pet_id: P.p25, owner_id: O.o3, vet_id: VET3_ID, appointment_date: d(10), appointment_time: "15:00", reason: "Puppy vaccination - first dose", status: "scheduled" },
    ];
    const { error: apptErr } = await supabase.from("appointments").insert(appointments);
    if (apptErr) console.error("Appointments:", apptErr.message);

    // === STEP 10: MEDICAL RECORDS (10) — for completed appointments ===
    const medicalRecords = [
      {
        id: MR.m1, clinic_id: CLINIC_ID, pet_id: P.p1, vet_id: VET1_ID, appointment_id: A.a1, record_date: d(-12),
        chief_complaint: "Annual vaccination due", symptoms: "No complaints, routine visit", weight_kg: 28.5, temperature_f: 101.2, heart_rate_bpm: 80, respiratory_rate: 18, body_condition_score: 5,
        physical_exam_findings: "Bright, alert, responsive. Good body condition. Coat healthy. No abnormalities detected.",
        primary_diagnosis: "Healthy - routine vaccination", severity: "mild",
        prescriptions_json: JSON.stringify([{ medication: "DHPP Vaccine", dosage: "1ml SC", frequency: "Annual", duration: "Single dose" }]),
        follow_up_instructions: "Monitor for any vaccine reaction for 24 hours", next_appointment_recommendation: "Annual booster in 12 months",
        follow_up_json: JSON.stringify({ status: "not_needed" }),
      },
      {
        id: MR.m2, clinic_id: CLINIC_ID, pet_id: P.p5, vet_id: VET1_ID, appointment_id: A.a2, record_date: d(-10),
        chief_complaint: "Severe tick infestation with lethargy for 3 days", symptoms: "Lethargy, loss of appetite, ticks found on ears and belly", duration_onset: "3 days",
        appetite_behavior: "Decreased appetite, reluctant to walk", prior_treatments: "Owner tried home tick removal",
        weight_kg: 34.0, temperature_f: 104.5, heart_rate_bpm: 110, respiratory_rate: 28, body_condition_score: 4,
        physical_exam_findings: "Multiple engorged ticks on ears, inguinal area. Pale mucous membranes. Mild dehydration. Enlarged lymph nodes.",
        diagnostic_results: "Blood smear: Babesia organisms found. CBC: Low platelet count (thrombocytopenia), mild anemia (PCV 28%)",
        primary_diagnosis: "Babesiosis (Tick Fever)", differential_diagnoses: "Ehrlichiosis, Anaplasmosis", severity: "severe",
        prescriptions_json: JSON.stringify([
          { medication: "Doxycycline", dosage: "5mg/kg", frequency: "Twice daily", duration: "21 days" },
          { medication: "Imidocarb dipropionate", dosage: "5mg/kg SC", frequency: "Single dose, repeat in 14 days", duration: "2 doses" },
          { medication: "Fipronil spray", dosage: "Topical", frequency: "Once", duration: "Repeat monthly" },
        ]),
        procedures_performed: "Tick removal, blood collection for CBC and smear",
        follow_up_instructions: "Recheck blood work in 7 days. Keep indoors, ensure hydration. Return immediately if gums turn yellow or white.",
        next_appointment_recommendation: "7 days for blood recheck",
        follow_up_json: JSON.stringify({ status: "needed", urgency: "1_week", reason: "Blood recheck for tick fever treatment response" }),
      },
      {
        id: MR.m3, clinic_id: CLINIC_ID, pet_id: P.p3, vet_id: VET2_ID, appointment_id: A.a3, record_date: d(-9),
        chief_complaint: "Limping on right front leg since yesterday", symptoms: "Favoring right front leg, reluctant to jump", duration_onset: "1 day",
        appetite_behavior: "Normal appetite", prior_treatments: "None",
        weight_kg: 32.0, temperature_f: 101.5, heart_rate_bpm: 88, respiratory_rate: 20, body_condition_score: 6,
        physical_exam_findings: "Pain on flexion of right carpus. Mild swelling noted. No crepitus. Range of motion slightly reduced.",
        diagnostic_results: "X-ray: No fracture detected. Mild soft tissue swelling around right carpus.",
        primary_diagnosis: "Right carpal soft tissue sprain", severity: "mild",
        prescriptions_json: JSON.stringify([
          { medication: "Meloxicam", dosage: "0.1mg/kg", frequency: "Once daily", duration: "5 days" },
        ]),
        procedures_performed: "Digital X-ray of right forelimb (2 views)",
        follow_up_instructions: "Strict rest for 7 days. No running or jumping. Short leash walks only for toilet breaks.",
        next_appointment_recommendation: "10 days if not improving",
        follow_up_json: JSON.stringify({ status: "conditional", condition_note: "Return if limping persists after 10 days" }),
      },
      {
        id: MR.m4, clinic_id: CLINIC_ID, pet_id: P.p9, vet_id: VET3_ID, appointment_id: A.a4, record_date: d(-8),
        chief_complaint: "Dental cleaning - scheduled procedure", symptoms: "Bad breath, visible tartar buildup",
        weight_kg: 12.5, temperature_f: 101.0, heart_rate_bpm: 95, respiratory_rate: 22, body_condition_score: 5,
        physical_exam_findings: "Grade 2 dental tartar on upper premolars and canines. Mild gingivitis. No loose teeth.",
        primary_diagnosis: "Periodontal disease Grade 2", severity: "mild",
        prescriptions_json: JSON.stringify([
          { medication: "Amoxicillin", dosage: "250mg", frequency: "Twice daily", duration: "5 days" },
        ]),
        procedures_performed: "Full dental scaling and polishing under ketamine-midazolam sedation. Duration: 45 minutes.",
        follow_up_instructions: "Soft food for 3 days. Start dental chews after 1 week. Daily tooth brushing recommended.",
        follow_up_json: JSON.stringify({ status: "not_needed" }),
      },
      {
        id: MR.m5, clinic_id: CLINIC_ID, pet_id: P.p16, vet_id: VET1_ID, appointment_id: A.a5, record_date: d(-7),
        chief_complaint: "Ear scratching and head shaking for 5 days", symptoms: "Constant scratching at both ears, head tilting, brown discharge", duration_onset: "5 days",
        appetite_behavior: "Slightly reduced appetite", prior_treatments: "Owner cleaned ears with cotton buds",
        weight_kg: 11.0, temperature_f: 102.0, heart_rate_bpm: 100, respiratory_rate: 24, body_condition_score: 5,
        physical_exam_findings: "Bilateral otitis externa. Dark brown ceruminous discharge. Erythema of ear canals. No tympanic membrane rupture visible.",
        diagnostic_results: "Ear cytology: Malassezia organisms and cocci bacteria present",
        primary_diagnosis: "Bilateral otitis externa (yeast + bacterial)", severity: "moderate",
        prescriptions_json: JSON.stringify([
          { medication: "Otomax ear drops", dosage: "4 drops each ear", frequency: "Twice daily", duration: "10 days" },
          { medication: "Cephalexin", dosage: "500mg", frequency: "Twice daily", duration: "10 days" },
        ]),
        follow_up_instructions: "Clean ears gently before applying drops. Do not use cotton buds. Prevent swimming. Return in 10 days.",
        next_appointment_recommendation: "10 days for recheck",
        follow_up_json: JSON.stringify({ status: "needed", urgency: "2_weeks", reason: "Ear infection recheck" }),
      },
      {
        id: MR.m6, clinic_id: CLINIC_ID, pet_id: P.p13, vet_id: VET2_ID, appointment_id: A.a6, record_date: d(-6),
        chief_complaint: "Vomiting and diarrhea for 2 days", symptoms: "Multiple episodes of vomiting (4-5 times/day), watery diarrhea, lethargy", duration_onset: "2 days",
        appetite_behavior: "Complete anorexia since yesterday", prior_treatments: "Owner gave ORS solution",
        weight_kg: 3.3, temperature_f: 103.0, heart_rate_bpm: 180, respiratory_rate: 32, body_condition_score: 4,
        physical_exam_findings: "Mild dehydration (skin tent slightly prolonged). Abdominal palpation: mild discomfort, no masses. Mucous membranes slightly tacky.",
        primary_diagnosis: "Acute gastroenteritis", differential_diagnoses: "Dietary indiscretion, early pancreatitis", severity: "moderate",
        prescriptions_json: JSON.stringify([
          { medication: "Metronidazole", dosage: "10mg/kg", frequency: "Twice daily", duration: "5 days" },
          { medication: "Ondansetron", dosage: "0.5mg/kg", frequency: "Twice daily", duration: "3 days" },
        ]),
        procedures_performed: "Subcutaneous fluid therapy (100ml Ringer Lactate)",
        follow_up_instructions: "Bland diet (boiled chicken + rice) for 5 days. Small frequent meals. Ensure fresh water available. Return if vomiting persists beyond 24 hours.",
        next_appointment_recommendation: "3 days if not improving",
        follow_up_json: JSON.stringify({ status: "conditional", condition_note: "Return if symptoms persist or worsen" }),
      },
      {
        id: MR.m7, clinic_id: CLINIC_ID, pet_id: P.p19, vet_id: VET3_ID, appointment_id: A.a7, record_date: d(-5),
        chief_complaint: "Severe itching and skin redness for 1 week", symptoms: "Constant scratching, biting at paws, red patches on belly and armpits", duration_onset: "7 days",
        appetite_behavior: "Normal appetite, seems restless", prior_treatments: "Owner tried coconut oil topically",
        weight_kg: 7.8, temperature_f: 101.3, heart_rate_bpm: 110, respiratory_rate: 24, body_condition_score: 5,
        physical_exam_findings: "Erythematous papular rash on ventral abdomen, axillae, and interdigital spaces. Excoriations from scratching. No secondary infection visible.",
        primary_diagnosis: "Allergic dermatitis (suspected atopic/contact)", severity: "moderate",
        prescriptions_json: JSON.stringify([
          { medication: "Prednisolone", dosage: "5mg", frequency: "Once daily for 5 days, then every other day", duration: "14 days" },
          { medication: "Medicated shampoo (Chlorhexidine 2%)", dosage: "Topical bath", frequency: "Twice weekly", duration: "4 weeks" },
        ]),
        follow_up_instructions: "Avoid potential allergens. Use hypoallergenic diet for 6 weeks. Keep environment clean. Return if skin worsens.",
        next_appointment_recommendation: "2 weeks for follow-up",
        follow_up_json: JSON.stringify({ status: "needed", urgency: "2_weeks", reason: "Dermatitis treatment response check" }),
      },
      {
        id: MR.m8, clinic_id: CLINIC_ID, pet_id: P.p12, vet_id: VET1_ID, appointment_id: A.a8, record_date: d(-4),
        chief_complaint: "Annual checkup and deworming", symptoms: "No complaints, routine visit",
        weight_kg: 18.0, temperature_f: 101.5, heart_rate_bpm: 85, respiratory_rate: 20, body_condition_score: 5,
        physical_exam_findings: "Healthy, well-nourished Indian Pariah. Good muscle tone. Clean ears. Teeth moderately clean. No abnormalities.",
        primary_diagnosis: "Healthy - routine wellness exam", severity: "mild",
        prescriptions_json: JSON.stringify([
          { medication: "Praziquantel + Pyrantel (Drontal Plus)", dosage: "1 tablet per 10kg", frequency: "Single dose", duration: "Single dose" },
        ]),
        procedures_performed: "Complete physical examination. Deworming tablet administered.",
        follow_up_instructions: "Next deworming in 3 months. Annual vaccination due in 2 months.",
        follow_up_json: JSON.stringify({ status: "not_needed" }),
      },
      {
        id: MR.m9, clinic_id: CLINIC_ID, pet_id: P.p7, vet_id: VET2_ID, record_date: d(-14),
        chief_complaint: "Not eating for 2 days, lethargic", symptoms: "Anorexia, lethargy, occasional vomiting of bile", duration_onset: "2 days",
        appetite_behavior: "Refuses food entirely, drinking water occasionally", prior_treatments: "None",
        weight_kg: 3.0, temperature_f: 103.8, heart_rate_bpm: 140, respiratory_rate: 30, body_condition_score: 3,
        physical_exam_findings: "Dehydrated (moderate). Painful abdomen on palpation. Slightly icteric gums.",
        diagnostic_results: "CBC: Elevated WBC (19,000). Liver enzymes (ALT, ALP) mildly elevated.",
        primary_diagnosis: "Acute hepatitis / hepatic lipidosis (suspected)", differential_diagnoses: "Pancreatitis, GI foreign body", severity: "severe",
        prescriptions_json: JSON.stringify([
          { medication: "Amoxicillin-Clavulanate", dosage: "12.5mg/kg", frequency: "Twice daily", duration: "10 days" },
          { medication: "S-Adenosylmethionine (SAMe)", dosage: "90mg", frequency: "Once daily", duration: "30 days" },
        ]),
        procedures_performed: "IV fluid therapy initiated. Blood collection for CBC and liver panel.",
        follow_up_instructions: "Must return in 3 days for recheck. Force-feed recovery diet if still not eating. Monitor for jaundice.",
        next_appointment_recommendation: "3 days mandatory recheck",
        follow_up_json: JSON.stringify({ status: "needed", urgency: "1_week", reason: "Liver function recheck" }),
      },
      {
        id: MR.m10, clinic_id: CLINIC_ID, pet_id: P.p22, vet_id: VET3_ID, record_date: d(-11),
        chief_complaint: "Back pain, reluctant to jump on furniture", symptoms: "Yelps when picked up, hunched posture, reluctant to climb stairs", duration_onset: "4 days",
        appetite_behavior: "Normal appetite", prior_treatments: "Confined to crate",
        weight_kg: 9.0, temperature_f: 101.4, heart_rate_bpm: 90, respiratory_rate: 20, body_condition_score: 6,
        physical_exam_findings: "Pain on palpation of thoracolumbar spine (T12-L2). No neurological deficits. Proprioception intact. Overweight.",
        diagnostic_results: "X-ray: Mild disc space narrowing at T13-L1. No obvious disc herniation.",
        primary_diagnosis: "Intervertebral disc disease (IVDD) Stage 1", severity: "moderate",
        prescriptions_json: JSON.stringify([
          { medication: "Meloxicam", dosage: "0.1mg/kg", frequency: "Once daily", duration: "7 days" },
          { medication: "Gabapentin", dosage: "5mg/kg", frequency: "Twice daily", duration: "14 days" },
        ]),
        procedures_performed: "Spinal X-ray (lateral and VD views)",
        follow_up_instructions: "Strict crate rest for 4 weeks. No jumping, stairs, or rough play. Weight management plan needed — reduce food by 15%.",
        next_appointment_recommendation: "2 weeks for reassessment",
        follow_up_json: JSON.stringify({ status: "needed", urgency: "2_weeks", reason: "IVDD progress check and weight management" }),
      },
    ];
    const { error: mrErr } = await supabase.from("medical_records").insert(medicalRecords);
    if (mrErr) console.error("Medical Records:", mrErr.message);

    // === STEP 11: INVOICES (10) ===
    const invoices = [
      { id: INV.i1, clinic_id: CLINIC_ID, invoice_number: "INV-2026-001", pet_id: P.p1, owner_id: O.o1, issue_date: d(-12), due_date: d(-12), amount: 1200, tax_amount: 0, discount: 0, total_amount: 1200, status: "paid", line_items: JSON.stringify([{ description: "DHPP Vaccination", quantity: 1, unit_price: 1200, total: 1200 }]) },
      { id: INV.i2, clinic_id: CLINIC_ID, invoice_number: "INV-2026-002", pet_id: P.p5, owner_id: O.o3, issue_date: d(-10), due_date: d(-3), amount: 3100, tax_amount: 0, discount: 0, total_amount: 3100, status: "paid", line_items: JSON.stringify([{ description: "Emergency Consultation", quantity: 1, unit_price: 1500, total: 1500 }, { description: "Blood Test - CBC", quantity: 1, unit_price: 800, total: 800 }, { description: "Tick Treatment", quantity: 1, unit_price: 600, total: 600 }, { description: "Doxycycline 21-day course", quantity: 1, unit_price: 200, total: 200 }]) },
      { id: INV.i3, clinic_id: CLINIC_ID, invoice_number: "INV-2026-003", pet_id: P.p3, owner_id: O.o2, issue_date: d(-9), due_date: d(-2), amount: 2000, tax_amount: 0, discount: 0, total_amount: 2000, status: "paid", line_items: JSON.stringify([{ description: "General Consultation", quantity: 1, unit_price: 500, total: 500 }, { description: "X-Ray (Digital)", quantity: 1, unit_price: 1500, total: 1500 }]) },
      { id: INV.i4, clinic_id: CLINIC_ID, invoice_number: "INV-2026-004", pet_id: P.p9, owner_id: O.o6, issue_date: d(-8), due_date: d(-1), amount: 3000, tax_amount: 0, discount: 0, total_amount: 3000, status: "paid", line_items: JSON.stringify([{ description: "Dental Cleaning", quantity: 1, unit_price: 2500, total: 2500 }, { description: "General Consultation", quantity: 1, unit_price: 500, total: 500 }]) },
      { id: INV.i5, clinic_id: CLINIC_ID, invoice_number: "INV-2026-005", pet_id: P.p16, owner_id: O.o11, issue_date: d(-7), due_date: d(0), amount: 1300, tax_amount: 0, discount: 0, total_amount: 1300, status: "pending", line_items: JSON.stringify([{ description: "General Consultation", quantity: 1, unit_price: 500, total: 500 }, { description: "Ear Drops (Otomax)", quantity: 1, unit_price: 280, total: 280 }, { description: "Cephalexin 10-day course", quantity: 1, unit_price: 520, total: 520 }]) },
      { id: INV.i6, clinic_id: CLINIC_ID, invoice_number: "INV-2026-006", pet_id: P.p13, owner_id: O.o9, issue_date: d(-6), due_date: d(1), amount: 1100, tax_amount: 0, discount: 100, total_amount: 1000, status: "pending", line_items: JSON.stringify([{ description: "General Consultation", quantity: 1, unit_price: 500, total: 500 }, { description: "Fluid Therapy (SC)", quantity: 1, unit_price: 300, total: 300 }, { description: "Metronidazole + Ondansetron", quantity: 1, unit_price: 300, total: 300 }]), notes: "₹100 discount applied (loyalty client)" },
      { id: INV.i7, clinic_id: CLINIC_ID, invoice_number: "INV-2026-007", pet_id: P.p19, owner_id: O.o13, issue_date: d(-5), due_date: d(2), amount: 700, tax_amount: 0, discount: 0, total_amount: 700, status: "pending", line_items: JSON.stringify([{ description: "General Consultation", quantity: 1, unit_price: 500, total: 500 }, { description: "Prednisolone course", quantity: 1, unit_price: 200, total: 200 }]) },
      { id: INV.i8, clinic_id: CLINIC_ID, invoice_number: "INV-2026-008", pet_id: P.p12, owner_id: O.o8, issue_date: d(-4), due_date: d(3), amount: 800, tax_amount: 0, discount: 0, total_amount: 800, status: "pending", line_items: JSON.stringify([{ description: "General Consultation", quantity: 1, unit_price: 500, total: 500 }, { description: "Deworming", quantity: 1, unit_price: 300, total: 300 }]) },
      { id: INV.i9, clinic_id: CLINIC_ID, invoice_number: "INV-2026-009", pet_id: P.p7, owner_id: O.o5, issue_date: d(-14), due_date: d(-7), amount: 3800, tax_amount: 0, discount: 0, total_amount: 3800, status: "overdue", line_items: JSON.stringify([{ description: "Emergency Consultation", quantity: 1, unit_price: 1500, total: 1500 }, { description: "Blood Test - CBC + Liver Panel", quantity: 1, unit_price: 1500, total: 1500 }, { description: "IV Fluid Therapy", quantity: 1, unit_price: 500, total: 500 }, { description: "Medications", quantity: 1, unit_price: 300, total: 300 }]) },
      { id: INV.i10, clinic_id: CLINIC_ID, invoice_number: "INV-2026-010", pet_id: P.p22, owner_id: O.o14, issue_date: d(-11), due_date: d(-4), amount: 2500, tax_amount: 0, discount: 0, total_amount: 2500, status: "overdue", line_items: JSON.stringify([{ description: "General Consultation", quantity: 1, unit_price: 500, total: 500 }, { description: "X-Ray (Spinal - 2 views)", quantity: 1, unit_price: 1500, total: 1500 }, { description: "Medications (Meloxicam + Gabapentin)", quantity: 1, unit_price: 500, total: 500 }]) },
    ];
    const { error: invoiceErr } = await supabase.from("invoices").insert(invoices);
    if (invoiceErr) console.error("Invoices:", invoiceErr.message);

    // === STEP 12: VACCINATIONS (12) ===
    const vaccinations = [
      { id: V.v1, clinic_id: CLINIC_ID, pet_id: P.p1, vaccine_name: "DHPP", date_administered: d(-12), next_due_date: d(353), batch_number: "DHPP-MSD-2026-A14", administered_by_id: VET1_ID },
      { id: V.v2, clinic_id: CLINIC_ID, pet_id: P.p1, vaccine_name: "Anti-Rabies", date_administered: "2025-06-15", next_due_date: "2026-06-15", batch_number: "RAB-ZOE-2025-K08", administered_by_id: VET1_ID },
      { id: V.v3, clinic_id: CLINIC_ID, pet_id: P.p3, vaccine_name: "Anti-Rabies", date_administered: "2025-09-10", next_due_date: "2026-09-10", batch_number: "RAB-ZOE-2025-M22", administered_by_id: VET2_ID },
      { id: V.v4, clinic_id: CLINIC_ID, pet_id: P.p3, vaccine_name: "DHPP", date_administered: "2025-09-10", next_due_date: "2026-09-10", batch_number: "DHPP-MSD-2025-B07", administered_by_id: VET2_ID },
      { id: V.v5, clinic_id: CLINIC_ID, pet_id: P.p5, vaccine_name: "Anti-Rabies", date_administered: "2025-11-22", next_due_date: "2026-11-22", batch_number: "RAB-ZOE-2025-P15", administered_by_id: VET1_ID },
      { id: V.v6, clinic_id: CLINIC_ID, pet_id: P.p6, vaccine_name: "DHPP", date_administered: "2025-12-14", next_due_date: "2026-12-14", batch_number: "DHPP-MSD-2025-C31", administered_by_id: VET2_ID },
      { id: V.v7, clinic_id: CLINIC_ID, pet_id: P.p9, vaccine_name: "Anti-Rabies", date_administered: "2025-07-30", next_due_date: "2026-07-30", batch_number: "RAB-ZOE-2025-L19", administered_by_id: VET3_ID },
      { id: V.v8, clinic_id: CLINIC_ID, pet_id: P.p10, vaccine_name: "DHPP", date_administered: "2025-05-18", next_due_date: "2026-05-18", batch_number: "DHPP-MSD-2025-A02", administered_by_id: VET1_ID },
      { id: V.v9, clinic_id: CLINIC_ID, pet_id: P.p12, vaccine_name: "Anti-Rabies", date_administered: "2025-12-01", next_due_date: "2026-12-01", batch_number: "RAB-ZOE-2025-Q28", administered_by_id: VET1_ID },
      { id: V.v10, clinic_id: CLINIC_ID, pet_id: P.p15, vaccine_name: "Leptospirosis", date_administered: "2025-10-20", next_due_date: "2026-04-20", batch_number: "LEPT-VNX-2025-D11", administered_by_id: VET2_ID },
      { id: V.v11, clinic_id: CLINIC_ID, pet_id: P.p17, vaccine_name: "DHPP", date_administered: "2025-08-15", next_due_date: "2026-08-15", batch_number: "DHPP-MSD-2025-B19", administered_by_id: VET1_ID },
      { id: V.v12, clinic_id: CLINIC_ID, pet_id: P.p23, vaccine_name: "Anti-Rabies", date_administered: "2025-11-05", next_due_date: "2026-11-05", batch_number: "RAB-ZOE-2025-N33", administered_by_id: VET2_ID },
    ];
    const { error: vacErr } = await supabase.from("vaccinations").insert(vaccinations);
    if (vacErr) console.error("Vaccinations:", vacErr.message);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Clinic data seeded successfully",
        summary: {
          owners: owners.length,
          pets: pets.length,
          appointments: appointments.length,
          services: services.length,
          inventory: inventory.length,
          medicines: medicines.length,
          medical_records: medicalRecords.length,
          invoices: invoices.length,
          vaccinations: vaccinations.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
