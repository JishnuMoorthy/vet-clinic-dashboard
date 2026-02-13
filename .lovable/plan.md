

# 🐾 Mia VMS — Veterinary Admin Dashboard

A production-ready admin dashboard for managing a veterinary clinic, integrating with your FastAPI backend at `http://localhost:8000/api/v1`.

---

## Phase 1: Foundation & Authentication (Days 1-2)

### 1. Project Setup & Design System
- Configure a professional healthcare color scheme (teal/blue primary, clean neutrals)
- Set up TypeScript types for all API entities (Pet, Owner, Appointment, Invoice, Inventory, User)
- Create a centralized API client (`lib/api.ts`) with automatic token injection, error handling, and base URL configuration
- Set up auth context with login/logout, token storage, and role-based access

### 2. Login Page (`/login`)
- Clean login form with email + password fields and "Remember me" option
- Form validation with error feedback
- API integration: `POST /auth/login` → store token → redirect to dashboard
- Professional branding with clinic name

### 3. App Layout & Navigation
- Sidebar navigation with icons for all 8 sections (Dashboard, Pets, Owners, Appointments, Billing, Inventory, Staff, Settings)
- Top header with clinic name, user info, and logout button
- Role-based menu visibility (staff can't see Billing, Inventory, Staff)
- Collapsible sidebar with mobile-responsive hamburger menu
- Protected routes that redirect unauthenticated users to login

---

## Phase 2: Core Pages & CRUD Operations (Days 3-5)

### 4. Dashboard (`/dashboard`)
- 4 stat cards: Today's Appointments, Pending Invoices, Total Pets, Total Owners
- Today's appointments list (scrollable, clickable)
- Pending invoices section with quick actions
- Low stock inventory alerts
- Recent activity feed
- Data from: `GET /clinic/dashboard`

### 5. Pets Management (`/pets`, `/pets/:id`, `/pets/new`)
- **List page**: Searchable/filterable table with columns (Name, Breed, Species, Owner, Status) + pagination
- **Detail page**: Pet info card, quick actions (Schedule Appt, View Medical, Create Invoice), upcoming appointments
- **Create/Edit form**: All fields (Name, Species, Breed, Gender, DOB, Owner dropdown, Weight, Microchip ID, Notes) with validation
- **Delete**: Confirmation dialog
- APIs: Full CRUD on `/pets`

### 6. Pet Owners Management (`/owners`, `/owners/:id`, `/owners/new`)
- **List page**: Table with Name, Phone, Email, # Pets, Last Visit + search
- **Detail page**: Contact info, list of owned pets (clickable), appointment & invoice history
- **Create/Edit form**: Name, Phone, Email, Address with validation
- APIs: Full CRUD on `/pet_parents`

### 7. Appointments (`/appointments`, `/appointments/new`)
- **Calendar/list view**: Week view with time slots, color-coded by vet
- **Schedule form**: Pet dropdown, Vet dropdown, Date picker, Time picker (30-min slots), Reason, Notes
- **Actions**: Reschedule, Mark Complete (`PUT /appointments/{id}/mark-complete`), Cancel
- Filters: By Vet, Date Range, Status

### 8. Billing & Invoices (`/billing`, `/billing/:id`, `/billing/new`)
- **List page**: Table with Invoice #, Pet/Owner, Amount, Status badges (Paid ✅, Pending ⏳, Overdue 🔴), Due Date
- **Invoice detail**: Full invoice with line items, totals, payment status
- **Create form**: Pet selector, dynamic line items (add/remove), discount, auto-calculated totals
- **Actions**: Mark Paid (modal with payment method), Send Reminder, Print
- Admin-only access

### 9. Inventory Management (`/inventory`, `/inventory/:id`)
- **List page**: Table with Item Name, Category, Qty, Reorder Level, Status indicators (OK/LOW/OUT)
- **Create/Edit form**: Name, Category, Quantity, Reorder Level, Unit Price, Supplier, Expiry Date
- **Record Usage modal**: Quantity change, reason dropdown, notes
- Admin-only access

### 10. Staff Management (`/staff`)
- **List page**: Table with Name, Role, Email, Phone, appointment counts
- **Add/Edit form**: Name, Email, Phone, Role (vet/staff), Specialties
- Admin-only access

---

## Phase 3: Polish & Responsiveness (Days 6-7)

### 11. Mobile Responsive Design
- All pages fully responsive across mobile, tablet, and desktop
- Mobile-friendly navigation (bottom nav or hamburger menu)
- Touch-friendly table actions and form inputs
- Readable typography (16px minimum on mobile)

### 12. Production Polish
- Skeleton loading states on all data-fetching pages
- Toast notifications for all CRUD success/error actions
- Form validation feedback on all forms
- Error boundaries with user-friendly fallback UI
- Empty states for tables with no data
- Confirmation dialogs for all delete operations

### 13. Settings Page (`/settings`)
- User profile display (name, email, role)
- Basic preferences

