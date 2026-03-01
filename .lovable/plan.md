

# Implementation Plan: 12 Feature Enhancements

## Overview

This plan covers all 12 items from the feature spec, grouped into logical implementation batches. All changes are frontend-only using mock data patterns already established in the codebase.

---

## Batch 1: Registration and Core UX (Items 1, 2, 5)

### Item 1 — Inline Owner Creation in Pet Form (P0)

**Problem:** Creating a pet requires navigating away to create an owner first, losing all pet form state.

**Changes:**
- **`src/pages/pets/PetForm.tsx`**: Replace the Owner `<Select>` with a searchable input using `cmdk` (already installed). Add a `+ Add New Owner` option at the bottom of the dropdown.
- **New: `src/components/InlineOwnerModal.tsx`**: A `<Dialog>` containing the same 4 fields from `OwnerForm.tsx` (Name, Phone, Email, Address). On save, it pushes a new owner to a local state array and auto-selects it, preserving all pet form fields.
- **`src/lib/mock-data.ts`**: Export `mockOwners` as a `let` (mutable array) so the modal can push to it at runtime.

### Item 2 — Improve DOB Selection Speed (P1)

**Problem:** Native `<input type="date">` requires month-by-month scrolling to reach birth years for pets.

**Changes:**
- **`src/pages/pets/PetForm.tsx`**: Replace `<Input type="date">` for DOB with a Popover + Calendar combo using shadcn's datepicker pattern (from useful-context). Add a year dropdown `<Select>` above the calendar (range: current year down to 2005) and a month dropdown beside it. When year/month changes, the calendar navigates to that month. Output stays ISO format.

### Item 5 — Quick Add Walk-In Patient (P0)

**Problem:** Walk-in patients require navigating through Owner -> Pet -> Appointment forms separately.

**Changes:**
- **New: `src/components/WalkInModal.tsx`**: A `<Dialog>` with fields: Owner Name (req), Phone (req), Pet Name (req), Species (optional, default "Dog"). One submit button with loading/disabled state. On save: creates owner (pushes to `mockOwners`), creates pet (pushes to `mockPets`), creates appointment for today with status "scheduled" (pushes to `mockAppointments`). Shows success toast with pet name.
- **`src/pages/consultation/ConsultationsList.tsx`**: Add a "Quick Walk-In" button next to the vet filter. Opens the modal. After save, the new appointment appears in today's list immediately.
- **`src/pages/appointments/AppointmentsCalendar.tsx`**: Add "Walk-In" button in the toolbar next to "New".

---

## Batch 2: Navigation and Search (Items 3, 4, 6)

### Item 3 — Rename Consultations to Today's Patients (P2)

**Changes:**
- **`src/components/AppSidebar.tsx`**: Change label from "Consultations" to "Today's Patients", keep hint as "Today's patient queue".
- **`src/pages/consultation/ConsultationsList.tsx`**: Change page header from "Today's Consultations" to "Today's Patients".
- No route changes (`/consultations` stays).

### Item 4 — Top Search Bar (P0)

**Changes:**
- **`src/components/AppLayout.tsx`**: Add a search bar in the sticky header between `<SidebarTrigger>` and the user avatar. Uses `cmdk`'s `<Command>` component in a `<Popover>`. Debounced input (300ms via `setTimeout`).
- **New: `src/components/GlobalSearch.tsx`**: Component that searches `mockOwners` (by name, phone), `mockPets` (by name), groups results under "Owners" / "Pets" headings. Clicking a result navigates to `/owners/:id` or `/pets/:id`. Shows "No results" state. Keyboard accessible (arrow keys + Enter).

### Item 6 — Show Phone in Today's Patients List (P1)

**Changes:**
- **`src/pages/consultation/ConsultationsList.tsx`**: Add `apt.pet?.owner?.phone` as a subtitle under the owner name in each appointment card. Use a `Phone` icon and make it a clickable `tel:` link on mobile.

---

## Batch 3: Clinical Efficiency (Items 7, 10)

### Item 7 — One-Click Repeat Prescription (P0)

**Changes:**
- **`src/pages/consultation/ConsultationView.tsx`**: In the Prescriptions section, add a "Repeat Last Rx" button next to "Add Rx". When clicked, it finds the most recent `MedicalRecord` for the same pet (from `mockMedicalRecords`), copies its `prescriptions` array into the current form's prescription state as an editable draft. If no prior prescriptions exist, show a toast: "No previous prescriptions found for this pet." New prescriptions get new IDs on save; historical records remain untouched.

### Item 10 — WhatsApp Prescription Sharing (P1)

