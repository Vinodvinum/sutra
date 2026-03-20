CREATE TABLE IF NOT EXISTS profiles (
  id uuid primary key,
  name text not null,
  avatar_emoji text default '??',
  created_at timestamptz default now(),
  onboarding_complete boolean default false,
  baseline_complete boolean default false,
  day_count integer default 0,
  goals text[] default '{}',
  selected_pillars text[] default '{}'
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  discipline_score integer check(discipline_score between 0 and 100),
  health_score integer check(health_score between 0 and 100),
  finance_score integer check(finance_score between 0 and 100),
  growth_score integer check(growth_score between 0 and 100),
  life_score integer check(life_score between 0 and 100),
  streak_count integer default 0,
  tasks_completed integer default 0,
  tasks_total integer default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  title text not null,
  pillar text check(pillar in ('discipline','health','finance','growth')),
  completed boolean default false,
  ai_generated boolean default true,
  meta_text text default '',
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS circles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references profiles(id),
  invite_code text unique default substr(md5(random()::text),1,8),
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS circle_members (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references circles(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  trust_score integer default 50,
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS finance_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  amount numeric(10,2) not null,
  category text check(category in ('needs','wants','waste')),
  description text default '',
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS milestones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  icon text default '??',
  milestone_type text default 'general',
  achieved_at timestamptz default now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "users_own_logs" ON daily_logs FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "users_own_tasks" ON tasks FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "users_own_finance" ON finance_logs FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "users_own_milestones" ON milestones FOR ALL USING (auth.uid()::text = user_id::text);

