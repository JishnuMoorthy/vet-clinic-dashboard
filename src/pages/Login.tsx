import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PawPrint, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QUICK_LOGINS = [
  { label: "Admin", email: "admin@miavet.com", password: "Admin@2026!", icon: "🛡️" },
  { label: "Veterinarian", email: "drsmith@miavet.com", password: "Vet@2026!", icon: "🩺" },
  { label: "Staff", email: "staff@miavet.com", password: "Staff@2026!", icon: "👤" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleQuickLogin = async (qEmail: string, qPassword: string) => {
    try {
      await login(qEmail, qPassword);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center space-y-2 pb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <PawPrint className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Mia VMS</h1>
          <p className="text-sm text-muted-foreground">Sign in to your clinic dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                Remember me
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Quick Access</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_LOGINS.map((q) => (
                <Button
                  key={q.label}
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3 text-xs"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin(q.email, q.password)}
                >
                  <span className="text-lg">{q.icon}</span>
                  <span>{q.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
