

# Replace Backend API with Direct Supabase Client Calls

## Overview

Replace all `api.get/post/put/delete` calls in `api-services.ts` and the login in `AuthContext.tsx` with direct Supabase client queries. Also fix the existing build error in `StaffForm.tsx`. Every query filters by `clinic_id` and `is_deleted = false`. Mock data fallback is preserved for all queries.

---

## What Changes

### 1. Fix build error in StaffForm.tsx
The `form` object has `role: string` but `createStaff`/`updateStaff` expect `role: UserRole`. Cast `role` as `UserRole` when passing to the mutation function.

### 2. Install bcryptjs
Add `bcryptjs` (and `@types/bcryptjs`) for password verification in the login flow.

### 3. Create src/lib/supabase.ts
A thin re-export of the existing Supabase client from `@/integrations/supabase/client`. Also export a `getClinicId()` helper that reads the logged-in user from localStorage and returns their `clinic_id`.

```ts
export { supabase } from "@/integrations/supabase/client";

export function getClinicId(): string {
  const stored = localStorage.getItem("auth_user");
  if (stored) {
    const user = JSON.parse(stored);
    return user.clinic_id;
  }
  return "";
}
```

### 4. Replace login in AuthContext.tsx
- Import `supabase` and `bcryptjs`
- Query `users` table: `.select('*').eq('email', email).eq('is_deleted', false).eq('is_active', true).single()`
- Verify password with `bcrypt.compare(password, data.password_hash)`
- On success, map `name → full_name`, generate a simple session token, store in localStorage
- Keep mock login fallback if Supabase query fails

### 5. Rewrite src/lib/api-services.ts with Supabase queries
Replace every function. Pattern for each:

```ts
export async function getOwners(params?) {
  try {
    const clinicId = getClinicId();
    let query = supabase.from('pet_owners').select('*', { count: 'exact' })
      .eq('clinic_id', clinicId).eq('is_deleted', false);
    if (params?.search) query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    // pagination via .range()
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapOwner), total: count || 0 };
  } catch {
    // fall back to mock data (same logic as current)
  }
}
```

**All CRUD functions follow this pattern:**

| Function | Table | Notes |
|----------|-------|-------|
| `getOwners` | `pet_owners` | search on name/phone/email, map name→full_name, count pets from pets table |
| `getOwner` | `pet_owners` | single by id |
| `createOwner` | `pet_owners` | insert with clinic_id, map full_name→name |
| `updateOwner` | `pet_owners` | update by id |
| `deleteOwner` | `pet_owners` | soft delete: `update({ is_deleted: true })` |
| `getPets` | `pets` | join owner via `pet_owners!owner_id(*)`, filter by species/owner_id/search |
| `getPet` | `pets` | single with owner join |
| `createPet` | `pets` | map weight→weight_kg, status→health_status |
| `updatePet` | `pets` | same mappings |
| `deletePet` | `pets` | soft delete |
| `getAppointments` | `appointments` | join pet via `pets(*)`, join vet via `users!vet_id(*)`, date range filter |
| `getAppointment` | `appointments` | single with joins |
| `createAppointment` | `appointments` | map date→appointment_date, time→appointment_time, include owner_id |
| `updateAppointment` | `appointments` | same mappings |
| `deleteAppointment` | `appointments` | soft delete |
| `getInventory` | `inventory` | search on item_name, map item_name→name, item_type→category, compute status |
| `getInventoryItem` | `inventory` | single by id |
| `createInventoryItem` | `inventory` | map name→item_name, category→item_type |
| `updateInventoryItem` | `inventory` | same |
| `deleteInventoryItem` | `inventory` | soft delete |
| `getInvoices` | `invoices` | join pet + owner |
| `getInvoice` | `invoices` | single with joins |
| `createInvoice` | `invoices` | insert with clinic_id |
| `updateInvoice` | `invoices` | update by id |
| `getStaff` | `users` | filter by clinic_id, map name→full_name |
| `getStaffMember` | `users` | single |
| `createStaff` | `users` | hash password with bcrypt, insert |
| `updateStaff` | `users` | update by id |
| `deleteStaff` | `users` | soft delete |
| `getDashboardStats` | multiple | count queries on appointments (today), invoices (pending), pets, owners + recent data |

**Field mapping** is handled by the existing mapper functions (`mapOwner`, `mapPet`, etc.) which already handle the DB→frontend field translations.

**Inventory status** computed in `mapInventoryItem`: quantity=0→"out", quantity<=low_stock_threshold→"low", else "ok".

**pets_count** for owners: done via a separate count query or by selecting `pets(count)` in the owner query.

### 6. No UI changes
All pages, components, and routes remain exactly the same. Only the data layer changes.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Edit | Add `bcryptjs` + `@types/bcryptjs` |
| `src/lib/supabase.ts` | Create | Re-export supabase client + `getClinicId()` helper |
| `src/contexts/AuthContext.tsx` | Edit | Replace API login with Supabase query + bcrypt verify |
| `src/lib/api-services.ts` | Edit | Replace all API calls with Supabase client queries |
| `src/pages/staff/StaffForm.tsx` | Edit | Fix type error: cast `role` as `UserRole` |

