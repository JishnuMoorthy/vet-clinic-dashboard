import { useParams, useNavigate } from "react-router-dom";
import { mockOwners, mockPets, mockAppointments, mockInvoices } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";

export default function OwnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const owner = mockOwners.find((o) => o.id === id);

  if (!owner) return <div className="p-6">Owner not found.</div>;

  const ownerPets = mockPets.filter((p) => p.owner_id === owner.id);
  const ownerAppointments = mockAppointments.filter((a) => ownerPets.some((p) => p.id === a.pet_id));
  const ownerInvoices = mockInvoices.filter((i) => i.owner_id === owner.id);

  return (
    <div className="space-y-6">
      <PageHeader title={owner.full_name} backTo="/owners" />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/owners/${owner.id}/edit`)}>
          <Edit className="mr-2 h-3 w-3" /> Edit
        </Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowDelete(true)}>
          <Trash2 className="mr-2 h-3 w-3" /> Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Phone:</span> {owner.phone}</div>
            <div><span className="text-muted-foreground">Email:</span> {owner.email || "—"}</div>
            <div><span className="text-muted-foreground">Address:</span> {owner.address || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pets ({ownerPets.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ownerPets.map((pet) => (
              <div key={pet.id} className="flex items-center justify-between rounded border p-2 text-sm cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/pets/${pet.id}`)}>
                <span className="font-medium">{pet.name}</span>
                <span className="text-muted-foreground">{pet.species} · {pet.breed}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Invoices</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ownerInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices.</p>
            ) : (
              ownerInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded border p-2 text-sm cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/billing/${inv.id}`)}>
                  <span className="font-medium">{inv.invoice_number}</span>
                  <StatusBadge status={inv.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Owner"
        description={`Are you sure you want to delete ${owner.full_name}?`}
        onConfirm={() => { toast({ title: `${owner.full_name} deleted (mock)` }); navigate("/owners"); }}
        destructive
      />
    </div>
  );
}
