import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAppointments } from '../hooks/useAppointments';
import { useClients } from '../hooks/useClients';

export function AppointmentsPage({ practitionerId }: { practitionerId?: string }) {
  const [clientId, setClientId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState('Therapy Session');
  const appointments = useAppointments(practitionerId, new Date());
  const clients = useClients(practitionerId);

  const createAppointment = async () => {
    try {
      await appointments.save.mutateAsync({ client_id: clientId, start_time: new Date(startTime).toISOString(), end_time: new Date(endTime).toISOString(), type, status: 'scheduled', notes: 'Email/SMS reminders queued (placeholder).' });
      toast.success('Appointment created');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await appointments.save.mutateAsync({ id, status: status as any });
      toast.success('Status updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (appointments.isLoading || clients.isLoading) return <p>Loading appointments...</p>;
  if (appointments.error) return <p className="text-red-600">Failed to load appointments.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Appointments</h2>
      <Card className="grid gap-2 md:grid-cols-5">
        <select className="rounded border p-2 text-sm" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Select client</option>
          {(clients.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        <Input value={type} onChange={(e) => setType(e.target.value)} />
        <Button onClick={createAppointment} disabled={!clientId || !startTime || !endTime}>Create</Button>
      </Card>

      <Card>
        <h3 className="font-semibold">Week Calendar / List View</h3>
        <div className="mt-2 space-y-2">
          {(appointments.data ?? []).map((a) => (
            <div key={a.id} className="grid gap-2 rounded border p-2 md:grid-cols-[2fr_1fr_1fr]">
              <div>
                <p className="font-medium">{a.clients?.name || 'Client'} • {a.type}</p>
                <p className="text-xs text-slate-500">{format(new Date(a.start_time), 'EEE MMM d, h:mm a')} - {format(new Date(a.end_time), 'h:mm a')}</p>
                <p className="text-xs text-amber-700">Reminder state: email/SMS placeholder tracked in notes</p>
              </div>
              <span className="text-sm">{a.status}</span>
              <select className="rounded border p-1 text-sm" value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                <option>scheduled</option><option>completed</option><option>cancelled</option><option>no-show</option>
              </select>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