**Changes:**
- **`src/pages/consultation/ConsultationView.tsx`**: After saving a consultation, show a "Share via WhatsApp" button. Constructs a `wa.me` link with a text summary of the prescription (medication, dosage, frequency, duration). Uses `encodeURIComponent` for safe URL encoding. Opens in a new tab. Shows a toast confirming share attempt.

---

## Batch 4: Billing Efficiency (Items 8, 9)

### Item 8 — One-Click Repeat Invoice (P0)

**Changes:**
- **`src/pages/billing/InvoiceDetail.tsx`**: Add a "Repeat Invoice" button in the action bar. Navigates to `/billing/new?clone_from=inv-XXX`.
- **`src/pages/billing/InvoiceForm.tsx`**: Read `clone_from` search param. If present, find the invoice in `mockInvoices`, clone its `line_items` (description, quantity, unit_price) into the form as an editable draft. Pet auto-selected. Totals recalculate live. New invoice number generated on save.

### Item 9 — WhatsApp Invoice Sharing (P1)

**Changes:**
- **`src/pages/billing/InvoiceDetail.tsx`**: Add a "Share via WhatsApp" button. Constructs a `wa.me` link with invoice summary (invoice number, total, due date, line items). Uses `encodeURIComponent`. Opens in new tab. Shows toast logging the share attempt.

---

## Batch 5: Resilience and Logging (Items 11, 12)

### Item 11 — Resilient Form Saving (P0)

**Changes:**
- **`src/pages/billing/InvoiceForm.tsx`**: Add `useEffect` that saves form state to `localStorage` under key `draft_invoice` on every change (debounced 1s). On mount, check for existing draft and restore if found. Add a small "Draft restored" toast when restoring. Clear draft on successful submit.
- **`src/pages/consultation/ConsultationView.tsx`**: Same pattern — save SOAP note + vitals + prescriptions + follow-up state to `localStorage` under `draft_consultation_${appointmentId}`. Restore on mount. Clear on save.
- **All forms (PetForm, OwnerForm, AppointmentForm, InvoiceForm, ConsultationView)**: Add `disabled` state to submit buttons while saving (use `useState` for `isSaving`). Prevent double-click by disabling the button immediately on click.

### Item 12 — Workflow Action Logging (P2)

**Changes:**
- **New: `src/lib/audit-log.ts`**: A simple in-memory audit logger:
  ```
  interface AuditEntry {
    actor_id: string;
    action_type: string;
    entity_type: string;
    entity_id: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  }
  ```
  Exports `logAction(entry)` which pushes to an in-memory array and `console.info`s in dev. Exports `getAuditLog()` for future UI.
- **Integration points**: Call `logAction` from: InlineOwnerModal (owner create), WalkInModal (walk-in create), InvoiceForm (repeat invoice), ConsultationView (repeat prescription, save consultation), InvoiceDetail (WhatsApp share).

---

## File Changes Summary

| File | Action | Items |
|------|--------|-------|
| `src/pages/pets/PetForm.tsx` | Edit | 1, 2 |
| `src/components/InlineOwnerModal.tsx` | Create | 1 |
| `src/components/WalkInModal.tsx` | Create | 5 |
| `src/components/GlobalSearch.tsx` | Create | 4 |
| `src/components/AppLayout.tsx` | Edit | 4 |
| `src/components/AppSidebar.tsx` | Edit | 3 |
| `src/pages/consultation/ConsultationsList.tsx` | Edit | 3, 5, 6 |
| `src/pages/consultation/ConsultationView.tsx` | Edit | 7, 10, 11 |
| `src/pages/billing/InvoiceDetail.tsx` | Edit | 8, 9 |
| `src/pages/billing/InvoiceForm.tsx` | Edit | 8, 11 |
| `src/pages/appointments/AppointmentsCalendar.tsx` | Edit | 5 |
| `src/pages/appointments/AppointmentForm.tsx` | Edit | 11 |
| `src/pages/owners/OwnerForm.tsx` | Edit | 11 |
| `src/lib/mock-data.ts` | Edit | 1, 5 |
| `src/lib/audit-log.ts` | Create | 12 |

---

## Technical Notes

- `mockOwners`, `mockPets`, and `mockAppointments` need to be exported as mutable (`let` + exported push helpers) so walk-in and inline owner creation can add records at runtime without page reload
- The `cmdk` package (v1.1.1) is already installed for the command palette / searchable select pattern
- WhatsApp sharing uses simple `https://wa.me/?text=...` links -- no API integration needed now, but the audit log captures share attempts for future tracking
- All autosave drafts use `localStorage` with namespaced keys and are cleared on successful submit to prevent stale data
- The DOB picker uses shadcn Calendar + Popover pattern with `pointer-events-auto` class as specified in the useful-context

