-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

-- 1) Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('mobile', 'desktop', 'services')),
  title text not null,
  title_ar text,
  description text not null,
  image_urls text[] not null default '{}',
  icon text,
  tags text[] not null default '{}',
  store_badge text,
  link_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Migration for a table created by an earlier version of this script (single image_url column)
alter table public.projects add column if not exists image_urls text[] not null default '{}';
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'projects' and column_name = 'image_url') then
    update public.projects set image_urls = array[image_url] where image_url is not null and (image_urls is null or image_urls = '{}');
    alter table public.projects drop column image_url;
  end if;
end $$;

alter table public.projects enable row level security;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select
  using (is_published = true);

drop policy if exists "Authenticated can manage projects" on public.projects;
create policy "Authenticated can manage projects"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- 2) Storage policies for the "portfolio" bucket (bucket itself must already exist and be Public)
drop policy if exists "Authenticated can upload to portfolio bucket" on storage.objects;
create policy "Authenticated can upload to portfolio bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio');

drop policy if exists "Authenticated can update portfolio objects" on storage.objects;
create policy "Authenticated can update portfolio objects"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio');

drop policy if exists "Authenticated can delete portfolio objects" on storage.objects;
create policy "Authenticated can delete portfolio objects"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio');

-- 3) Seed the three existing projects (safe to skip/edit before running)
insert into public.projects (category, title, title_ar, description, image_urls, icon, tags, store_badge, link_url, sort_order)
select * from (values
  ('mobile', 'Kada', 'سجل الشراكة',
   'تطبيق فلاتر بالكامل بالعربية لإدارة سجل شراكة تربية الأغنام، مبني بـ Flutter و PHP و Supabase.',
   '{}'::text[], null, array['Flutter','PHP','Supabase'], null, null, 1),
  ('mobile', 'Kelmni', 'كلّمني',
   'سوق عمل رقمي يربط العمّال والعملاء في أدرار، الجزائر. منشور على Google Play Store.',
   '{}'::text[], null, array['Flutter','Supabase'], 'Play Store ✅', null, 2),
  ('desktop', 'MyShop POS', null,
   'نظام نقطة بيع وإدارة مخزون لمحل بيع الأعلاف في الجزائر، مبني بـ WPF و .NET 10 مع نظام ترخيص KeyGen.',
   '{}'::text[], null, array['WPF','.NET 10','KeyGen'], null, null, 1),
  ('services', 'App Publishing', 'نشر التطبيقات / أفور',
   'أساعد المطورين على نشر تطبيقاتهم على Play Store و App Store.',
   '{}'::text[], '🚀', array['Play Store','App Store'], null, null, 1),
  ('services', 'EcomSahla', '@ecomsahla.1',
   'متجر منتجات رقمية عبر إنستغرام وفيسبوك، مع حملات إعلانية مدفوعة عبر Meta Ads.',
   '{}'::text[], '🛍️', array['Meta Ads','Instagram'], null, 'https://instagram.com/ecomsahla.1', 2)
) as seed(category, title, title_ar, description, image_urls, icon, tags, store_badge, link_url, sort_order)
where not exists (select 1 from public.projects p where p.title = seed.title);
