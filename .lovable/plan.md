

# Plan: Calendar UI Revamp + Role-Based Navigation + Quick Login

## 1. Calendar UI Cleanup + Overlapping Appointment Fix

**Problem:** Appointments at the same time stack on top of each other with `absolute` positioning, hiding ones underneath.

**Fix:** Add a collision-detection layout algorithm before rendering appointment blocks in WeekGrid and DayGrid. For each day column:
- Group appointments that overlap in time
- Within each overlap cluster, assign a column index and total column count
- Render each appointment with `left: (colIndex / totalCols) * 100%` and `width: (1 / totalCols) * 100%` instead of `left-1 right-1`

**Visual cleanup (inspired by reference screenshots):**
- Softer borders, slightly rounded cards with subtle shadow
- Cleaner toolbar: group Today/prev/next together, subtle separator before view mode toggle
- Reduce visual noise in filter bar
- Cleaner mini-calendar sidebar styling
- Appointment blocks: remove grip icon for cleaner look, show it only on hover

**Files:** `src/pages/appointments/AppointmentsCalendar.tsx`

## 2. Role-Based Sidebar Navigation

**Current state:** Sidebar has "Clinic" (all users) and "Administration" (admin only). Vets see "Today's Patients" but staff also see it if they're not admin.

**Enhanced grouping:**

| Group | Pages | Visible to |
|-------|-------|-----------|
| Clinic | Dashboard, Pets, Owners, Appointments | All roles |
| Clinical | Today's Patients | vet, admin |
| Administration | Operations, Billing, Services, Inventory, Staff | admin only |

This matches the existing `ProtectedRoute` logic in App.tsx but makes the sidebar accurately reflect it. No new routes or permissions needed -- just aligning sidebar visibility with existing route guards.

**Files:** `src/components/AppSidebar.tsx`

## 3. Quick-Login Buttons on Login Page

**Current state:** Login page has email/password fields. Mock credentials exist for 3 roles.

**Add:** Three quick-login buttons below the form:
- "Login as Admin" → auto-fills admin@pawscare.com / Admin@2026!
- "Login as Vet" → auto-fills rajesh.sharma@pawscare.com / Vet@2026!
- "Login as Staff" → auto-fills anjali@pawscare.com / Staff@2026!

Each button sets the email/password state and submits the form. Styled as outlined/secondary buttons in a "Quick Access" section below the main sign-in button. These use the existing mock login fallback when Supabase is unavailable, or the real DB users when connected.

**Files:** `src/pages/Login.tsx`

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/appointments/AppointmentsCalendar.tsx` | Add overlap layout algorithm for side-by-side appointments; visual cleanup of toolbar, filter bar, and appointment blocks |
| `src/components/AppSidebar.tsx` | Add "Clinical" group for vet+admin; tighten admin-only section visibility |
| `src/pages/Login.tsx` | Add 3 quick-login role buttons below the sign-in form |

