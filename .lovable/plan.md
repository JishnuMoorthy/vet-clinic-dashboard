

# Implementation Plan: Full-Stack Backend Connectivity Fix

## Phase Analysis vs Current State

| Phase | Document Request | Current State | Action Needed |
|-------|-----------------|---------------|---------------|
| **1A** | Add SOAP columns to medical_records | All columns already exist | None |
| **1B** | Create vaccinations table | Table already exists | None |
| **1C** | Create services table | Table already exists | None |
| **1D** | Add line_items + discount to invoices | **Missing** — neither column exists | **Migration needed** |
| **2** | Backend API routes (FastAPI) | N/A — app uses Supabase direct client | Skip entirely |
| **3A** | Add 6 missing api-services functions | **Missing**: updateMedicalRecord, deleteMedicalRecord, deleteInvoice, createVaccination, updateVaccination, deleteVaccination | **Add all 6** |
| **3B** | Fix createInvoice for line_items | Currently ignores line_items (no DB column) | **Fix after migration** |
| **3C** | Fix mapInvoice for line_items + discount | mapInvoice reads `inv.line_items` (returns [] since column missing) and lacks `discount` | **Fix mapper** |
| **4A** | Wire MedicalRecordForm to Supabase | Uses `mockPets`/`mockMedicalRecords`, handleSave is toast-only | **Full rewrite of data layer** |
| **4B** | Fix InvoiceForm ServicePicker | Uses `mockInventory`/`mockServices` | **Replace with useQuery** |
| **5** | Wire invoice delete | No delete capability exists | **Add to InvoiceDetail + InvoicesList** |
| **6** | Audit & cleanup mock imports | Several pages still import mocks as primary sources | **Audit all files** |

---

## Implementation Steps

### Step 1: DB Migration — Add line_items + discount to invoices
```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
```

### Step 2: Add 6 missing functions to `api-services.ts`
- `updateMedicalRecord(id, data)` — update all SOAP/vitals columns, matching createMedicalRecord's field mapping
- `deleteMedicalRecord(id)` — soft delete pattern (`is_deleted: true, deleted_at: now`)
- `deleteInvoice(id)` — soft delete pattern
- `createVaccination(data)` — insert with clinic_id, pet_id, vaccine_name, date_administered, next_due_date, batch_number, administered_by_id, notes
- `updateVaccination(id, data)` — update fields
- `deleteVaccination(id)` — soft delete pattern

### Step 3: Fix createInvoice + updateInvoice + mapInvoice
- `createInvoice`: add `line_items` and `discount` to the insert payload
- `updateInvoice`: add `line_items` and `discount` to the update payload
- `mapInvoice`: read `discount` from DB row (currently only reads line_items which will now work)

### Step 4: Wire MedicalRecordForm to Supabase
- Remove imports of `mockPets`, `mockMedicalRecords`
- Add `useQuery` for pet data via `getPet(petId)`
- Add `useQuery` for existing record via `getMedicalRecords({ pet_id: petId })` then find by recordId
- Add `useMutation` wrapping `createMedicalRecord` / `updateMedicalRecord`
- Add loading/error states
- Wire handleSave to the mutation with query invalidation

### Step 5: Fix InvoiceForm ServicePicker
- Add `useQuery({ queryKey: ['services'], queryFn: getServices })` and `useQuery({ queryKey: ['inventory'], queryFn: getInventory })` in InvoiceForm
- Pass results to ServicePicker as props instead of reading `mockServices`/`mockInventory`
- Remove unused mock imports

### Step 6: Wire invoice delete
- Add `deleteInvoice` import to InvoiceDetail and InvoicesList
- Add delete button with ConfirmDialog in InvoiceDetail
- Add delete action in InvoicesList table rows
- Both use `useMutation` with `deleteInvoice`, invalidate `['invoices']` on success

### Step 7: Audit & cleanup remaining mock imports
- Search all files for `mockPets`, `mockMedicalRecords`, `mockVaccinations`, `mockServices`, `mockInventory`, `mockInvoices`, `mockOwners` used as primary data sources
- Replace with Supabase query fallbacks or remove entirely where queries already exist
- Ensure error catch blocks log actual errors

---

## Files to Change

| File | Action |
|------|--------|
| DB Migration | Add `line_items jsonb` + `discount numeric` to invoices |
| `src/lib/api-services.ts` | Add 6 CRUD functions; fix createInvoice/updateInvoice/mapInvoice for line_items + discount |
| `src/pages/medical-records/MedicalRecordForm.tsx` | Replace mock data with useQuery/useMutation, wire save |
| `src/pages/billing/InvoiceForm.tsx` | Replace mock ServicePicker data with Supabase queries |
| `src/pages/billing/InvoiceDetail.tsx` | Add delete button with confirmation |
| `src/pages/billing/InvoicesList.tsx` | Add delete action per row |

Phase 2 (FastAPI backend routes) is skipped entirely since this app communicates directly with Supabase via the JS client.

