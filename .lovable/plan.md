

# Interactive Pet Detail Page — Linked Records & Navigation

## Overview

Currently, the Medical History, Appointments, and Vaccinations cards on the Pet Detail page are static displays. This plan makes every item in those cards **clickable**, navigating users to the relevant detail/edit page or opening a rich detail view. It also adds interactive enhancements to make the page feel like a true patient dashboard.

---

## Changes to `src/pages/pets/PetDetail.tsx`

### 1. Clickable Appointments
Each appointment row becomes a clickable card that:
- **Scheduled/Active appointments**: Navigates to the consultation view (`/consultation/:appointmentId`) for vets/admins, or opens the appointment on the calendar for staff.
- **Completed appointments**: Opens the linked medical record (if one exists) at `/pets/:petId/records/:recordId`.
- Visual affordance: `cursor-pointer hover:bg-accent/50 transition-colors` plus a small chevron-right icon.

### 2. Clickable Medical Records
Each medical record entry becomes clickable:
- Navigates to `/pets/:petId/records/:recordId` to view/edit the full SOAP note.
- Adds hover effect and chevron icon for discoverability.
- Shows a condensed preview (diagnosis, severity, prescriptions) but clicking reveals the full record.

### 3. Clickable Vaccinations
Each vaccination row becomes clickable:
- Opens a **detail dialog** (using shadcn Dialog) showing batch number, administered-by vet, and full date details — since vaccinations don't have their own page.
- Overdue vaccinations get a prominent "Schedule Booster" button inside the dialog that navigates to `/appointments/new`.

### 4. Quick-Action Enhancements
- **Owner name** in Pet Information becomes a link to `/owners/:ownerId`.
- **"View All" links** added to Appointments and Medical History card headers, navigating to `/appointments/list` (filtered) and a scrollable full history respectively.

### 5. Expandable Medical Record Preview
- Medical record cards get a **click-to-expand** behavior: first click expands inline to show vitals summary and full SOAP sections, second click (or a "View Full Record" button) navigates to the record form.
- This gives vets a quick glance without leaving the page.

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/pets/PetDetail.tsx` | Edit | Add click handlers, hover states, navigation links, vaccination dialog, expandable records, owner link |

No new files needed. All navigation targets already exist as routes.

---

## Technical Details

- Appointment click handlers use `navigate()` — for scheduled appointments to `/consultation/:id`, for completed to the linked record.
- Medical record rows use `navigate(/pets/${pet.id}/records/${rec.id})` which maps to the existing `MedicalRecordForm` route.
- Vaccination detail uses a `useState`-driven `Dialog` component (already imported pattern from `ConfirmDialog`).
- Owner name uses `navigate(/owners/${pet.owner_id})`.
- All hover states use semantic Tailwind: `hover:bg-accent/50`, `cursor-pointer`, `transition-colors`.
- A small `ChevronRight` icon from lucide-react signals clickability on each row.
- "View All" buttons use `Button variant="ghost" size="sm"`.

