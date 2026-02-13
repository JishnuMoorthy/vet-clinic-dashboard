import type { User, AuthResponse, DashboardData } from "@/types/api";

interface MockCredential {
  email: string;
  password: string;
  user: User;
}

const mockUsers: MockCredential[] = [
  {
    email: "admin@pawscare.com",
    password: "Admin@2026!",
    user: {
      id: "mock-admin-001",
      email: "admin@pawscare.com",
      full_name: "Admin User",
      role: "admin",
      phone: "+91-9000000001",
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  },
  {
    email: "rajesh.sharma@pawscare.com",
    password: "Vet@2026!",
    user: {
      id: "mock-vet-001",
      email: "rajesh.sharma@pawscare.com",
      full_name: "Dr. Rajesh Sharma",
      role: "vet",
      phone: "+91-9000000002",
      specialties: ["Surgery", "Dermatology"],
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  },
  {
    email: "anjali@pawscare.com",
    password: "Staff@2026!",
    user: {
      id: "mock-staff-001",
      email: "anjali@pawscare.com",
      full_name: "Anjali Patel",
      role: "staff",
      phone: "+91-9000000003",
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  },
];

export function mockLogin(email: string, password: string): AuthResponse {
  const match = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!match) {
    throw new Error("Invalid email or password");
  }
  return {
    access_token: `mock-token-${match.user.id}-${Date.now()}`,
    token_type: "bearer",
    user: match.user,
  };
}

export const mockDashboardData: DashboardData = {
  todays_appointments: 5,
  pending_invoices: 3,
  total_pets: 42,
  total_owners: 28,
  upcoming_appointments: [],
  recent_invoices: [],
  low_stock_items: [],
};
