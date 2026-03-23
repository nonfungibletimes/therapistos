-- TherapistOS initial schema
create extension if not exists "pgcrypto";

create table if not exists public.practitioners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  name text not null default 'New Practitioner',
  credentials text,
  practice_name text,
  phone text,
  npi_number text,
  hipaa_acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  date_of_birth date,
  diagnosis_codes text[] not null default '{}',
  insurance_provider text,
  insurance_id text,
  status text not null default 'active' check (status in ('active','inactive','lead')),
  intake_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  type text not null,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','no-show')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  format text not null check (format in ('SOAP','DAP')),
  subjective text not null,
  objective text not null,
  assessment text not null,
  plan text not null,
  raw_summary text,
  ai_generated boolean not null default false,
  signed boolean not null default false,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  amount numeric(10,2) not null,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue')),
  stripe_payment_id text,
  superbill_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  sender_role text not null check (sender_role in ('practitioner','client')),
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.note_templates (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  name text not null,
  modality text not null,
  format text not null check (format in ('SOAP','DAP')),
  template_content text not null,
  created_at timestamptz not null default now()
);

alter table public.practitioners enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.session_notes enable row level security;
alter table public.invoices enable row level security;
alter table public.messages enable row level security;
alter table public.note_templates enable row level security;

create or replace function public.current_practitioner_id() returns uuid
language sql stable as $$
  select id from public.practitioners where user_id = auth.uid() limit 1
$$;

create policy "practitioner self access" on public.practitioners for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "clients scoped" on public.clients for all
using (practitioner_id = public.current_practitioner_id())
with check (practitioner_id = public.current_practitioner_id());

create policy "appointments scoped" on public.appointments for all
using (practitioner_id = public.current_practitioner_id())
with check (practitioner_id = public.current_practitioner_id());

create policy "notes scoped" on public.session_notes for all
using (practitioner_id = public.current_practitioner_id())
with check (practitioner_id = public.current_practitioner_id());

create policy "invoices scoped" on public.invoices for all
using (practitioner_id = public.current_practitioner_id())
with check (practitioner_id = public.current_practitioner_id());

create policy "messages scoped" on public.messages for all
using (practitioner_id = public.current_practitioner_id())
with check (practitioner_id = public.current_practitioner_id());

create policy "templates scoped" on public.note_templates for all
using (practitioner_id = public.current_practitioner_id())
with check (practitioner_id = public.current_practitioner_id());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as $$
declare p_id uuid;
begin
  insert into public.practitioners (user_id, name, practice_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'My Practice')
  returning id into p_id;

  insert into public.note_templates (practitioner_id, name, modality, format, template_content)
  values
    (p_id, 'CBT Core', 'CBT', 'SOAP', 'Identify distortions, review evidence, set behavioral activation homework.'),
    (p_id, 'DBT Distress Tolerance', 'DBT', 'SOAP', 'Validate emotion, skill practice plan, urge surfing worksheet.'),
    (p_id, 'EMDR Processing', 'EMDR', 'DAP', 'Target memory reprocessing notes, SUD/VoC tracking, containment plan.'),
    (p_id, 'Psychodynamic Reflection', 'Psychodynamic', 'DAP', 'Track relational themes, defenses, and transference patterns.'),
    (p_id, 'Solution-Focused Brief', 'Solution-Focused', 'SOAP', 'Miracle question updates, scaling, next small step.'),
    (p_id, 'Motivational Interviewing', 'Motivational Interviewing', 'DAP', 'Explore ambivalence, elicit change talk, commitment language.');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
