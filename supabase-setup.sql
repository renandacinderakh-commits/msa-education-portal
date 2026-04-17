-- ============================================================
-- MSA Education Learning Portal — Database Setup
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('admin', 'teacher', 'parent')) default 'parent',
  full_name text not null,
  email text,
  whatsapp text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can insert profiles" on public.profiles
  for insert with check (true);

create policy "Admins can update any profile" on public.profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 2. STUDENTS TABLE
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  nickname text,
  date_of_birth date,
  grade_level text not null check (grade_level in ('Toddler', 'TK-A', 'TK-B', 'SD-1', 'SD-2', 'SD-3', 'SD-4', 'SD-5', 'SD-6')),
  photo_url text,
  teacher_id uuid references public.profiles(id),
  parent_id uuid references public.profiles(id),
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.students enable row level security;

create policy "Teachers see their students" on public.students
  for select using (
    teacher_id = auth.uid()
    or parent_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins and teachers can insert students" on public.students
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
  );

create policy "Admins and teachers can update students" on public.students
  for update using (
    teacher_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 3. DAILY ENTRIES TABLE
create table if not exists public.daily_entries (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) not null,
  teacher_id uuid references public.profiles(id) not null,
  entry_date date not null,
  meeting_number int not null default 1,
  session_title text,
  activities_description text not null,
  activities_description_en text,
  scores jsonb default '{}',
  teacher_notes text,
  teacher_notes_en text,
  suggestions text,
  suggestions_en text,
  topics_taught text,
  topics_taught_en text,
  next_topics text,
  next_topics_en text,
  mood text check (mood in ('happy', 'neutral', 'needs_support')) default 'happy',
  overall_stars int check (overall_stars between 0 and 5) default 0,
  photo_urls text[] default '{}',
  created_at timestamptz default now()
);

alter table public.daily_entries enable row level security;

create policy "Teachers see their entries" on public.daily_entries
  for select using (
    teacher_id = auth.uid()
    or exists (select 1 from public.students where id = student_id and parent_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Teachers can insert entries" on public.daily_entries
  for insert with check (teacher_id = auth.uid());

create policy "Teachers can update own entries" on public.daily_entries
  for update using (teacher_id = auth.uid());

-- 4. WEEKLY REPORTS TABLE
create table if not exists public.weekly_reports (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) not null,
  teacher_id uuid references public.profiles(id) not null,
  week_number int not null,
  year int not null,
  week_start date,
  week_end date,
  consolidated_scores jsonb default '{}',
  summary text,
  summary_en text,
  highlights text,
  highlights_en text,
  areas_to_improve text,
  areas_to_improve_en text,
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table public.weekly_reports enable row level security;

create policy "View weekly reports" on public.weekly_reports
  for select using (
    teacher_id = auth.uid()
    or exists (select 1 from public.students where id = student_id and parent_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Teachers can insert weekly reports" on public.weekly_reports
  for insert with check (teacher_id = auth.uid());

create policy "Teachers can update weekly reports" on public.weekly_reports
  for update using (teacher_id = auth.uid());

-- 5. MONTHLY REPORTS TABLE
create table if not exists public.monthly_reports (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) not null,
  teacher_id uuid references public.profiles(id) not null,
  month int not null check (month between 1 and 12),
  year int not null,
  period_label text not null,
  consolidated_scores jsonb default '{}',
  summary text,
  summary_en text,
  recommendations text,
  recommendations_en text,
  achievements text,
  achievements_en text,
  goals_next_month text,
  goals_next_month_en text,
  total_meetings int default 0,
  attendance_rate numeric default 100,
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table public.monthly_reports enable row level security;

create policy "View monthly reports" on public.monthly_reports
  for select using (
    teacher_id = auth.uid()
    or exists (select 1 from public.students where id = student_id and parent_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Teachers can insert monthly reports" on public.monthly_reports
  for insert with check (teacher_id = auth.uid());

create policy "Teachers can update monthly reports" on public.monthly_reports
  for update using (teacher_id = auth.uid());

-- 6. PROFILE TRIGGER (auto-create profile on signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'parent'),
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. STORAGE BUCKET
insert into storage.buckets (id, name, public) 
values ('learning-photos', 'learning-photos', true)
on conflict do nothing;

create policy "Anyone can view learning photos" on storage.objects
  for select using (bucket_id = 'learning-photos');

create policy "Authenticated users can upload learning photos" on storage.objects
  for insert with check (bucket_id = 'learning-photos' and auth.role() = 'authenticated');

create policy "Users can delete their uploads" on storage.objects
  for delete using (bucket_id = 'learning-photos' and auth.role() = 'authenticated');
