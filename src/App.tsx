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
import PetsList from "@/pages/PetsList";
import PetDetail from "@/pages/PetDetail";
import PetForm from "@/pages/PetForm";
import OwnersList from "@/pages/OwnersList";
import OwnerDetail from "@/pages/OwnerDetail";
import OwnerForm from "@/pages/OwnerForm";
import Appointments from "@/pages/Appointments";
import BillingList from "@/pages/BillingList";
import BillingDetail from "@/pages/BillingDetail";
import BillingForm from "@/pages/BillingForm";
import Inventory from "@/pages/Inventory";
import Staff from "@/pages/Staff";
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
              <Route path="/pets" element={<PetsList />} />
              <Route path="/pets/new" element={<PetForm />} />
              <Route path="/pets/:id" element={<PetDetail />} />
              <Route path="/pets/:id/edit" element={<PetForm />} />
              <Route path="/owners" element={<OwnersList />} />
              <Route path="/owners/new" element={<OwnerForm />} />
              <Route path="/owners/:id" element={<OwnerDetail />} />
              <Route path="/owners/:id/edit" element={<OwnerForm />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/billing" element={<ProtectedRoute allowedRoles={["admin"]}><BillingList /></ProtectedRoute>} />
              <Route path="/billing/new" element={<ProtectedRoute allowedRoles={["admin"]}><BillingForm /></ProtectedRoute>} />
              <Route path="/billing/:id" element={<ProtectedRoute allowedRoles={["admin"]}><BillingDetail /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute allowedRoles={["admin"]}><Inventory /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute allowedRoles={["admin"]}><Staff /></ProtectedRoute>} />
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
