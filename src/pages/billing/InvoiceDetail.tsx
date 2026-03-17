import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvoice, updateInvoice, deleteInvoice } from "@/lib/api-services";
import { mockInvoices } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logAction } from "@/lib/audit-log";
import { useState } from "react";
import { CreditCard, Printer, Copy, MessageCircle, Trash2 } from "lucide-react";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState("UPI");
  const [showDelete, setShowDelete] = useState(false);

  const { data: inv } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id!),
    enabled: !!id,
    placeholderData: mockInvoices.find((i) => i.id === id),
  });

  const payMutation = useMutation({
    mutationFn: () => updateInvoice(id!, { status: "paid", payment_method: payMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast({ title: `Marked as paid via ${payMethod}` });
      setShowPay(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoice(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice deleted" });
      navigate("/billing");
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to delete invoice", variant: "destructive" });
    },
  });

  if (!inv) return <div className="p-6">Invoice not found.</div>;

  const shareViaWhatsApp = () => {
    const itemsText = inv.line_items.map((li) => `• ${li.description} × ${li.quantity} = ₹${li.total.toLocaleString()}`).join("\n");
    const message = `🧾 Invoice ${inv.invoice_number}\nPet: ${inv.pet?.name}\nOwner: ${inv.owner?.full_name}\n\n${itemsText}\n\nTotal: ₹${inv.total.toLocaleString()}\nDue: ${inv.due_date}\nStatus: ${inv.status}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    logAction({ actor_id: user?.id || "unknown", action_type: "whatsapp_share", entity_type: "invoice", entity_id: inv.id });
    toast({ title: "Opening WhatsApp..." });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={inv.invoice_number} backTo="/billing" />

      <div className="flex flex-wrap gap-2">
        {inv.status !== "paid" && (
          <Button size="sm" onClick={() => setShowPay(true)}>
            <CreditCard className="mr-2 h-3 w-3" /> Mark Paid
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => navigate(`/billing/new?clone_from=${inv.id}`)}>
          <Copy className="mr-2 h-3 w-3" /> Repeat Invoice
        </Button>
        <Button variant="outline" size="sm" onClick={shareViaWhatsApp}>
          <MessageCircle className="mr-2 h-3 w-3" /> Share via WhatsApp
        </Button>
        <Button variant="outline" size="sm" onClick={() => { window.print(); }} className="print:hidden">
          <Printer className="mr-2 h-3 w-3" /> Print / Save PDF
        </Button>
        {inv.status === "pending" && (
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Reminder sent (mock)" })}>
            Send Reminder
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
          <Trash2 className="mr-2 h-3 w-3" /> Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inv.line_items.map((li, i) => (
                  <TableRow key={i}>
                    <TableCell>{li.description}</TableCell>
                    <TableCell className="text-right">{li.quantity}</TableCell>
                    <TableCell className="text-right">₹{li.unit_price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{li.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 space-y-1 text-sm text-right">
              <p>Subtotal: ₹{inv.subtotal.toLocaleString()}</p>
              {inv.discount ? <p className="text-success">Discount: -₹{inv.discount.toLocaleString()}</p> : null}
              <p className="text-lg font-bold">Total: ₹{inv.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={inv.status} /></div>
            <div><span className="text-muted-foreground">Pet:</span> {inv.pet?.name}</div>
            <div><span className="text-muted-foreground">Owner:</span> {inv.owner?.full_name}</div>
            <div><span className="text-muted-foreground">Due Date:</span> {inv.due_date}</div>
            {inv.payment_method && <div><span className="text-muted-foreground">Payment:</span> {inv.payment_method}</div>}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPay} onOpenChange={setShowPay}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark as Paid</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <Select value={payMethod} onValueChange={setPayMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => payMutation.mutate()} disabled={payMutation.isPending}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${inv.invoice_number}? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        destructive
      />
    </div>
  );
}