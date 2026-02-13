import { useParams, useNavigate } from "react-router-dom";
import { mockInvoices } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CreditCard, Printer } from "lucide-react";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState("UPI");
  const inv = mockInvoices.find((i) => i.id === id);

  if (!inv) return <div className="p-6">Invoice not found.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={inv.invoice_number} backTo="/billing" />

      <div className="flex flex-wrap gap-2">
        {inv.status !== "paid" && (
          <Button size="sm" onClick={() => setShowPay(true)}>
            <CreditCard className="mr-2 h-3 w-3" /> Mark Paid
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => { window.print(); }}>
          <Printer className="mr-2 h-3 w-3" /> Print
        </Button>
        {inv.status === "pending" && (
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Reminder sent (mock)" })}>
            Send Reminder
          </Button>
        )}
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
            <Button onClick={() => { toast({ title: `Marked as paid via ${payMethod} (mock)` }); setShowPay(false); }}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
