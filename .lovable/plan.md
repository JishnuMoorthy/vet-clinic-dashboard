

# Appointment Editing, Walk-In Improvements, DOB Picker Fix, Confirmations, and Pet Photo

## Overview

Five distinct improvements requested, all surgical changes that preserve existing functionality.

---

## 1. Edit Appointment from the Detail Pop-up

**Current:** The appointment detail dialog only shows Complete, Cancel, and View Pet buttons for scheduled appointments.

**Change:** Add an "Edit Appointment" button (with a Pencil icon) in the `AppointmentDetailActions` component for scheduled appointments. Clicking it closes the dialog and navigates to `/appointments/new?edit={apt.id}` (or a dedicated edit route).

Since the existing `AppointmentForm` already supports URL param pre-filling (`date`, `time`, `pet_id`, `reason`), we'll extend it to accept an `edit` param that loads the full appointment data (vet, date, time, reason, notes) into the form as an editable draft. On submit, it updates the appointment in-place instead of creating a new one.

**Files:**
- `src/pages/appointments/AppointmentsCalendar.tsx` -- Add "Edit" button in `AppointmentDetailActions` for scheduled appointments
- `src/pages/appointments/AppointmentForm.tsx` -- Read `edit` search param, load appointment data into form, change submit behavior to update instead of create

---

## 2. Add Doctor Selection to Walk-In Modal

**Current:** The Walk-In modal auto-assigns the first vet found. User wants to choose the doctor.

**Change:** Add a Vet `<Select>` dropdown to the WalkInModal (between Pet Name and Species), populated from `mockUsers` filtered by `role === "vet"`. Also add a "Reason" text input (optional, defaults to "Walk-in"). The vet field will be required.

**Files:**
- `src/components/WalkInModal.tsx` -- Add vet_id and reason fields to the form state, add Select for vet and Input for reason in the UI

---

## 3. Fix DOB Calendar Popover Jumping

**Current:** When the user changes months in the DOB picker, the calendar height changes (28 vs 31 days = 4 vs 5 rows), causing the popover to shift position.

**Change:** Set a fixed `min-height` on the `PopoverContent` or the Calendar wrapper so the popover size remains constant regardless of how many weeks the month has. A 6-row calendar (max possible) height will be used as the fixed minimum.

**Files:**
- `src/pages/pets/PetForm.tsx` -- Add a fixed min-height style to the PopoverContent or Calendar container, and set `fixedWeeks` prop on the `Calendar` component (react-day-picker supports `fixedWeeks` which always renders 6 rows)

---

## 4. Add Confirmation Dialogs to Destructive/Important Actions

**Current:** Complete and Cancel actions in the appointment dialog fire immediately with no confirmation.

**Change:** Wrap the following actions with the existing `ConfirmDialog` component:
- **Complete appointment** -- "Are you sure you want to mark this appointment as completed?"
- **Cancel appointment** -- "Are you sure you want to cancel this appointment? This cannot be undone." (destructive style)
- **Edit/Save changes** on PetForm (when editing) -- "Confirm saving changes to {pet name}?"

This uses the existing `ConfirmDialog` component already in the codebase.

**Files:**
- `src/pages/appointments/AppointmentsCalendar.tsx` -- Add confirm state for complete and cancel actions in `AppointmentDetailActions`
- `src/pages/pets/PetForm.tsx` -- Add confirm dialog before saving edits (edit mode only)

---

## 5. Pet Photo Upload and Display

**Current:** No photo field exists for pets.

**Change:**
- Add an optional `photo_url?: string` field to the `Pet` type
- In `PetForm.tsx`, add a photo upload area (click-to-upload or drag-and-drop) at the top of the form. Since there's no backend storage, this will use a `FileReader` to create a data URL stored in form state. The preview shows a circular thumbnail.
- Add sample `photo_url` values to mock pets in `mock-data.ts` using placeholder URLs (e.g., `https://images.unsplash.com/...` for dogs/cats)
- In `ConsultationView.tsx`, display the pet's photo as a small avatar next to the pet name in the patient info header
- In `PetDetail.tsx`, show the photo prominently at the top of the pet profile

**Files:**
- `src/types/api.ts` -- Add `photo_url?: string` to `Pet` interface
- `src/lib/mock-data.ts` -- Add photo URLs to mock pets
- `src/pages/pets/PetForm.tsx` -- Add photo upload input with preview
- `src/pages/consultation/ConsultationView.tsx` -- Show pet photo avatar in patient info section
- `src/pages/pets/PetDetail.tsx` -- Show pet photo at top of profile

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/types/api.ts` | Add `photo_url` to Pet interface |
| `src/lib/mock-data.ts` | Add photo URLs to mock pets, add vet selection to mock data |
| `src/pages/appointments/AppointmentsCalendar.tsx` | Add Edit button in detail dialog; add ConfirmDialog for Complete/Cancel |
| `src/pages/appointments/AppointmentForm.tsx` | Support `edit` param to load and update existing appointment |
| `src/components/WalkInModal.tsx` | Add vet selector and reason field |
| `src/pages/pets/PetForm.tsx` | Fix DOB popover jumping (fixedWeeks); add photo upload; add confirm dialog for edits |
| `src/pages/pets/PetDetail.tsx` | Display pet photo |
| `src/pages/consultation/ConsultationView.tsx` | Display pet photo avatar |

---

## Technical Notes

- The `fixedWeeks` prop on `react-day-picker`'s `DayPicker` component forces 6 rows to always render, preventing height changes. This is the cleanest fix for the jumping issue.
- Pet photos use `FileReader.readAsDataURL()` for the demo (no backend needed). The data URL is stored in the form state and would be replaced with a proper storage URL in production.
- The `ConfirmDialog` component already exists and follows the AlertDialog pattern -- we just wire it into the appointment actions and pet edit form.
- The edit appointment flow reuses the existing `AppointmentForm` component by checking for an `edit` search parameter and pre-populating all fields from the matching appointment.

