-- PREPARED ONLY: do not apply before testing and explicit publication approval.
-- Existing beneficiaries.context_badge and beneficiaries_public remain unchanged.
create table if not exists public.context_badges (
 id uuid primary key default gen_random_uuid(),
 label text not null unique check (length(trim(label)) between 2 and 100),
 description text,
 is_active boolean not null default true,
 sort_order integer not null default 0,
 created_at timestamptz not null default now()
);
create table if not exists public.beneficiary_context_badges (
 beneficiary_id uuid not null references public.beneficiaries(id) on delete cascade,
 badge_id uuid not null references public.context_badges(id) on delete restrict,
 assigned_at timestamptz not null default now(),
 assigned_by uuid references auth.users(id),
 primary key (beneficiary_id, badge_id)
);
create index if not exists beneficiary_context_badges_badge_idx on public.beneficiary_context_badges(badge_id);
create table if not exists public.context_badge_audit (
 id bigint generated always as identity primary key,
 actor_id uuid,
 action text not null,
 beneficiary_id uuid,
 badge_id uuid,
 detail jsonb not null default '{}'::jsonb,
 happened_at timestamptz not null default now()
);
alter table public.context_badges enable row level security;
alter table public.beneficiary_context_badges enable row level security;
alter table public.context_badge_audit enable row level security;
-- Catalogue visible aux visiteurs; associations visibles uniquement aux administrateurs
-- jusqu'à l'ajout d'un point de lecture public contrôlé.
create policy "active badge catalogue readable" on public.context_badges for select to anon, authenticated using (is_active or exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));
create policy "admin badge insert" on public.context_badges for insert to authenticated with check (exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));
create policy "admin badge update" on public.context_badges for update to authenticated using (exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin')) with check (exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));
create policy "admin assignments read" on public.beneficiary_context_badges for select to authenticated using (exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));
create policy "admin assignments insert" on public.beneficiary_context_badges for insert to authenticated with check (exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin') and assigned_by = (select auth.uid()));
create policy "admin assignments delete" on public.beneficiary_context_badges for delete to authenticated using (exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));
create policy "admin audit read" on public.context_badge_audit for select to authenticated using (exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));
create policy "admin audit insert" on public.context_badge_audit for insert to authenticated with check (actor_id = (select auth.uid()) and exists (select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin'));
-- Import legacy values; does not change existing published profiles or legacy columns.
insert into public.context_badges(label)
select distinct trim(context_badge) from public.beneficiaries
where nullif(trim(context_badge),'') is not null
on conflict(label) do nothing;
insert into public.beneficiary_context_badges(beneficiary_id,badge_id)
select b.id, c.id from public.beneficiaries b
join public.context_badges c on c.label=trim(b.context_badge)
where nullif(trim(b.context_badge),'') is not null
on conflict do nothing;
-- Public multi-badge display is deliberately NOT activated by this migration.
