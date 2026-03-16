import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStaff, deleteStaff } from "@/lib/api-services";
import { mockUsers } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Trash2, CheckCircle2, XCircle, Filter } from "lucide-react";

export default function StaffList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const { data: staffRes } = useQuery({
    queryKey: ["staff"],
    queryFn: () => getStaff(),
  });

  const users = staffRes?.data ?? mockUsers;

  // Collect unique specialties
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.specialties?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [users]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      const deletedUser = users.find((u) => u.id === deleteId);
      toast({ title: `${deletedUser?.full_name} removed` });
      setDeleteId(null);
    },
  });

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.is_active) ||
      (statusFilter === "inactive" && !u.is_active);
    const matchSpecialty =
      specialtyFilter === "all" ||
      (u.specialties && u.specialties.includes(specialtyFilter));
    return matchSearch && matchRole && matchStatus && matchSpecialty;
  });

  const deleteName = users.find((u) => u.id === deleteId)?.full_name;
  const isSelfDelete = deleteId === currentUser?.id;

  const handleDeleteAttempt = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Cannot remove yourself",
        description: "You cannot delete your own account. Ask another admin to do this.",
        variant: "destructive",
      });
      return;
    }
    setDeleteId(userId);
  };

  const hasFilters = roleFilter !== "all" || statusFilter !== "all" || specialtyFilter !== "all";

  return (
    <div className="space-y-4">
      <PageHeader title="Staff Management" actionLabel="Add Staff" onAction={() => navigate("/staff/new")} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="vet">Vet</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {allSpecialties.length > 0 && (
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {allSpecialties.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setRoleFilter("all"); setStatusFilter("all"); setSpecialtyFilter("all"); }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No staff found" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name}
                    {user.id === currentUser?.id && (
                      <Badge variant="outline" className="ml-2 text-[10px]">You</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "—"}</TableCell>
                  <TableCell>
                    {user.specialties?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {user.specialties.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {user.is_active ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          <span className="text-xs text-success font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium">Inactive</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/staff/${user.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAttempt(user.id)}
                        disabled={user.id === currentUser?.id}
                        title={user.id === currentUser?.id ? "You cannot delete yourself" : "Remove staff member"}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId && !isSelfDelete}
        onOpenChange={() => setDeleteId(null)}
        title="Remove Staff"
        description={`Are you sure you want to remove ${deleteName}? They will lose access to the system.`}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        destructive
      />
    </div>
  );
}
