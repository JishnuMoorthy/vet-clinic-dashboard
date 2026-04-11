import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getInvoice } from "@/lib/api-services";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

/**
 * InvoicePrint — dedicated, chrome-free A4 invoice view.
 * Rendered outside AppLayout so nothing extra shows up on print.
 * The user clicks "Print / Save PDF" and uses the browser's native
 * print dialog to save as PDF.
 */
export default function InvoicePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: inv, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id!),
    enabled: !!id,
  });

  // Set the document title so "Save as PDF" defaults to a sensible filename.
  useEffect(() => {
    if (inv?.invoice_number) {
      const prev = document.title;
      document.title = `Invoice ${inv.invoice_number}`;
      return () => {
        document.title = prev;
      };
    }
  }, [inv?.invoice_number]);

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading invoice…</div>;
  if (!inv) return <div className="p-10 text-center">Invoice not found.</div>;

  const issueDate = inv.created_at ? format(new Date(inv.created_at), "dd MMM yyyy") : "—";
  const dueDate = inv.due_date ? format(new Date(inv.due_date), "dd MMM yyyy") : "—";

  // Clinic info — pulled from the logged-in user's clinic record if present
  // on the auth user object, otherwise falls back to the clinic name only.
  const clinic = (user as any)?.clinic || {};
  const clinicName = clinic.name || "Mia Veterinary Clinic";
  const clinicAddress = clinic.address || "";
  const clinicPhone = clinic.phone || "";
  const clinicEmail = clinic.email || "";

  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-white print:py-0">
      {/* Action bar — hidden on print */}
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/billing/${inv.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to invoice
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Invoice sheet — A4 sized, serif, white background */}
      <article className="invoice-sheet mx-auto max-w-[210mm] bg-white p-12 text-[#222] shadow-lg print:shadow-none print:p-0">
        {/* Header */}
        <header className="flex items-start justify-between border-b-2 border-[#3F422E] pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#3F422E]">{clinicName}</h1>
            {clinicAddress && <p className="mt-1 text-sm text-[#555]">{clinicAddress}</p>}
            <div className="mt-1 text-sm text-[#555]">
              {clinicPhone && <span>{clinicPhone}</span>}
              {clinicPhone && clinicEmail && <span> · </span>}
              {clinicEmail && <span>{clinicEmail}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-[#888]">Invoice</div>
            <div className="mt-1 text-2xl font-semibold text-[#3F422E]">{inv.invoice_number}</div>
            <div className="mt-2 text-xs">
              <div><span className="text-[#888]">Issued:</span> {issueDate}</div>
              <div><span className="text-[#888]">Due:</span> {dueDate}</div>
              <div className="mt-1 inline-block rounded-sm border border-[#D78B30] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#D78B30]">
                {inv.status}
              </div>
            </div>
          </div>
        </header>

        {/* Bill to */}
        <section className="mt-6 grid grid-cols-2 gap-8 text-sm">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#888]">Bill to</div>
            <div className="mt-1 font-semibold">{inv.owner?.full_name || "—"}</div>
            {inv.owner?.phone && <div className="text-[#555]">{inv.owner.phone}</div>}
            {inv.owner?.email && <div className="text-[#555]">{inv.owner.email}</div>}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[#888]">Patient</div>
            <div className="mt-1 font-semibold">{inv.pet?.name || "—"}</div>
            <div className="text-[#555]">
              {[inv.pet?.species, inv.pet?.breed].filter(Boolean).join(" · ") || ""}
            </div>
          </div>
        </section>

        {/* Line items */}
        <section className="mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#7A6B58] text-left text-xs uppercase tracking-widest text-[#888]">
                <th className="pb-2 font-normal">Treatment / Service</th>
                <th className="pb-2 text-right font-normal">Qty</th>
                <th className="pb-2 text-right font-normal">Unit Price</th>
                <th className="pb-2 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.line_items.map((li, i) => (
                <tr key={i} className="border-b border-[#eee]">
                  <td className="py-3">{li.description}</td>
                  <td className="py-3 text-right">{li.quantity}</td>
                  <td className="py-3 text-right">₹{li.unit_price.toLocaleString()}</td>
                  <td className="py-3 text-right">₹{li.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-6 flex justify-end">
          <div className="w-72 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-[#555]">Subtotal</span>
              <span>₹{inv.subtotal.toLocaleString()}</span>
            </div>
            {inv.discount ? (
              <div className="flex justify-between py-1">
                <span className="text-[#555]">Discount</span>
                <span>- ₹{inv.discount.toLocaleString()}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between border-t-2 border-[#3F422E] py-2 text-base font-bold text-[#3F422E]">
              <span>Total</span>
              <span>₹{inv.total.toLocaleString()}</span>
            </div>
            {inv.payment_method && (
              <div className="mt-2 text-right text-xs text-[#888]">
                Paid via {inv.payment_method}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-[#eee] pt-6 text-xs text-[#888]">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-8 border-b border-[#ccc] pb-1" style={{ minWidth: 200 }}>&nbsp;</div>
              <div>Authorized signature</div>
            </div>
            <div className="text-right italic">
              Thank you for trusting {clinicName} with your pet&rsquo;s care.
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
