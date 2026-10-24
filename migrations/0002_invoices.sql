create table if not exists invoices (
  id text primary key,
  user_id text not null,
  number text not null default '',
  issued_on text not null default '',
  status text not null default 'draft',
  client_name text not null default '',
  company_name text not null default '',
  payload text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_updated_idx on invoices (user_id, updated_at desc);

create table if not exists invoice_settings (
  user_id text primary key,
  payload text not null,
  updated_at timestamptz not null default now()
);
