

# Services Catalog and Medication Billing Integration

## Overview

Create a Services Catalog that admins can manage (add/edit/delete services with prices), and integrate it into the invoice creation flow so staff can search and auto-populate line items. Also integrate inventory medications as billable items with automatic price population.

---

## What Changes

### 1. New data types and mock data

**`src/types/api.ts`** -- Add a `ServiceItem` interface:
```
interface ServiceItem {
  id: string;
  name: string;
  category: "consultation" | "procedure" | "diagnostic" | "vaccination" | "grooming" | "surgery" | "medication" | "other";
  price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**`src/lib/mock-data.ts`** -- Add a mutable `mockServices` array with ~15 predefined services covering:
- Consultations (General Consultation: 500, Follow-up: 300, Emergency: 1500)
- Procedures (Dental Cleaning: 3000, Spay/Neuter: 5000, Wound Dressing: 800)
- Diagnostics (Blood Panel: 3500, X-Ray: 2500, Ultrasound: 4000, Urinalysis: 1200)
- Vaccinations (Rabies: 1500, DHPP: 1200, Deworming: 300)
- Grooming (Full Grooming: 1200, Nail Trim: 200)

Also expose `addService` and `updateService` helper functions for runtime CRUD.

### 2. Services Catalog management page (admin only)

**New: `src/pages/services/ServicesCatalog.tsx`** -- A table-based management page:
- Search/filter bar at the top
- Table columns: Service Name, Category, Price, Status, Actions (Edit/Delete)
- "Add Service" button opens a dialog with fields: Name (req), Category (select), Price (req), Description (opt)
- Inline edit via the same dialog pattern
- Delete with ConfirmDialog
- "Other" category option allows free-text for custom services

**`src/App.tsx`** -- Add route: `/services` under admin-protected routes

**`src/components/AppSidebar.tsx`** -- Add "Services" nav item under Administration section (between Billing and Inventory), using the `ClipboardList` icon

### 3. Searchable service picker in Invoice Form

**`src/pages/billing/InvoiceForm.tsx`** -- Replace the plain text `<Input>` for the "Service / Item" column with a searchable combobox (using `cmdk`):
- When user starts typing, a dropdown shows matching services from `mockServices` + matching medications from `mockInventory` (filtered by category "Medications")
- Results grouped under "Services" and "Medications" headings
- Selecting a service auto-fills the description AND the unit price
- User can still type free text for custom items (the "Other" option)
- Price field remains editable after auto-fill (admin can override)
- An "Other (custom)" option always appears at the bottom, keeping the current free-text behavior

### 4. Medication integration in billing

Medications from `mockInventory` (category "Medications") appear as a separate group in the service search dropdown in the invoice form. When selected:
- Description auto-fills with the medication name
- Price auto-fills from the inventory item's `unit_price`
- Quantity defaults to 1 but is editable

This means admins don't need to remember medication prices -- they search "Amoxicillin" and it populates automatically.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/api.ts` | Edit | Add `ServiceItem` interface |
| `src/lib/mock-data.ts` | Edit | Add `mockServices` array with ~15 services + helper functions |
| `src/pages/services/ServicesCatalog.tsx` | Create | Admin CRUD page for services catalog |
| `src/pages/billing/InvoiceForm.tsx` | Edit | Replace line item description input with searchable combobox that searches services + medications |
| `src/App.tsx` | Edit | Add `/services` route (admin-protected) |
| `src/components/AppSidebar.tsx` | Edit | Add "Services" link in Administration nav |

---

## Technical Notes

- The service picker in `InvoiceForm` uses the existing `cmdk` package (already installed) wrapped in a `Popover` for each line item's description field
- Searching combines `mockServices.filter(...)` and `mockInventory.filter(i => i.category === "Medications")` results into grouped dropdown sections
- When a service/medication is selected, both `description` and `unit_price` fields update via the existing `updateItem()` function
- The "Other (custom)" fallback ensures backward compatibility -- users can always type a custom description with a manual price
- The services catalog page follows the same table + dialog pattern used in `InventoryList.tsx` and `StaffList.tsx`
- Mock services are exported as a mutable array (`let`) with `addService`/`updateService` helpers, matching the pattern used for `mockOwners` and `mockPets`

