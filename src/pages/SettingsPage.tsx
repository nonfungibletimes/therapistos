import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { usePractice } from '../hooks/usePractice';

export function SettingsPage({ practitionerId, userId }: { practitionerId?: string; userId?: string }) {
  const practice = usePractice(practitionerId, userId);
  const [templateName, setTemplateName] = useState('');
  const [modality, setModality] = useState('CBT');
  const [templateContent, setTemplateContent] = useState('Identify thought distortions and assign between-session worksheet.');
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);

  if (practice.practitioner.isLoading || practice.templates.isLoading) return <p>Loading settings...</p>;
  if (practice.practitioner.error) return <p className="text-red-600">Unable to load settings.</p>;

  const p = practice.practitioner.data;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <Card className="space-y-2">
        <h3 className="font-semibold">Practice Info + HIPAA acknowledgment</h3>
        <Input defaultValue={p?.practice_name || ''} onBlur={(e) => practice.updatePractice.mutate({ practice_name: e.target.value })} placeholder="Practice name" />
        <Input defaultValue={p?.phone || ''} onBlur={(e) => practice.updatePractice.mutate({ phone: e.target.value })} placeholder="Phone" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!p?.hipaa_acknowledged} onChange={(e) => practice.updatePractice.mutate({ hipaa_acknowledged: e.target.checked })} />
          I acknowledge HIPAA responsibilities and minimum necessary disclosure standards.
        </label>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">Notification preferences + Stripe</h3>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={emailReminders} onChange={(e) => setEmailReminders(e.target.checked)} />Email reminders</label>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={smsReminders} onChange={(e) => setSmsReminders(e.target.checked)} />SMS reminders</label>
        <Button onClick={() => toast.success('Stripe account connection placeholder configured')}>Connect Stripe</Button>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">Manage note templates</h3>
        <div className="grid gap-2 md:grid-cols-4">
          <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name" />
          <Input value={modality} onChange={(e) => setModality(e.target.value)} placeholder="Modality" />
          <Input value={templateContent} onChange={(e) => setTemplateContent(e.target.value)} placeholder="Template content" className="md:col-span-2" />
        </div>
        <Button onClick={() => practice.saveTemplate.mutate({ name: templateName, modality, format: 'SOAP', template_content: templateContent }, { onSuccess: () => toast.success('Template saved') })}>Save Template</Button>
        <div className="space-y-1 text-sm">{(practice.templates.data ?? []).map((t) => <p key={t.id}>{t.name} — {t.modality} — {t.format}</p>)}</div>
      </Card>
    </div>
  );
}
