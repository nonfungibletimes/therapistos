import type { Client, Invoice } from '../types/db';

export const generateSuperbill = (invoice: Invoice, client: Client) => {
  const data = {
    invoiceId: invoice.id,
    client: client.name,
    amount: invoice.amount,
    insurance: client.insurance_provider,
    generatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `superbill-${client.name.replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
