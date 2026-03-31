

# Plan: Clear Database + Seed Realistic Indian Veterinary Clinic Data

## Overview

Create an edge function `seed-clinic-data` that wipes all existing records and populates every table with realistic data tailored to an Indian veterinary clinic (Mia Vet Clinic, Mumbai). The 3 demo users (admin, vet, staff) and their passwords will be preserved.

## Data to Seed

**Clinic:** Keep existing `Mia Vet Clinic` (id: `d48c814a-...`), update address to a real Mumbai location.

**Users (5):** Keep existing 3 demo users + 2 existing vets. Update names to be Indian:
- Admin: Dr. Mia Sharma (admin@miavet.com)
- Vet 1: Dr. Rajesh Iyer (drsmith@miavet.com)
- Vet 2: Dr. Radhika Menon (radhika@miavet.com)
- Vet 3: Dr. Mohit Patil (mohit@vms.com)
- Staff: Anjali Patel (staff@miavet.com)

**Pet Owners (15):** Indian names, Mumbai/Pune/Bangalore addresses, Indian phone numbers (+91...), realistic emails.

**Pets (25):** Mix of dogs (Indian Spitz, Labrador, German Shepherd, Pomeranian, Golden Retriever, Beagle, Rottweiler), cats (Persian, Indian domestic, Siamese), a parrot, a rabbit. Indian pet names (Bruno, Simba, Tiger, Lucky, Sheru, Golu, etc.). Realistic weights, DOBs, microchip IDs.

**Appointments (20):** Spread across the past 2 weeks and next 2 weeks. Mix of statuses (scheduled, completed, cancelled, no_show). Assigned to different vets. Reasons: vaccination, skin allergy, annual checkup, limping, diarrhea, dental cleaning, spay/neuter consult, ear infection, tick infestation.

**Services (12):** Indian-market pricing in INR:
- General Consultation: ₹500
- Vaccination (Anti-Rabies): ₹800
- Vaccination (DHPP): ₹1200
- Dental Cleaning: ₹2500
- Spay Surgery: ₹5000
- Neuter Surgery: ₹3500
- X-Ray: ₹1500
- Blood Test (CBC): ₹800
- Deworming: ₹300
- Tick Treatment: ₹600
- Grooming (Full): ₹1200
- Emergency Consultation: ₹1500

**Inventory (15):** Vaccines (Rabies, DHPP, Leptospirosis), medications (Amoxicillin, Metronidazole, Ivermectin, Meloxicam, Cephalexin), supplies (Surgical Gloves, Syringes, Bandages, IV Fluids, Surgical Sutures, Ear Drops). Indian suppliers (Vetnex India, Zoetis India, MSD Animal Health). Realistic quantities with some items low/out of stock.

**Medical Records (10):** SOAP-format records for completed appointments. Real diagnoses: tick fever, parvovirus, skin dermatitis, ear infection, GI upset. Vitals, prescriptions with Indian medication names and dosages.

**Invoices (10):** Mix of paid/pending/overdue. Line items referencing services. Indian pricing (₹500-₹8000 range). Invoice numbers like INV-2026-001.

**Vaccinations (12):** Anti-rabies, DHPP, Leptospirosis, Bordetella for various pets. Batch numbers, next due dates.

## Approach

### Step 1: Create edge function `seed-clinic-data`

The function will:
1. Delete all rows from dependent tables first (respecting order): vaccinations, medical_records, prescriptions, invoices, payments, appointments, pet_documents, pets, pet_owners, inventory, services, medicines, message_logs, reminder_logs
2. Update the clinic record with realistic Mumbai address
3. Update existing user names to Indian names (preserve emails/passwords)
4. Insert all seed data with hardcoded UUIDs for referential integrity
5. Return a summary of what was inserted

### Step 2: Deploy and invoke the function

Call the function once to populate all data.

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/seed-clinic-data/index.ts` | New edge function with all seed data and deletion logic |

No frontend code changes needed -- the app already reads from Supabase.

## Credentials (unchanged)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@miavet.com | Admin@2026! |
| Veterinarian | drsmith@miavet.com | Vet@2026! |
| Staff | staff@miavet.com | Staff@2026! |

