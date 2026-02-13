import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DemoBanner } from "@/components/DemoBanner";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.full_name}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <DemoBanner />
          <div className="mt-3">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
