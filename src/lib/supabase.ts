export { supabase } from "@/integrations/supabase/client";

export function getClinicId(): string {
  const stored = localStorage.getItem("auth_user");
  if (stored) {
    const user = JSON.parse(stored);
    return user.clinic_id;
  }
  return "";
}
