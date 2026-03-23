import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { useAppointments } from '../hooks/useAppointments';
import { useBilling } from '../hooks/useBilling';
import { useNotes } from '../hooks/useNotes';

export function DashboardPage({ practitionerId }: { practitionerId?: string }) {
  const appointments = useAppointments(practitionerId);
  const notes = useNotes(practitionerId);
  const billing = useBilling(practitionerId);

  if (appointments.isLoading || notes.isLoading || billing.isLoading) return <p>Loading dashboard...</p>;
  if (appointments.error || notes.error || billing.error) return <p className="text-red-600">Failed to load dashboard data.</p>;

  const upcoming = (appointments.data ?? []).slice(0, 5);
  const unsigned = (notes.data ?? []).filter((n) => !n.signed).length;
  const outstanding = (billing.data ?? []).filter((i) => i.status !== 'paid').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Today at a glance</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Upcoming appointments</p><p className="text-3xl font-bold">{upcoming.length}</p></Card>
        <Card><p className="text-sm text-slate-500">Unsigned notes</p><p className="text-3xl font-bold">{unsigned}</p></Card>
        <Card><p className="text-sm text-slate-500">Outstanding invoices</p><p className="text-3xl font-bold">${outstanding.toFixed(2)}</p></Card>
      </div>

      <Card>
        <h3 className="font-semibold">Upcoming schedule</h3>
        <div className="mt-3 space-y-2">
          {upcoming.map((item) => (
            <div key={item.id} className="flex justify-between rounded border p-2 text-sm">
              <span>{item.clients?.name || 'Client'} • {item.type}</span>
              <span>{format(new Date(item.start_time), 'EEE h:mm a')}</span>
            </div>
          ))}
          {upcoming.length === 0 && <p className="text-sm text-slate-500">No upcoming appointments.</p>}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/app/appointments">Create appointment</Link>
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/app/notes">Generate note</Link>
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" to="/app/billing">Issue invoice</Link>
      </div>
    </div>
  );
}
