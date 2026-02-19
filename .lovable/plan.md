

# Separate Appointments from Consultations + Role-Based Access

## Overview

Currently, "Consultations" in the sidebar links to `/appointments` (the same page), and the appointment detail dialog shows "Start Consultation" to all users. This plan creates a clean separation between the two views and enforces role-based visibility on actions across the app.

---

## What Changes

### 1. New Consultations Page (`src/pages/consultation/ConsultationsList.tsx`)

A dedicated page at `/consultations` showing today's appointments filtered for the logged-in vet (or all appointments for admin). This is the vet's "my patients today" queue.

Layout:
- Page header: "Today's Consultations"
- List of today's appointments assigned to the logged-in vet, sorted by time
- Each card shows: time, pet name, species/breed, owner, reason, status
- **"Start Consultation"** button on each scheduled appointment (navigates to `/consultation/:id`)
- Completed appointments show a "View Record" link
- Admin sees all vets' appointments with a vet filter dropdown

### 2. Update Sidebar (`src/components/AppSidebar.tsx`)

Change the Consultations nav link from `/appointments` to `/consultations` so it points to the new dedicated page.

### 3. Remove Consultation Actions from Appointments View

In `AppointmentsCalendar.tsx`, the `AppointmentDetail` dialog currently shows:
- "Start Consultation" button
- "Complete" and "Cancel" buttons

**After the change:**
- **All users** see: appointment details (date, time, pet, vet, notes, status), "View Pet" button
- **Admin only** sees: "Complete", "Cancel", "Generate Invoice" (status management)
- **"Start Consultation" button is removed** from this dialog entirely -- consultations are accessed only from `/consultations`

### 4. Route Registration (`src/App.tsx`)

Add the new route:
```
/consultations -> ConsultationsList (vet, admin only)
```

### 5. Role-Based Access Matrix

Here is the full access control picture going forward:

| Feature | Admin | Vet | Staff |
|---------|-------|-----|-------|
| Dashboard | Yes | Yes | Yes |
| Pets (view/edit) | Yes | Yes | Yes |
| Owners (view/edit) | Yes | Yes | Yes |
| Appointments (view calendar, create) | Yes | Yes | Yes |
| Appointment actions (complete/cancel) | Yes | No | No |
| Consultations page | Yes | Yes | No |
| Start/Edit Consultation | Yes | Yes | No |
| Operations Dashboard | Yes | No | No |
| Billing | Yes | No | No |
| Inventory | Yes | No | No |
| Staff Management | Yes | No | No |

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/consultation/ConsultationsList.tsx` | Create | New "Today's Consultations" page for vets |
| `src/components/AppSidebar.tsx` | Edit | Point Consultations link to `/consultations` |
| `src/pages/appointments/AppointmentsCalendar.tsx` | Edit | Remove "Start Consultation" from dialog; restrict "Complete"/"Cancel" to admin |
| `src/App.tsx` | Edit | Add `/consultations` route with vet/admin role protection |

---

## Technical Details

- `ConsultationsList.tsx` filters `mockAppointments` by today's date and the logged-in user's ID (for vets) or shows all (for admins)
- Uses `useAuth()` to get current user and role
- Appointment dialog conditionally renders action buttons using `hasRole()` from `useAuth`
- The existing `ConsultationView.tsx` at `/consultation/:appointmentId` remains unchanged -- it is the actual clinical encounter screen
- All new components use existing shadcn/ui primitives and semantic Tailwind tokens
