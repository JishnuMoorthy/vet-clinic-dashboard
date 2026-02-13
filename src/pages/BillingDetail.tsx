import { useParams, useNavigate } from "react-router-dom";
import { mockInvoices } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function BillingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const invoice = mockInvoices.find((i) => i.id === id);

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/billing")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <p className="text-muted-foreground">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/billing")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Billing</Button>
        <div className="flex gap-2">
          {invoice.status !== "paid" && (
            <Button onClick={() => toast({ title: "Marked as paid (demo)" })} variant="default">
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{invoice.invoice_number}</CardTitle>
            <Badge variant="outline" className={statusColors[invoice.status]}>{invoice.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Pet</p><p className="font-medium text-sm">{invoice.pet?.name}</p></div>
            <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium text-sm">{invoice.owner?.full_name}</p></div>
            <div><p className="text-xs text-muted-foreground">Due Date</p><p className="font-medium text-sm">{invoice.due_date}</p></div>
            <div><p className="text-xs text-muted-foreground">Payment Method</p><p className="font-medium text-sm">{invoice.payment_method || "—"}</p></div>
          </div>

          <Separator />

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
              {invoice.line_items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{item.unit_price.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">₹{item.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{invoice.subtotal.toLocaleString()}</span></div>
              {invoice.discount && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-₹{invoice.discount.toLocaleString()}</span></div>}
              <Separator />
              <div className="flex justify-between font-bold"><span>Total</span><span>₹{invoice.total.toLocaleString()}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
