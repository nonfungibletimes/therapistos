import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

const pricing = [
  { name: 'Solo', price: '$39/mo', cap: 'Up to 30 clients' },
  { name: 'Full Practice', price: '$69/mo', cap: 'Unlimited clients' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <Badge className="bg-blue-100 text-blue-700">HIPAA Friendly • Encryption in transit and at rest</Badge>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">Run your solo practice without the admin chaos</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">TherapistOS centralizes notes, billing, scheduling, reminders, and secure messaging so you can focus on care.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/app/dashboard" className="rounded bg-slate-900 px-4 py-2 text-white">Open App</Link>
          <Link to="/portal" className="rounded border px-4 py-2">Client Portal</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-12 md:grid-cols-3">
        {['AI SOAP/DAP notes', 'Integrated Stripe billing', 'Client intake + messaging'].map((feature) => (
          <Card key={feature}><h3 className="font-semibold">{feature}</h3><p className="mt-2 text-sm text-slate-600">Built to support compliant, fast workflows for solo practitioners.</p></Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="mb-4 text-2xl font-semibold">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {pricing.map((plan) => (
            <Card key={plan.name} className="p-6">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-600">{plan.cap}</p>
              <p className="mt-4 text-xs text-slate-500">Includes secure portal, AI notes, reminders state tracking, and insurance superbill exports.</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
