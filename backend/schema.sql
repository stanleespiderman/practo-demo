-- Proposed Supabase schema; NOT applied or connected to the demo.
-- Apply once to a fresh project. Seed assignments through a trusted server/admin.
create table public.demo_conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id),
  doctor_id uuid not null references auth.users(id),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  check (patient_id <> doctor_id)
);
create table public.demo_messages (
  id uuid primary key,
  conversation_id uuid not null references public.demo_conversations(id),
  sender_id uuid not null references auth.users(id),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index demo_messages_conversation_order on public.demo_messages(conversation_id, created_at, id);
create table public.demo_read_cursors (
  conversation_id uuid not null references public.demo_conversations(id),
  user_id uuid not null references auth.users(id),
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
alter table public.demo_conversations enable row level security;
alter table public.demo_messages enable row level security;
alter table public.demo_read_cursors enable row level security;
revoke all on public.demo_conversations, public.demo_messages, public.demo_read_cursors from anon;
revoke all on public.demo_conversations, public.demo_messages, public.demo_read_cursors from authenticated;
grant select on public.demo_conversations to authenticated;
grant select, insert on public.demo_messages to authenticated;
grant select, insert, update on public.demo_read_cursors to authenticated;
create policy participants_read on public.demo_conversations for select to authenticated
using ((select auth.uid()) in (patient_id, doctor_id));
create policy participants_read_messages on public.demo_messages for select to authenticated
using (exists (select 1 from public.demo_conversations c where c.id = conversation_id and (select auth.uid()) in (c.patient_id, c.doctor_id)));
create policy participants_send on public.demo_messages for insert to authenticated
with check (sender_id = (select auth.uid()) and exists (select 1 from public.demo_conversations c where c.id = conversation_id and c.status = 'active' and (select auth.uid()) in (c.patient_id, c.doctor_id)));
create policy own_read_cursor_select on public.demo_read_cursors for select to authenticated
using (user_id = (select auth.uid()) and exists (select 1 from public.demo_conversations c where c.id = conversation_id and (select auth.uid()) in (c.patient_id, c.doctor_id)));
create policy own_read_cursor_insert on public.demo_read_cursors for insert to authenticated
with check (user_id = (select auth.uid()) and exists (select 1 from public.demo_conversations c where c.id = conversation_id and (select auth.uid()) in (c.patient_id, c.doctor_id)));
create policy own_read_cursor_update on public.demo_read_cursors for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()) and exists (select 1 from public.demo_conversations c where c.id = conversation_id and (select auth.uid()) in (c.patient_id, c.doctor_id)));
-- Set the authoritative message timestamp on the server.
create function public.demo_stamp_message() returns trigger language plpgsql set search_path = public as $$
begin new.created_at = now(); return new; end;
$$;
create trigger demo_message_timestamp before insert on public.demo_messages for each row execute function public.demo_stamp_message();
alter publication supabase_realtime add table public.demo_messages;
