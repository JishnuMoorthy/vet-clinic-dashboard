

# Plan: Update createMedicalRecord + Confirm DB Schema

## Analysis

After reviewing the current database schema and codebase:

**Already done (no changes needed):**
- `medical_records` table already has all SOAP dedicated columns (chief_complaint, symptoms, weight_kg, prescriptions_json, follow_up_json, etc.)
- `vaccinations` table already exists with all required columns
- `mapMedicalRecord` already reads from dedicated columns with JSON fallback for older records
- `GlobalSearch` already queries Supabase via `getOwners`/`getPets` from api-services
- `MultiSelectFilter` component already has searchable checkboxes across all pages

**One fix needed:**
- `createMedicalRecord` in `api-services.ts` (line 999-1028) still writes SOAP data as JSON into the `notes` column instead of using the dedicated columns. This means new records aren't using the proper schema.

---

## Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/api-services.ts` | Edit | Rewrite `createMedicalRecord` insert payload to write each SOAP field to its dedicated column instead of JSON-encoding into `notes` |

**Specifically**, the insert object will change from:
```
{ ..., notes: JSON.stringify({ chief_complaint, symptoms, vitals: {...}, ... }) }
```
to:
```
{ ..., chief_complaint, symptoms, duration_onset, appetite_behavior, prior_treatments,
  weight_kg, temperature_f, heart_rate_bpm, respiratory_rate, body_condition_score,
  physical_exam_findings, diagnostic_results, primary_diagnosis, differential_diagnoses,
  severity, prescriptions_json: data.prescriptions, procedures_performed,
  follow_up_instructions, next_appointment_recommendation, follow_up_json: data.follow_up }
```

No migration needed since all columns already exist. No other file changes required.

