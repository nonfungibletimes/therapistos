import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { useClients } from '../hooks/useClients';
import { useAppointments } from '../hooks/useAppointments';
import { useMessages } from '../hooks/useMessages';

export function ClientPortalPage({ practitionerId }: { practitionerId?: string }) {
  const [selectedClient, setSelectedClient] = useState('');
  const [intake, setIntake] = useState('');
  const [message, setMessage] = useState('');
  const clients = useClients(practitionerId);
  const appointments = useAppointments(practitionerId);
  const messages = useMessages(practitionerId, selectedClient || undefined);

  const submitIntake = async () => {
    try {
      await clients.save.mutateAsync({ id: selectedClient, intake_completed: true, status: 'active', diagnosis_codes: intake.split(',').map((d) => d.trim()) });
      toast.success('Intake form submitted');
    } catch (e: any) { toast.error(e.message); }
  };

  const sendMessage = async () => {
    try {
      await messages.send.mutateAsync({ client_id: selectedClient, sender_role: 'client', content: message });
      toast.success('Message sent securely');
      setMessage('');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <h2 className="text-2xl font-semibold">Client Portal</h2>
      <Card>
        <select className="w-full rounded border p-2" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
          <option value="">Choose your profile</option>
          {(clients.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Card>

      <Card>
        <h3 className="font-semibold">Upcoming appointments</h3>
        {(appointments.data ?? []).filter((a) => a.client_id === selectedClient).map((a) => <p key={a.id} className="mt-2 text-sm">{new Date(a.start_time).toLocaleString()} • {a.type} • {a.status}</p>)}
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">Intake form</h3>
        <Textarea rows={3} value={intake} onChange={(e) => setIntake(e.target.value)} placeholder="List presenting issues/diagnosis keywords" />
        <Button onClick={submitIntake} disabled={!selectedClient}>Submit intake</Button>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">Secure messaging</h3>
        <Textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message your therapist" />
        <Button onClick={sendMessage} disabled={!selectedClient || !message}>Send</Button>
        <div className="space-y-1 text-sm">{(messages.data ?? []).map((m) => <p key={m.id}><b>{m.sender_role}:</b> {m.content}</p>)}</div>
      </Card>
    </div>
  );
}
