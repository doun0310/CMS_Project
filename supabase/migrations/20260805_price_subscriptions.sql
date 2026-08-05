-- 고객 ID를 저장하는 테이블
create table stripe_customers (
    user_id uuit primary key references auth.users(id),
    stripe_customer_id text unique not null
);

-- 구독 정보를 저장하는 테이블
create table stripe_customoers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    stripe_subscription_id text unique,
    plan_key text not null default 'free',
    status text not null default 'free',
    current_period_end thimstamptz,
    cancle__at_period_end boolean default false,
    updated_at timestamptz default now(),
)

-- RLS: 본인 데이터만 접근 가능하도록 설정
alter table stripe_customers enable row level security;
create policy "own subscription" on subscriptions
    for select using (auth_id() = user.id);