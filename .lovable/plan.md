

# Medical Records Module & Vet Consultation View

## Overview
This plan introduces a **Medical Records** system based on the industry-standard **SOAP format** (Subjective, Objective, Assessment, Plan) used universally in veterinary practice. It also adds a **Vet Consultation View** -- the screen a doctor sees when a checked-in patient enters the room -- giving them everything they need at a glance without navigating away.

---

## What are SOAP Notes?

Every veterinary visit generates a structured clinical note:

- **S - Subjective**: What the owner reports (symptoms, behavior changes, timeline)
- **O - Objective**: What the vet measures (vitals, physical exam findings, lab results)
- **A - Assessment**: The vet's diagnosis or differential diagnoses
- **P - Plan**: Treatment prescribed, medications, follow-ups, client instructions

This is the global standard taught in every veterinary school and used by leading practice management systems (ezyVet, Vetspire, Shepherd, etc.).

---

## Data Points Captured Per Medical Record

### Core SOAP Fields
| Field | Type | Purpose |
|-------|------|---------|
| Visit date | Date | When the exam occurred |
| Linked appointment | Reference | Ties record to the appointment |
| Attending vet | Reference | Who conducted the exam |
| Chief complaint | Text | Reason for visit (from owner) |

### Subjective (Owner-reported)
| Field | Type | Purpose |
|-------|------|---------|
| Symptoms description | Text | What the owner observed |
| Duration / onset | Text | How long symptoms have been present |
| Appetite & behavior changes | Text | Eating, drinking, energy level |
| Prior treatments attempted | Text | Home remedies or other vet visits |

### Objective (Vet-measured)
| Field | Type | Purpose |
|-------|------|---------|
| Weight (kg) | Number | Current weight at visit |
| Temperature (deg F) | Number | Normal range: 100-102.5 F for dogs, 100.5-102.5 F for cats |
| Heart rate (bpm) | Number | Beats per minute |
| Respiratory rate (breaths/min) | Number | Breaths per minute |
| Body condition score (1-9) | Number | Standardized nutritional assessment |
| Physical exam findings | Text | Vet's hands-on observations (eyes, ears, skin, teeth, etc.) |
| Diagnostic results | Text | Lab work, X-rays, ultrasound findings |

### Assessment
| Field | Type | Purpose |
|-------|------|---------|
| Primary diagnosis | Text | Main condition identified |
| Differential diagnoses | Text | Other possible conditions |
| Severity | Select | Mild / Moderate / Severe / Critical |

### Plan
| Field | Type | Purpose |
|-------|------|---------|
| Prescriptions | Structured list | Medication name, dosage, frequency, duration |
| Procedures performed | Text | Surgeries, dental cleaning, etc. |
| Follow-up instructions | Text | Home care, dietary changes |
| Next appointment recommendation | Text | Recheck timing |

### Vaccination Tracker (Separate Tab)
| Field | Type | Purpose |
|-------|------|---------|
| Vaccine name | Text | e.g., Rabies, DHPP, FVRCP |
| Date administered | Date | When given |
| Next due date | Date | When booster is needed |
| Batch / lot number | Text | For regulatory traceability |
| Administered by | Reference | Which vet gave it |

---

## What Gets Built

### 1. New Types (`src/types/api.ts`)
- `MedicalRecord` interface with all SOAP fields, vitals, prescriptions
- `Vaccination` interface for the immunization tracker
- `Prescription` sub-interface (medication, dosage, frequency, duration)

### 2. Mock Data (`src/lib/mock-data.ts`)
- 6-8 sample medical records across different pets (vaccination visits, sick visits, surgery follow-ups)
- 5-6 vaccination records with due dates (some overdue for alert testing)

### 3. Vet Consultation View (`src/pages/consultation/ConsultationView.tsx`)
**Route**: `/consultation/:appointmentId` (accessible by `vet` and `admin` roles)

This is the primary screen a vet sees after a patient is checked in. It displays:

- **Header**: Pet name, species/breed, age, weight, owner name and phone (one-glance identification)
- **Alert Banner**: Allergies, overdue vaccinations, special handling notes
- **Left Column**: 
  - Current appointment reason
  - Vitals entry form (weight, temp, heart rate, respiratory rate, BCS)
  - SOAP note form with clearly labeled sections
- **Right Column**:
  - Medical history timeline (past SOAP notes, most recent first)
  - Vaccination status card (with overdue items highlighted)
  - Active prescriptions

A "Complete & Save" button saves the record and marks the appointment as completed.

### 4. Medical Records Form (`src/pages/medical-records/MedicalRecordForm.tsx`)
**Route**: `/pets/:petId/records/new` and `/pets/:petId/records/:recordId`

Standalone form for creating/editing medical records outside of the consultation flow. Uses the same SOAP structure with guided sections and `useUnsavedChanges` protection.

### 5. Pet Detail Enhancement (`src/pages/pets/PetDetail.tsx`)
Add two new tabs/cards to the existing pet detail page:
- **Medical History** card: Chronological list of SOAP records with expandable entries
- **Vaccinations** card: Table of vaccines with status indicators (current / due soon / overdue)
- Quick-action button: "Add Medical Record"

### 6. Appointment Integration
- On the Appointments Calendar, checked-in/scheduled appointments for the logged-in vet get a "Start Consultation" button that navigates to the consultation view
- Completing a consultation auto-updates the appointment status to "completed"

### 7. Sidebar Update (`src/components/AppSidebar.tsx`)
- Add "Consultations" link under the Clinic group (visible to `vet` and `admin` roles) pointing to a filtered view of today's appointments for the logged-in vet

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/api.ts` | Edit | Add `MedicalRecord`, `Vaccination`, `Prescription` interfaces |
| `src/lib/mock-data.ts` | Edit | Add `mockMedicalRecords`, `mockVaccinations` data |
| `src/pages/consultation/ConsultationView.tsx` | Create | Vet's patient encounter screen |
| `src/pages/medical-records/MedicalRecordForm.tsx` | Create | SOAP note creation/edit form |
| `src/pages/pets/PetDetail.tsx` | Edit | Add medical history and vaccination cards |
| `src/pages/appointments/AppointmentsCalendar.tsx` | Edit | Add "Start Consultation" action for vets |
| `src/components/AppSidebar.tsx` | Edit | Add Consultations nav item for vet/admin |
| `src/App.tsx` | Edit | Register new routes with role protection |

---

## Guiding Principles
- All new components use existing shadcn/ui primitives (`Card`, `Tabs`, `Badge`, `Button`, `Input`, `Textarea`, `Select`)
- Currency in INR where applicable
- Semantic Tailwind tokens only (no hardcoded colors)
- `useUnsavedChanges` on all new forms
- Toast confirmations on save/complete actions
- Mobile-responsive layouts using the existing grid patterns
- No existing functionality is modified or broken -- only additive changes

