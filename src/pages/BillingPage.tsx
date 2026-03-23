import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useBilling } from '../hooks/useBilling';
import { useClients } from '../hooks/useClients';
import { generateSuperbill } from '../lib/superbill';

export function BillingPage({ practitionerId }: { practitionerId?: string }) {
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('150');
  const billing = useBilling(practitionerId);
  const clients = useClients(practitionerId);

  const createInvoice = async () => {
    try {
      await billing.save.mutateAsync({ client_id: clientId, amount: Number(amount), status: 'sent', stripe_payment_id: null });
      toast.success('Invoice created (Stripe checkout placeholder linked)');
    } catch (e: any) { toast.error(e.message); }
  };

  if (billing.isLoading || clients.isLoading) return <p>Loading billing...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Billing</h2>
      <Card className="grid gap-2 md:grid-cols-3">
        <select className="rounded border p-2" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Select client</option>
          {(clients.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button onClick={createInvoice} disabled={!clientId}>Create invoice from session</Button>
      </Card>

      <Card>
        <h3 className="font-semibold">Invoices</h3>
        {(billing.data ?? []).map((inv) => {
          const client = (clients.data ?? []).find((c) => c.id === inv.client_id);
          return (
            <div key={inv.id} className="mt-2 grid gap-2 rounded border p-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
              <p>{client?.name || 'Client'} • ${inv.amount.toFixed(2)}</p>
              <p>{inv.status}</p>
              <Button className="h-8" disabled={inv.status === 'paid'} onClick={() => billing.markPaid.mutate(inv.id)}>Mark paid (Stripe)</Button>
              <Button className="h-8" onClick={() => client && generateSuperbill(inv, client)}>Generate superbill</Button>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
