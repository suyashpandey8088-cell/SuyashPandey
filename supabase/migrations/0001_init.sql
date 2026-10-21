-- =============================================================================
--  Suyash Pandey — NIAT Student Council Presidential Campaign
--  0001: schema, indexes, triggers, row level security, storage policies
-- =============================================================================
--  Design notes
--  ------------
--  * Public (anon) visitors may only read rows that are genuinely public:
--    published updates whose publish time has passed, visible manifesto /
--    vision / progress rows, published events and the single settings row.
--  * Feedback submissions and the administrator allow-list are never readable
--    by the anon or authenticated roles.
--  * Every write is authorised through public.is_admin(), a SECURITY DEFINER
--    helper that resolves the caller's auth.uid() against public.admin_users.
--    There is deliberately no INSERT/UPDATE policy on admin_users, so a user
--    cannot grant themselves administrator rights.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Enumerated domains
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.content_status as enum ('draft', 'scheduled', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.initiative_status as enum ('proposed', 'in_progress', 'awaiting_approval', 'completed', 'on_hold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.update_category as enum ('announcements', 'campaign_news', 'events', 'manifesto_updates', 'progress_reports');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_state as enum ('scheduled', 'cancelled', 'postponed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.feedback_state as enum ('new', 'read', 'replied', 'archived');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Shared helpers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Administrator allow-list
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text,
  created_at   timestamptz not null default now()
);

comment on table public.admin_users is
  'Explicit allow-list of campaign administrators. Only the service role may write here.';

alter table public.admin_users enable row level security;

-- An administrator may confirm their own authorisation; nobody else can read it.
drop policy if exists "admins read their own record" on public.admin_users;
create policy "admins read their own record"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- SECURITY DEFINER so policies can consult the allow-list without exposing it.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Manifesto items
-- ----------------------------------------------------------------------------
create table if not exists public.manifesto_items (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  category       text not null default 'Student Voice',
  issue          text not null default '',
  proposal       text not null default '',
  why_it_matters text not null default '',
  outcome        text not null default '',
  first_step     text not null default '',
  considerations text not null default '',
  status         public.initiative_status not null default 'proposed',
  display_order  integer not null default 0,
  is_visible     boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint manifesto_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists manifesto_items_order_idx on public.manifesto_items (display_order, created_at);
create index if not exists manifesto_items_visible_idx on public.manifesto_items (is_visible) where is_visible;

drop trigger if exists manifesto_items_touch on public.manifesto_items;
create trigger manifesto_items_touch before update on public.manifesto_items
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Vision pillars (editorial panels on the homepage)
-- ----------------------------------------------------------------------------
create table if not exists public.vision_pillars (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  kicker        text not null default '',
  summary       text not null default '',
  student_need  text not null default '',
  approach      text not null default '',
  benefit       text not null default '',
  status        public.initiative_status not null default 'proposed',
  display_order integer not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists vision_pillars_order_idx on public.vision_pillars (display_order);

drop trigger if exists vision_pillars_touch on public.vision_pillars;
create trigger vision_pillars_touch before update on public.vision_pillars
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Campaign updates (the live news feed)
-- ----------------------------------------------------------------------------
create table if not exists public.update_posts (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  title                 text not null,
  summary               text not null default '',
  body                  text not null default '',
  category              public.update_category not null default 'campaign_news',
  status                public.content_status not null default 'draft',
  published_at          timestamptz,
  scheduled_for         timestamptz,
  cover_image_url       text,
  cover_image_alt       text,
  gallery               jsonb not null default '[]'::jsonb,
  related_manifesto_id  uuid references public.manifesto_items (id) on delete set null,
  external_url          text,
  external_label        text,
  is_pinned             boolean not null default false,
  author_id             uuid references auth.users (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint update_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint update_scheduled_requires_time
    check (status <> 'scheduled' or scheduled_for is not null),
  constraint update_external_url_scheme
    check (external_url is null or external_url ~* '^https?://')
);

create index if not exists update_posts_public_idx
  on public.update_posts (published_at desc)
  where status = 'published';
create index if not exists update_posts_status_idx on public.update_posts (status, scheduled_for);
create index if not exists update_posts_category_idx on public.update_posts (category);

drop trigger if exists update_posts_touch on public.update_posts;
create trigger update_posts_touch before update on public.update_posts
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Events
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  description       text not null default '',
  starts_at         timestamptz not null,
  ends_at           timestamptz,
  venue             text not null default '',
  cover_image_url   text,
  cover_image_alt   text,
  registration_url  text,
  additional_info   text,
  recap             text,
  gallery           jsonb not null default '[]'::jsonb,
  state             public.event_state not null default 'scheduled',
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint event_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint event_registration_url_scheme
    check (registration_url is null or registration_url ~* '^https?://')
);

create index if not exists events_starts_idx on public.events (starts_at);
create index if not exists events_published_idx on public.events (is_published) where is_published;

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Progress tracker
-- ----------------------------------------------------------------------------
create table if not exists public.progress_items (
  id                 uuid primary key default gen_random_uuid(),
  initiative_name    text not null,
  original_proposal  text not null default '',
  status             public.initiative_status not null default 'proposed',
  progress_note      text not null default '',
  percent            integer,
  related_update_id  uuid references public.update_posts (id) on delete set null,
  display_order      integer not null default 0,
  is_visible         boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint progress_percent_range check (percent is null or (percent >= 0 and percent <= 100))
);

create index if not exists progress_items_order_idx on public.progress_items (display_order);

drop trigger if exists progress_items_touch on public.progress_items;
create trigger progress_items_touch before update on public.progress_items
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Feedback from students (private)
-- ----------------------------------------------------------------------------
create table if not exists public.feedback_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text,
  phone       text,
  category    text not null default 'idea',
  message     text not null,
  consent     boolean not null default false,
  state       public.feedback_state not null default 'new',
  admin_notes text,
  ip_hash     text,
  user_agent  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint feedback_message_length check (char_length(message) between 2 and 5000)
);

create index if not exists feedback_created_idx on public.feedback_submissions (created_at desc);
create index if not exists feedback_state_idx on public.feedback_submissions (state);
-- Supports the durable spam guard: count recent submissions per client hash.
create index if not exists feedback_ip_hash_idx on public.feedback_submissions (ip_hash, created_at desc);

drop trigger if exists feedback_submissions_touch on public.feedback_submissions;
create trigger feedback_submissions_touch before update on public.feedback_submissions
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Audit log (append-only, administrator readable)
-- ----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid references auth.users (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- ----------------------------------------------------------------------------
-- Website settings (single row)
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                  integer primary key default 1 check (id = 1),
  candidate_name      text not null default 'Suyash Pandey',
  campaign_slogan     text not null default 'Your Voice. Our Campus. Our Future.',
  institution         text not null default 'NIAT',
  position_label      text not null default 'Candidate for Student Council President',
  hero_eyebrow        text not null default 'NIAT · Student Council Election',
  hero_headline       text not null default 'Your Voice. Our Campus. Our Future.',
  hero_supporting     text not null default '',
  portrait_url        text,
  portrait_alt        text not null default '',
  monogram            text not null default 'SP',
  logo_url            text,
  logo_alt            text not null default '',
  statement_heading   text not null default 'Leadership Starts With Listening.',
  statement_body      text not null default '',
  about_heading       text not null default 'A Student First, A Listener Always.',
  about_body          text not null default '',
  about_philosophy    text not null default '',
  about_involvement   text not null default '',
  about_motivation    text not null default '',
  closing_heading     text not null default 'Let''s Make Our Voices Count.',
  closing_body        text not null default '',
  election_date       date,
  social_links        jsonb not null default '[]'::jsonb,
  contact_email       text,
  contact_note        text,
  featured_update_id  uuid,
  sections            jsonb not null default '{}'::jsonb,
  accent_color        text not null default '#76639A',
  accent_deep         text not null default '#443451',
  timezone            text not null default 'Asia/Kolkata',
  site_title          text not null default 'Suyash Pandey — Candidate for Student Council President, NIAT',
  site_description    text not null default 'A campaign built around listening, meaningful participation, transparent progress, and ideas that bring students together.',
  og_image_url        text,
  updated_at          timestamptz not null default now()
);

alter table public.site_settings
  add constraint site_settings_featured_update_fk
  foreign key (featured_update_id) references public.update_posts (id) on delete set null;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
for each row execute function public.set_updated_at();

-- ============================================================================
--  Row Level Security
-- ============================================================================
alter table public.manifesto_items     enable row level security;
alter table public.vision_pillars      enable row level security;
alter table public.update_posts        enable row level security;
alter table public.events              enable row level security;
alter table public.progress_items      enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.audit_log           enable row level security;
alter table public.site_settings       enable row level security;

-- ---- Public read surfaces -------------------------------------------------
drop policy if exists "public reads visible manifesto" on public.manifesto_items;
create policy "public reads visible manifesto"
  on public.manifesto_items for select to anon, authenticated
  using (is_visible = true);

drop policy if exists "public reads visible pillars" on public.vision_pillars;
create policy "public reads visible pillars"
  on public.vision_pillars for select to anon, authenticated
  using (is_visible = true);

drop policy if exists "public reads published updates" on public.update_posts;
create policy "public reads published updates"
  on public.update_posts for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists "public reads published events" on public.events;
create policy "public reads published events"
  on public.events for select to anon, authenticated
  using (is_published = true);

drop policy if exists "public reads visible progress" on public.progress_items;
create policy "public reads visible progress"
  on public.progress_items for select to anon, authenticated
  using (is_visible = true);

drop policy if exists "public reads settings" on public.site_settings;
create policy "public reads settings"
  on public.site_settings for select to anon, authenticated
  using (true);

-- Feedback is write-only for visitors, and writes actually go through the
-- server route which validates + rate-limits. No public read policy exists,
-- so submissions can never be listed by a browser client.
drop policy if exists "visitors may submit feedback" on public.feedback_submissions;
create policy "visitors may submit feedback"
  on public.feedback_submissions for insert to anon, authenticated
  with check (state = 'new');

-- ---- Administrator write surfaces -----------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'manifesto_items', 'vision_pillars', 'update_posts',
    'events', 'progress_items', 'site_settings', 'feedback_submissions', 'audit_log'
  ]
  loop
    execute format('drop policy if exists "admins manage %1$s" on public.%1$s', t);
    execute format(
      'create policy "admins manage %1$s" on public.%1$s for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
  end loop;
end $$;

-- ============================================================================
--  Storage: campaign media bucket
--  Public read (images are shown on the public site), admin-only writes.
--  MIME allow-list + size limit are enforced by the bucket itself.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-media',
  'campaign-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 8388608,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

drop policy if exists "campaign media public read" on storage.objects;
create policy "campaign media public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'campaign-media');

drop policy if exists "campaign media admin write" on storage.objects;
create policy "campaign media admin write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'campaign-media' and public.is_admin());

drop policy if exists "campaign media admin update" on storage.objects;
create policy "campaign media admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'campaign-media' and public.is_admin())
  with check (bucket_id = 'campaign-media' and public.is_admin());

drop policy if exists "campaign media admin delete" on storage.objects;
create policy "campaign media admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'campaign-media' and public.is_admin());

-- ============================================================================
--  Scheduled publishing
--  A SECURITY DEFINER routine so the scheduled endpoint can promote due posts
--  without a service-role key in the request path. Idempotent by construction:
--  it only ever touches rows whose status is still 'scheduled' and whose
--  scheduled_for time has passed, so repeated or concurrent runs are safe.
-- ============================================================================
create or replace function public.publish_scheduled_updates()
returns setof public.update_posts
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.update_posts u
     set status = 'published',
         published_at = coalesce(u.published_at, u.scheduled_for, now()),
         scheduled_for = null
   where u.status = 'scheduled'
     and u.scheduled_for is not null
     and u.scheduled_for <= now()
  returning u.*;
end;
$$;

revoke all on function public.publish_scheduled_updates() from public, anon, authenticated;
grant execute on function public.publish_scheduled_updates() to service_role;
