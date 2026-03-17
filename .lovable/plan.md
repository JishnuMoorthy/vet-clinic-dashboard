

# Plan: Fix 404 Errors + Add Save Draft to All Forms

## Issues Found

### 1. Calendar Edit Button -> 404
The calendar popup navigates to `/appointments/${apt.id}/edit` (line 962 of AppointmentsCalendar.tsx), but no such route exists in App.tsx. The AppointmentForm expects a query parameter: `/appointments/new?edit=<id>`.

**Fix:** Change the navigate call in AppointmentsCalendar from `/appointments/${apt.id}/edit` to `/appointments/new?edit=${apt.id}`.

### 2. Breadcrumb "Records" -> 404
When on `/pets/:petId/records/new`, the breadcrumb generates a clickable link for `/pets/:petId/records` — but that route doesn't exist. Also "records" isn't in the `routeLabels` map.

**Fix in Breadcrumbs.tsx:**
- Add `records: "Records"` to `routeLabels`
- Add `consultations: "Today's Patients"` and `consultation: "Consultation"` while we're there
- Make the `/pets/:id/records` crumb link redirect to `/pets/:id` (the pet detail page, which shows medical history) instead of the non-existent records route

### 3. Save Draft Missing from Most Forms
Currently only ConsultationView and InvoiceForm have localStorage draft autosave. These forms lack it:
- **PetForm** (new pet registration)
- **OwnerForm** (new owner)
- **AppointmentForm** (new appointment)
- **StaffForm** (new staff)
- **InventoryForm** (new inventory item)
- **MedicalRecordForm** (new medical record)

**Fix:** Add the same draft pattern (debounced localStorage save + restore on mount + clear on successful submit) to each form. No DB changes needed — drafts are ephemeral local storage, matching the existing pattern in ConsultationView/InvoiceForm.

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/appointments/AppointmentsCalendar.tsx` | Fix edit navigate to use query param |
| `src/components/Breadcrumbs.tsx` | Add "records" label; redirect `/pets/:id/records` to `/pets/:id` |
| `src/pages/pets/PetForm.tsx` | Add draft autosave/restore (only for new, not edit) |
| `src/pages/owners/OwnerForm.tsx` | Add draft autosave/restore |
| `src/pages/appointments/AppointmentForm.tsx` | Add draft autosave/restore |
| `src/pages/staff/StaffForm.tsx` | Add draft autosave/restore |
| `src/pages/inventory/InventoryForm.tsx` | Add draft autosave/restore |
| `src/pages/medical-records/MedicalRecordForm.tsx` | Add draft autosave/restore |

No database or migration changes needed. All drafts use localStorage with keys like `draft_pet_form`, `draft_owner_form`, etc., cleared on successful save.

