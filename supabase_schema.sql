
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  bio text,
  avatar_url text,
  skills_offered text[] default '{}',
  skills_wanted text[] default '{}',
  verified_skills text[] default '{}',
  availability text default 'Flexible',
  rating float default 5.0,
  role text default 'user' check (role in ('user', 'admin')),
  blocked_users text[] default '{}',
  credits integer default 0,
  badges text[] default '{b1}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SKILLS TABLE
create table skills (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  description text,
  owner_id uuid references profiles(id) on delete cascade,
  tags text[] default '{}',
  level text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MATCHES TABLE
create table matches (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references profiles(id) on delete cascade,
  user2_id uuid references profiles(id) on delete cascade,
  skill_offered_id uuid references skills(id),
  skill_wanted_id uuid references skills(id),
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  scheduled_time timestamp with time zone,
  meet_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES TABLE
create table messages (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  text text,
  media_url text,
  type text default 'text' check (type in ('text', 'image')),
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  read boolean default false
);

-- NOTIFICATIONS TABLE
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  message text not null,
  type text not null,
  read boolean default false,
  match_id uuid references matches(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASKS TABLE
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  difficulty text not null,
  credits_reward integer not null,
  status text default 'pending' check (status in ('pending', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- FEEDBACKS TABLE
create table feedbacks (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references matches(id),
  from_user_id uuid references profiles(id),
  to_user_id uuid references profiles(id),
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POSTS TABLE (Community Feed)
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  content text not null,
  tags text[] default '{}',
  likes uuid[] default '{}',
  type text default 'question' check (type in ('question', 'tip')),
  comments jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table skills enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table tasks enable row level security;

-- Setup basic RLS policies (Allow users to see everything, but only edit their own data)
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Skills are viewable by everyone." on skills for select using (true);
create policy "Users can insert own skills." on skills for insert with check (auth.uid() = owner_id);

create policy "Matches are viewable by involved users." on matches for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Messages are viewable by match participants." on messages for select using (
  exists (
    select 1 from matches 
    where matches.id = match_id and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
  )
);
