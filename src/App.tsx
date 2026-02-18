import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ClinicDashboard from "@/pages/ClinicDashboard";
import PetsList from "@/pages/pets/PetsList";
import PetDetail from "@/pages/pets/PetDetail";
import PetForm from "@/pages/pets/PetForm";
import OwnersList from "@/pages/owners/OwnersList";
import OwnerDetail from "@/pages/owners/OwnerDetail";
import OwnerForm from "@/pages/owners/OwnerForm";
import AppointmentsCalendar from "@/pages/appointments/AppointmentsCalendar";
import AppointmentsList from "@/pages/appointments/AppointmentsList";
import AppointmentForm from "@/pages/appointments/AppointmentForm";
import InvoicesList from "@/pages/billing/InvoicesList";
import InvoiceDetail from "@/pages/billing/InvoiceDetail";
import InvoiceForm from "@/pages/billing/InvoiceForm";
import InventoryList from "@/pages/inventory/InventoryList";
import InventoryForm from "@/pages/inventory/InventoryForm";
import StaffList from "@/pages/staff/StaffList";
import StaffForm from "@/pages/staff/StaffForm";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/operations" element={<ProtectedRoute allowedRoles={["admin"]}><ClinicDashboard /></ProtectedRoute>} />
              {/* Pets */}
              <Route path="/pets" element={<PetsList />} />
              <Route path="/pets/new" element={<PetForm />} />
              <Route path="/pets/:id" element={<PetDetail />} />
              <Route path="/pets/:id/edit" element={<PetForm />} />
              {/* Owners */}
              <Route path="/owners" element={<OwnersList />} />
              <Route path="/owners/new" element={<OwnerForm />} />
              <Route path="/owners/:id" element={<OwnerDetail />} />
              <Route path="/owners/:id/edit" element={<OwnerForm />} />
              {/* Appointments */}
              <Route path="/appointments" element={<AppointmentsCalendar />} />
              <Route path="/appointments/list" element={<AppointmentsList />} />
              <Route path="/appointments/new" element={<AppointmentForm />} />
              {/* Billing (admin) */}
              <Route path="/billing" element={<ProtectedRoute allowedRoles={["admin"]}><InvoicesList /></ProtectedRoute>} />
              <Route path="/billing/new" element={<ProtectedRoute allowedRoles={["admin"]}><InvoiceForm /></ProtectedRoute>} />
              <Route path="/billing/:id" element={<ProtectedRoute allowedRoles={["admin"]}><InvoiceDetail /></ProtectedRoute>} />
              {/* Inventory (admin) */}
              <Route path="/inventory" element={<ProtectedRoute allowedRoles={["admin"]}><InventoryList /></ProtectedRoute>} />
              <Route path="/inventory/new" element={<ProtectedRoute allowedRoles={["admin"]}><InventoryForm /></ProtectedRoute>} />
              <Route path="/inventory/:id/edit" element={<ProtectedRoute allowedRoles={["admin"]}><InventoryForm /></ProtectedRoute>} />
              {/* Staff (admin) */}
              <Route path="/staff" element={<ProtectedRoute allowedRoles={["admin"]}><StaffList /></ProtectedRoute>} />
              <Route path="/staff/new" element={<ProtectedRoute allowedRoles={["admin"]}><StaffForm /></ProtectedRoute>} />
              <Route path="/staff/:id/edit" element={<ProtectedRoute allowedRoles={["admin"]}><StaffForm /></ProtectedRoute>} />
              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
