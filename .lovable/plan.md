

# QA Audit & Fix: Supabase Data + Smart Banner

## Overview
The uploaded plan has 4 parts: (1) smart Demo/Live banner, (2) systematic QA of every page to use Supabase, (3) field mappings, (4) error handling. Most pages already use Supabase via `api-services.ts`. Four components still read/write mock data directly and need fixing.

---

## PART 1: Smart Demo/Live Banner

**File: `src/components/DemoBanner.tsx`**

Replace the hardcoded orange banner with logic that checks the logged-in user:
- If `user.id` does NOT start with `"mock-"` (i.e., came from Supabase with a real `clinic_id`): show a **green** banner: "✅ Live Mode — Connected to your clinic database." Auto-dismiss after 5 seconds.
- If `user.id` starts with `"mock-"` (mock fallback login): show a **persistent orange** banner: "⚠️ Demo Mode — You're viewing sample data. Changes won't be saved."
- Uses `useAuth()` to get the current user.

**File: `src/components/AppLayout.tsx`** — No changes needed (already renders `<DemoBanner />` on every page inside the layout).

---

## PART 2: Fix Pages Still Using Mock Data

### Already passing QA (use Supabase via api-services.ts):
- Dashboard (`/dashboard`) — ✅ uses `getDashboardStats()`
- Pets (`/pets`, `/pets/:id`, `/pets/new`) — ✅ uses `getPets`, `getPet`, `createPet`, `updatePet`, `deletePet`
- Owners (`/owners`, `/owners/:id`, `/owners/new`) — ✅ uses `getOwners`, `getOwner`, `createOwner`, `updateOwner`, `deleteOwner`
- Appointments (`/appointments`) — ✅ uses `getAppointments`, `createAppointment`, `updateAppointment`, `deleteAppointment`
- Billing (`/billing`) — ✅ uses `getInvoices`, `getInvoice`, `createInvoice`, `updateInvoice`
- Inventory (`/inventory`) — ✅ uses `getInventory`, `createInventoryItem`, `updateInventoryItem`, `deleteInventoryItem`
- Staff (`/staff`) — ✅ uses `getStaff`, `createStaff`, `updateStaff`, `deleteStaff`
- Clinic Dashboard (`/operations`) — ✅ uses all api-services functions
- Global Search — ✅ uses `getOwners`, `getPets`
- Settings — ✅ reads from `useAuth()` user (which comes from Supabase login)

### Needs fixing:

#### 1. ConsultationsList.tsx (Today's Patients)
Currently reads `mockAppointments`, `mockUsers`, `mockMedicalRecords` directly.

Fix:
- Use `useQuery` with `getAppointments({ date_from: today, date_to: today })` to fetch today's appointments from Supabase
- Use `useQuery` with `getStaff()` to fetch vets list for the filter dropdown
- Medical records: query `medical_records` table filtered by today's appointment IDs (add a helper function or inline query), falling back to empty array
- Keep mock data as fallback in the query's `placeholderData`

#### 2. WalkInModal.tsx
Currently calls `addOwner()`, `addPet()`, `addAppointment()` from mock-data, and reads `mockUsers` for vet list.

Fix:
- Replace `addOwner` with `createOwner()` from api-services
- Replace `addPet` with `createPet()` from api-services
- Replace `addAppointment` with `createAppointment()` from api-services
- Replace `mockUsers.filter(u => u.role === "vet")` with a `useQuery` call to `getStaff()` and filter for vets
- Make the save handler `async` to await all three Supabase inserts
- Show toast error with actual error message on failure

#### 3. InlineOwnerModal.tsx
Currently calls `addOwner()` from mock-data.

Fix:
- Replace `addOwner(...)` with `await createOwner(...)` from api-services
- Make `handleSave` async
- Use the returned owner's real ID from Supabase in `onCreated(newOwner.id)`
- Show toast error on failure

#### 4. ServicesCatalog.tsx
Currently uses `mockServices`, `addService`, `updateService`, `deleteService` from mock-data. There is no `services` table in Supabase.

Fix: Since there's no services table in the DB, we have two options. The plan says "if those tables don't exist yet, just show 'No records found' instead of mock data" — but that applies to pet detail sub-tables. For ServicesCatalog, we should **create a `services` table** via migration, then wire up CRUD. Alternatively, keep it on mock data for now since the plan focuses on existing tables.

**Decision:** Create a `services` DB table via migration to match the existing `ServiceItem` type, then replace mock CRUD with Supabase queries. This aligns with the plan's goal of "every feature uses real Supabase data."

**Migration SQL:**
```sql
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name varchar NOT NULL,
  category varchar DEFAULT 'other',
  price numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  deleted_at timestamp,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

Then rewrite ServicesCatalog.tsx to use `supabase.from('services')` queries with `clinic_id` and `is_deleted` filters.

---

## PART 3: Field Mappings

Already implemented correctly in `api-services.ts` mappers:
- `name` → `full_name` (users & owners) ✅
- `health_status` → `status` (pets) ✅
- `weight_kg` → `weight` (pets) ✅
- `appointment_date` → `date`, `appointment_time` → `time` ✅
- `item_name` → `name`, `item_type` → `category` (inventory) ✅
- Inventory status derived logic ✅

No changes needed here.

---

## PART 4: Error Handling

Already implemented in `api-services.ts`:
- All queries have `try/catch` with `console.warn("[Supabase fallback] <table> query failed: <error>")` ✅
- Need to verify that create/update/delete failures show toast errors to users — this is handled at the component level via `onError` in `useMutation`. Will verify and add where missing.

For the newly fixed components (WalkInModal, InlineOwnerModal, ConsultationsList), ensure toast errors show the actual error message on failure.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/DemoBanner.tsx` | Edit | Smart green/orange banner based on user source |
| `src/pages/consultation/ConsultationsList.tsx` | Edit | Replace mock data with Supabase queries via api-services |
| `src/components/WalkInModal.tsx` | Edit | Replace mock CRUD with api-services functions |
| `src/components/InlineOwnerModal.tsx` | Edit | Replace `addOwner` with `createOwner` from api-services |
| `src/pages/services/ServicesCatalog.tsx` | Edit | Replace mock CRUD with Supabase queries |
| `src/lib/api-services.ts` | Edit | Add `getServices`, `createService`, `updateService`, `deleteService` functions |
| DB Migration | Create | Add `services` table |

