export type NoteFormat = 'SOAP' | 'DAP';

export interface Practitioner {
  id: string;
  user_id: string;
  name: string;
  credentials: string | null;
  practice_name: string | null;
  phone: string | null;
  npi_number: string | null;
  hipaa_acknowledged: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  practitioner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  diagnosis_codes: string[];
  insurance_provider: string | null;
  insurance_id: string | null;
  status: 'active' | 'inactive' | 'lead';
  intake_completed: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  practitioner_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string | null;
  reminder_email_sent?: boolean;
  reminder_sms_sent?: boolean;
  created_at: string;
}

export interface SessionNote {
  id: string;
  appointment_id: string;
  practitioner_id: string;
  client_id: string;
  format: NoteFormat;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  raw_summary: string | null;
  ai_generated: boolean;
  signed: boolean;
  signed_at: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  practitioner_id: string;
  client_id: string;
  appointment_id: string | null;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  stripe_payment_id: string | null;
  superbill_data: Record<string, unknown> | null;
  created_at: string;
}

export interface Message {
  id: string;
  practitioner_id: string;
  client_id: string;
  sender_role: 'practitioner' | 'client';
  content: string;
  read: boolean;
  created_at: string;
}

export interface NoteTemplate {
  id: string;
  practitioner_id: string;
  name: string;
  modality: string;
  format: NoteFormat;
  template_content: string;
  created_at: string;
}
