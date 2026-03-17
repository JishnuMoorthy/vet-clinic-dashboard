

# Plan: Pet Documents Upload + Vaccination Entry Fix

## Problem Analysis

**Three distinct issues identified:**

1. **No document storage exists** — There's no storage bucket, no `pet_documents` table, and no `photo_url` column on the `pets` table. Pet photos are currently base64 data URLs that never persist to the DB.

2. **No way to upload documents per pet** — Pet parents provide lab results, previous records, certificates, etc. These need a dedicated upload + viewing area on the Pet Detail page.

3. **Vaccinations can't be added from the UI** — The `createVaccination` function exists in api-services, but neither the MedicalRecordForm, ConsultationView, nor PetDetail page has a form/modal to actually create a vaccination record. The Vaccinations section on PetDetail is read-only.

---

## Implementation

### Step 1: Database + Storage Setup

**Migration SQL:**
- Add `photo_url` column to `pets` table (text, nullable)
- Create `pet_documents` table: `id`, `clinic_id`, `pet_id`, `file_name`, `file_url`, `file_type`, `file_size_bytes`, `category` (enum: lab_result, certificate, previous_record, imaging, other), `notes`, `uploaded_by_id`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`
- Create a **public** Supabase storage bucket `pet-files` for photos and documents
- Add RLS policies on `pet_documents` for authenticated users filtered by clinic_id
- Add storage policies for authenticated uploads/reads

### Step 2: API Services — Pet Documents + Photo Upload

In `api-services.ts`:
- `uploadPetFile(file, petId)` — uploads to `pet-files` bucket, returns public URL
- `createPetDocument(data)` — inserts into `pet_documents`
- `getPetDocuments(petId)` — fetches documents for a pet
- `deletePetDocument(id)` — soft delete
- Update `createPet`/`updatePet` to handle `photo_url` properly (upload file to storage, save URL)

### Step 3: Pet Photo Upload (PetForm)

Currently PetForm creates a base64 data URL via FileReader that never reaches the DB (no `photo_url` column). Fix:
- On form submit, if a photo file was selected, upload it to `pet-files` bucket first
- Save the returned public URL as `photo_url` in the pets table

### Step 4: Pet Documents Section (PetDetail)

Add a new **"Documents"** card on the Pet Detail page:
- Upload button that opens a file picker (accepts PDF, images, DOCX)
- Category selector (lab result, certificate, previous record, imaging, other)
- Optional notes field
- List of uploaded documents with file name, category badge, upload date, and download/delete actions
- Click to open/download the document

### Step 5: Add Vaccination Modal (PetDetail)

Create an **"Add Vaccination"** modal accessible from:
- The Vaccinations card on PetDetail (add an "+ Add" button, matching Medical History card)
- Fields: vaccine name, date administered, next due date, batch number, administered by (vet picker), notes
- Uses `createVaccination` from api-services
- On save, invalidates `['vaccinations', petId]` query so the list refreshes

Also add edit/delete capabilities to vaccination records via the existing detail dialog.

### Step 6: Vaccination Entry from ConsultationView

Add an optional "Vaccinations Administered" section in the Plan (P) section of the SOAP note in ConsultationView:
- Quick-add vaccination inline (vaccine name, batch number — date auto-set to today, next due auto-calculated based on common schedules)
- On consultation save, call `createVaccination` for each vaccination entry alongside the medical record

---

## Files to Change

| File | Action |
|------|--------|
| DB Migration | Add `photo_url` to pets, create `pet_documents` table, create `pet-files` storage bucket + policies |
| `src/lib/api-services.ts` | Add document CRUD functions + file upload utility |
| `src/pages/pets/PetForm.tsx` | Upload photo to storage bucket on save instead of base64 |
| `src/pages/pets/PetDetail.tsx` | Add Documents card with upload UI + Add Vaccination button/modal |
| `src/pages/consultation/ConsultationView.tsx` | Add vaccination entry in Plan section |
| `src/types/api.ts` | Add `PetDocument` interface |

