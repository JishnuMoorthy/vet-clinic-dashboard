

# Plan: Real Supabase Users + Role-Differentiated Experience

## Current State

**DB users:** admin@miavet.com (admin), drsmith@miavet.com (vet), radhika@miavet.com (vet). No staff user exists.

**Problem:** Quick login buttons point to mock emails (admin@pawscare.com, etc.) that don't exist in Supabase. Auth falls back to mock data. Also, Vet and Staff currently see the same sidebar (Clinic group only) -- their experiences aren't differentiated.

## What Changes

### 1. Seed a Staff User + Set Known Passwords (Edge Function)

Create a one-time edge function `seed-demo-users` that:
- Inserts a new staff user: `staff@miavet.com` / `Anjali Patel` / role `staff`
- Updates password hashes for all 3 users to known passwords using bcrypt
- Returns the credentials on success

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@miavet.com | Admin@2026! |
| Veterinarian | drsmith@miavet.com | Vet@2026! |
| Staff | staff@miavet.com | Staff@2026! |

### 2. Update Login.tsx Quick Access Buttons

Change `QUICK_LOGINS` to use the real Supabase emails above instead of the mock `@pawscare.com` ones.

### 3. Remove Mock Login Fallback in AuthContext

- Change `.single()` to `.maybeSingle()` so missing users return null instead of throwing PGRST116
- Remove the entire mock fallback catch block -- if user isn't in Supabase, login fails cleanly
- Keep the "Failed to fetch" / "Load failed" network error handling but show a proper error message

### 4. Differentiate Vet vs Staff Experience

Thinking critically about what each role actually needs:

**Staff** (receptionist/front-desk): Their job is scheduling, registering pets/owners, and basic admin. They should NOT see clinical tools or financial data.
- **Sidebar:** Clinic group only (Dashboard, Pets, Owners, Appointments). No Clinical section, no Administration.
- **Quick Actions:** Add Pet, New Appointment, Add Owner only
- **Dashboard:** Show stats for Today's Appointments, Total Pets, Total Owners. Hide Pending Invoices (financial). Hide Recent Invoices card. Hide Low Stock Alerts.

**Vet** (veterinarian): Their job is clinical care. They need patient access and their schedule, but not financial/admin operations.
- **Sidebar:** Clinic group + Clinical group (Today's Patients). No Administration section.
- **Quick Actions:** Add Pet, New Appointment, Add Owner (same as staff, but they also get access to consultations via sidebar)
- **Dashboard:** Show Today's Appointments, Total Pets, Total Owners. Hide Pending Invoices. Show Upcoming Appointments card. Hide Recent Invoices. Hide Low Stock.

**Admin**: Sees everything (already works correctly).

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/seed-demo-users/index.ts` | New edge function -- hash passwords, upsert 3 users |
| `supabase/config.toml` | Add `[functions.seed-demo-users]` with `verify_jwt = false` |
| `src/pages/Login.tsx` | Update QUICK_LOGINS to real @miavet.com emails |
| `src/contexts/AuthContext.tsx` | Use `.maybeSingle()`, remove mock fallback |
| `src/components/QuickActions.tsx` | Add role-aware visibility (not just adminOnly, add `roles` array per action) |
| `src/pages/Dashboard.tsx` | Conditionally hide Invoices stat, Invoices card, and Low Stock card for non-admin. Hide Invoices stat for vet/staff. |
| `src/components/AppSidebar.tsx` | Already correct -- just verify Clinical shows for vet+admin, Admin section for admin only |

