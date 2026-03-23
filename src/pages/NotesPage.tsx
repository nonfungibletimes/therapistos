import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useNotes } from '../hooks/useNotes';
import { useClients } from '../hooks/useClients';
import { usePractice } from '../hooks/usePractice';

export function NotesPage({ practitionerId, userId }: { practitionerId?: string; userId?: string }) {
  const [clientId, setClientId] = useState('');
  const [format, setFormat] = useState<'SOAP' | 'DAP'>('SOAP');
  const [summary, setSummary] = useState('');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const notes = useNotes(practitionerId);
  const clients = useClients(practitionerId);
  const practice = usePractice(practitionerId, userId);

  const generate = async () => {
    const generated = await notes.aiGenerate(summary, format);
    setSubjective(generated.subjective); setObjective(generated.objective); setAssessment(generated.assessment); setPlan(generated.plan);
    toast.success('AI note generated');
  };

  const save = async () => {
    try {
      await notes.save.mutateAsync({ client_id: clientId, format, raw_summary: summary, subjective, objective, assessment, plan, ai_generated: true, signed: false, appointment_id: null as any });
      toast.success('Note saved');
    } catch (e: any) { toast.error(e.message); }
  };

  if (notes.isLoading || clients.isLoading || practice.templates.isLoading) return <p>Loading notes...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Session Notes</h2>
      <Card className="space-y-2">
        <div className="grid gap-2 md:grid-cols-3">
          <select className="rounded border p-2" value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Select client</option>{(clients.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select className="rounded border p-2" value={format} onChange={(e) => setFormat(e.target.value as any)}><option>SOAP</option><option>DAP</option></select>
          <select className="rounded border p-2" onChange={(e) => {
            const t = (practice.templates.data ?? []).find((x) => x.id === e.target.value);
            if (t) setPlan(t.template_content);
          }}><option value="">Apply template</option>{(practice.templates.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        </div>
        <Textarea rows={3} placeholder="Brief session summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        <Button onClick={generate} disabled={!summary}>Generate SOAP/DAP with AI</Button>
        <Textarea rows={2} placeholder="Subjective" value={subjective} onChange={(e) => setSubjective(e.target.value)} />
        <Textarea rows={2} placeholder="Objective" value={objective} onChange={(e) => setObjective(e.target.value)} />
        <Textarea rows={2} placeholder="Assessment" value={assessment} onChange={(e) => setAssessment(e.target.value)} />
        <Textarea rows={2} placeholder="Plan" value={plan} onChange={(e) => setPlan(e.target.value)} />
        <Button onClick={save} disabled={!clientId || !subjective}>Save note</Button>
      </Card>

      <Card>
        <h3 className="font-semibold">Recent notes</h3>
        {(notes.data ?? []).map((n) => (
          <div key={n.id} className="mt-2 flex items-start justify-between rounded border p-2 text-sm">
            <div><p>{n.clients?.name || 'Client'} • {n.format}</p><p className="text-slate-500">{n.assessment}</p></div>
            <Button className="h-8" disabled={n.signed || notes.sign.isPending} onClick={() => notes.sign.mutate(n.id)}>{n.signed ? 'Signed' : 'Sign & Lock'}</Button>
          </div>
        ))}
      </Card>
    </div>
  );
}
