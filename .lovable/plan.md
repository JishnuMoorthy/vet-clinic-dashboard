

# Follow-Up Appointment System for Consultations

## Overview

Replace the free-text "Next Appointment" field in the consultation view with a structured follow-up system, and surface follow-up requests visually in the Appointments calendar so admins can act on them.

---

## What Changes

### 1. Replace "Next Appointment" text input with a structured follow-up section

In the Plan (P) section of the SOAP note, the current single text input:
```
Next Appointment: [_______________]
```

Becomes a structured widget:

- **Toggle button group** with three options:
  - "Follow-up Needed" (selected state highlights in primary color)
  - "No Follow-up Needed"  
  - "Conditional" (e.g., "if not improving")
- When "Follow-up Needed" or "Conditional" is selected, additional fields appear:
  - **Urgency** selector: "Within 1 week" / "Within 2 weeks" / "Within 1 month" / "Within 3 months"
  - **Reason for follow-up** (short text input, e.g., "Recheck skin rash", "Post-surgery eval")
  - For "Conditional": a **condition note** (e.g., "Return if symptoms worsen")
- When "No Follow-up Needed" is selected, the extra fields are hidden

### 2. Update the data model

Add a `follow_up` object to `MedicalRecord` in `src/types/api.ts`:
```
follow_up?: {
  status: "needed" | "not_needed" | "conditional";
  urgency?: "1_week" | "2_weeks" | "1_month" | "3_months";
  reason?: string;
  condition_note?: string;
}
```

Update `mockMedicalRecords` in `mock-data.ts` to include follow-up data on existing records (e.g., rec-002 gets `{ status: "needed", urgency: "2_weeks", reason: "Recheck skin rash" }`).

### 3. Surface follow-up indicators in the Appointments Calendar for admins

When an admin views the appointments calendar, completed appointments that have a linked medical record requesting a follow-up will show:

- A small badge/icon on the appointment card in the calendar (e.g., a colored dot or "Follow-up Requested" tag)
- In the appointment detail dialog, a **"Follow-up Requested"** banner appears with:
  - Urgency (e.g., "Within 2 weeks")
  - Reason (e.g., "Recheck skin rash")  
  - Requesting vet name
  - A **"Schedule Follow-up"** button that opens the appointment form pre-filled with the pet, owner, and reason

### 4. Follow-up indicator in Consultations list

On the Consultations page, completed consultations that requested a follow-up show a small "Follow-up" badge next to the status, so vets can see at a glance which of their completed cases need return visits.

---

## Admin Workflow

```text
Doctor completes consultation
        |
        v
  Selects "Follow-up Needed"
  + urgency + reason
        |
        v
  Saves consultation
        |
        v
  Admin opens Appointments Calendar
        |
        v
  Sees follow-up indicator on completed appointments
        |
        v
  Clicks appointment -> sees follow-up details
        |
        v
  Clicks "Schedule Follow-up" -> appointment form
  pre-filled with pet, reason, suggested date range
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/api.ts` | Edit | Add `follow_up` field to `MedicalRecord` interface |
| `src/lib/mock-data.ts` | Edit | Add follow-up data to existing mock medical records |
| `src/pages/consultation/ConsultationView.tsx` | Edit | Replace "Next Appointment" input with follow-up toggle group + conditional fields |
| `src/pages/appointments/AppointmentsCalendar.tsx` | Edit | Show follow-up badge on completed appointments; add follow-up banner + "Schedule Follow-up" button in detail dialog (admin only) |
| `src/pages/consultation/ConsultationsList.tsx` | Edit | Show follow-up badge on completed consultation cards |

---

## Technical Details

- The follow-up toggle uses shadcn `ToggleGroup` (single-select) with three items styled as pill buttons
- Urgency uses a `Select` dropdown for clean UX
- The calendar looks up `mockMedicalRecords.find(r => r.appointment_id === apt.id)` to check for follow-up data on completed appointments
- "Schedule Follow-up" navigates to `/appointments/new?pet_id=X&reason=Follow-up: Y` leveraging the existing appointment form's URL param pre-fill capability
- The `next_appointment_recommendation` string field is replaced by the structured `follow_up` object -- the old field will be removed from the SOAP state

