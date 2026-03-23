import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useClients } from '../hooks/useClients';

export function ClientsPage({ practitionerId }: { practitionerId?: string }) {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [insurance, setInsurance] = useState('');
  const clients = useClients(practitionerId, search);

  const createClient = async () => {
    try {
      await clients.save.mutateAsync({ name, diagnosis_codes: diagnosis.split(',').map((d) => d.trim()), insurance_provider: insurance, status: 'active', intake_completed: false });
      toast.success('Client saved');
      setName(''); setDiagnosis(''); setInsurance('');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (clients.isLoading) return <p>Loading clients...</p>;
  if (clients.error) return <p className="text-red-600">Unable to load clients.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Clients</h2>
      <Card className="grid gap-2 md:grid-cols-4">
        <Input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Input placeholder="New client name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Diagnosis codes (comma)" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        <div className="flex gap-2">
          <Input placeholder="Insurance provider" value={insurance} onChange={(e) => setInsurance(e.target.value)} />
          <Button onClick={createClient} disabled={!name || clients.save.isPending}>Save</Button>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(clients.data ?? []).map((c) => (
          <Card key={c.id}>
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-slate-600">{c.email || 'No email'} • {c.phone || 'No phone'}</p>
            <p className="mt-2 text-sm">Diagnosis: {(c.diagnosis_codes || []).join(', ') || 'N/A'}</p>
            <p className="text-sm">Insurance: {c.insurance_provider || 'Self-pay'} ({c.insurance_id || 'N/A'})</p>
            <p className="text-sm">Intake: {c.intake_completed ? 'Complete' : 'Pending'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
