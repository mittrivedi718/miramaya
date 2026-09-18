-- Private one-time full-site view links.
-- Status is derived from timestamps (see lib/private-view/status.ts); there is no
-- status column and no cron. All time decisions use the database clock now().

create extension if not exists pgcrypto;

create table if not exists private_share_links (
  id                uuid primary key default gen_random_uuid(),
  token_hash        text not null unique,        -- sha256(raw token), hex
  token_ciphertext  text,                        -- AES-256-GCM of raw token; NULL after claim/revoke
  label             text,
  duration_seconds  integer not null default 1800,
  created_at        timestamptz not null default now(),
  first_viewed_at   timestamptz,
  expires_at        timestamptz,
  revoked_at        timestamptz
);

create table if not exists private_view_sessions (
  id                  uuid primary key default gen_random_uuid(),
  link_id             uuid not null unique references private_share_links(id) on delete cascade,
  session_token_hash  text not null unique,
  created_at          timestamptz not null default now(),
  expires_at          timestamptz not null
);

create index if not exists private_view_sessions_token_idx on private_view_sessions (session_token_hash);
