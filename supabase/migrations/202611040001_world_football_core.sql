-- WORLD FOOTBALL 2027: secure game economy foundation
-- Apply in Supabase SQL Editor. All currency/card mutations happen in database functions.

create extension if not exists pgcrypto;

create table if not exists public.wf_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  coins bigint not null default 5000 check (coins >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.wf_clubs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'WORLD FC' check (char_length(name) between 2 and 24),
  formation text not null default '4-3-3',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wf_player_catalog (
  id text primary key,
  name text not null,
  position text not null check (position in ('GOL','ZAG','LE','LD','VOL','MEI','PE','PD','ATA')),
  overall smallint not null check (overall between 40 and 99),
  rarity text not null check (rarity in ('COMUM','RARA','ÉPICA','LENDÁRIA','ÍDOLO')),
  drop_weight integer not null default 1 check (drop_weight > 0),
  club_name text not null default 'WORLD XI',
  active boolean not null default true
);

create table if not exists public.wf_packs (
  id text primary key,
  name text not null,
  price_coins bigint not null check (price_coins >= 0),
  active boolean not null default true
);

create table if not exists public.wf_inventory (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  player_id text not null references public.wf_player_catalog(id),
  source text not null check (source in ('PACK','MARKET','AUCTION','REWARD')),
  locked boolean not null default false,
  acquired_at timestamptz not null default now()
);

create table if not exists public.wf_pack_openings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pack_id text not null references public.wf_packs(id),
  inventory_id uuid not null references public.wf_inventory(id),
  price_paid bigint not null check (price_paid >= 0),
  opened_at timestamptz not null default now()
);

create table if not exists public.wf_market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  inventory_id uuid not null unique references public.wf_inventory(id),
  price_coins bigint not null check (price_coins > 0),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SOLD','CANCELLED')),
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.wf_auctions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  inventory_id uuid not null unique references public.wf_inventory(id),
  starting_bid bigint not null check (starting_bid > 0),
  current_bid bigint not null check (current_bid >= starting_bid),
  highest_bidder_id uuid references auth.users(id),
  ends_at timestamptz not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SOLD','UNSOLD','CANCELLED')),
  created_at timestamptz not null default now(),
  check (ends_at > created_at)
);

create table if not exists public.wf_auction_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.wf_auctions(id) on delete cascade,
  bidder_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.wf_coin_ledger (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null check (amount <> 0),
  reason text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists wf_inventory_owner_idx on public.wf_inventory(owner_id);
create index if not exists wf_market_active_idx on public.wf_market_listings(status, created_at desc);
create index if not exists wf_auctions_active_idx on public.wf_auctions(status, ends_at);
create index if not exists wf_bids_auction_idx on public.wf_auction_bids(auction_id, created_at desc);
create index if not exists wf_ledger_owner_idx on public.wf_coin_ledger(owner_id, created_at desc);

-- Create a profile and starter club whenever a user registers.
create or replace function public.wf_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_username text;
begin
  chosen_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    'player_' || substr(replace(new.id::text, '-', ''), 1, 10)
  );

  insert into public.wf_profiles(id, username, coins)
  values (new.id, chosen_username, 5000)
  on conflict (id) do nothing;

  insert into public.wf_clubs(owner_id, name)
  values (new.id, 'WORLD FC')
  on conflict (owner_id) do nothing;

  insert into public.wf_coin_ledger(owner_id, amount, reason)
  values (new.id, 5000, 'WELCOME_BONUS');

  return new;
end;
$$;

drop trigger if exists wf_on_auth_user_created on auth.users;
create trigger wf_on_auth_user_created
after insert on auth.users
for each row execute procedure public.wf_handle_new_user();

-- Lock a card when it enters either marketplace, preventing duplicate listings.
create or replace function public.wf_lock_listed_card()
returns trigger
language plpgsql
security definer
set search_path = public
as $
declare
  v_owner uuid;
  v_locked boolean;
begin
  select owner_id, locked into v_owner, v_locked
  from public.wf_inventory where id = new.inventory_id for update;
  if not found or v_owner <> new.seller_id or v_locked then
    raise exception 'CARD_NOT_AVAILABLE';
  end if;
  if exists (select 1 from public.wf_market_listings where inventory_id = new.inventory_id and status = 'ACTIVE')
     or exists (select 1 from public.wf_auctions where inventory_id = new.inventory_id and status = 'ACTIVE') then
    raise exception 'CARD_ALREADY_LISTED';
  end if;
  update public.wf_inventory set locked = true where id = new.inventory_id;
  return new;
end;
$;

drop trigger if exists wf_lock_market_card on public.wf_market_listings;
create trigger wf_lock_market_card before insert on public.wf_market_listings
for each row execute procedure public.wf_lock_listed_card();
drop trigger if exists wf_lock_auction_card on public.wf_auctions;
create trigger wf_lock_auction_card before insert on public.wf_auctions
for each row execute procedure public.wf_lock_listed_card();

-- Purchase a fixed-price listing atomically and transfer the card and coins.
create or replace function public.wf_buy_market_listing(p_listing_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $
declare
  v_user uuid := auth.uid();
  v_listing public.wf_market_listings%rowtype;
  v_balance bigint;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_listing from public.wf_market_listings
  where id = p_listing_id for update;
  if not found or v_listing.status <> 'ACTIVE' then raise exception 'LISTING_NOT_ACTIVE'; end if;
  if v_listing.expires_at is not null and v_listing.expires_at <= now() then raise exception 'LISTING_EXPIRED'; end if;
  if v_listing.seller_id = v_user then raise exception 'CANNOT_BUY_OWN_LISTING'; end if;

  select coins into v_balance from public.wf_profiles where id = v_user for update;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  if v_balance < v_listing.price_coins then raise exception 'INSUFFICIENT_COINS'; end if;

  update public.wf_profiles set coins = coins - v_listing.price_coins where id = v_user;
  update public.wf_profiles set coins = coins + v_listing.price_coins where id = v_listing.seller_id;
  update public.wf_inventory
  set owner_id = v_user, source = 'MARKET', locked = false
  where id = v_listing.inventory_id and owner_id = v_listing.seller_id and locked = true;
  if not found then raise exception 'CARD_TRANSFER_FAILED'; end if;

  update public.wf_market_listings set status = 'SOLD' where id = p_listing_id;
  insert into public.wf_coin_ledger(owner_id, amount, reason, reference_id)
  values (v_user, -v_listing.price_coins, 'MARKET_PURCHASE', p_listing_id),
         (v_listing.seller_id, v_listing.price_coins, 'MARKET_SALE', p_listing_id);

  return jsonb_build_object('listing_id', p_listing_id, 'status', 'SOLD', 'inventory_id', v_listing.inventory_id);
end;
$;

-- Pack opening is atomic: lock wallet, debit coins, roll on the server, grant exactly one card.
create or replace function public.wf_open_pack(p_pack_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_price bigint;
  v_balance bigint;
  v_total integer;
  v_roll integer;
  v_player public.wf_player_catalog%rowtype;
  v_inventory_id uuid;
  v_opening_id uuid;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;

  select price_coins into v_price
  from public.wf_packs
  where id = p_pack_id and active = true;
  if not found then raise exception 'PACK_NOT_AVAILABLE'; end if;

  select coins into v_balance
  from public.wf_profiles
  where id = v_user
  for update;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  if v_balance < v_price then raise exception 'INSUFFICIENT_COINS'; end if;

  select sum(drop_weight) into v_total
  from public.wf_player_catalog where active = true;
  if coalesce(v_total, 0) <= 0 then raise exception 'PLAYER_CATALOG_EMPTY'; end if;

  v_roll := floor(random() * v_total)::integer + 1;

  select id into v_player.id
  from (
    select id, sum(drop_weight) over (order by id) as cumulative_weight
    from public.wf_player_catalog
    where active = true
  ) weighted
  where cumulative_weight >= v_roll
  order by cumulative_weight
  limit 1;

  select * into v_player from public.wf_player_catalog where id = v_player.id;

  update public.wf_profiles set coins = coins - v_price where id = v_user;
  insert into public.wf_inventory(owner_id, player_id, source)
  values (v_user, v_player.id, 'PACK')
  returning id into v_inventory_id;

  insert into public.wf_pack_openings(owner_id, pack_id, inventory_id, price_paid)
  values (v_user, p_pack_id, v_inventory_id, v_price)
  returning id into v_opening_id;

  if v_price > 0 then
    insert into public.wf_coin_ledger(owner_id, amount, reason, reference_id)
    values (v_user, -v_price, 'PACK_OPENING', v_opening_id);
  end if;

  return jsonb_build_object(
    'opening_id', v_opening_id,
    'inventory_id', v_inventory_id,
    'player', jsonb_build_object(
      'id', v_player.id, 'name', v_player.name, 'position', v_player.position,
      'overall', v_player.overall, 'rarity', v_player.rarity, 'club_name', v_player.club_name
    ),
    'coins_remaining', v_balance - v_price
  );
end;
$$;

-- Place a bid under a row lock to prevent simultaneous bids from bypassing the minimum.
create or replace function public.wf_place_bid(p_auction_id uuid, p_amount bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_auction public.wf_auctions%rowtype;
  v_balance bigint;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_auction from public.wf_auctions
  where id = p_auction_id for update;
  if not found or v_auction.status <> 'ACTIVE' then raise exception 'AUCTION_NOT_ACTIVE'; end if;
  if v_auction.ends_at <= now() then raise exception 'AUCTION_ENDED'; end if;
  if v_auction.seller_id = v_user then raise exception 'CANNOT_BID_OWN_AUCTION'; end if;
  if p_amount <= v_auction.current_bid then raise exception 'BID_TOO_LOW'; end if;

  select coins into v_balance from public.wf_profiles where id = v_user for update;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  if v_balance < p_amount then raise exception 'INSUFFICIENT_COINS'; end if;

  -- Release the previous leader's escrow before reserving the new bid.
  if v_auction.highest_bidder_id is not null then
    update public.wf_profiles
    set coins = coins + v_auction.current_bid
    where id = v_auction.highest_bidder_id;
    insert into public.wf_coin_ledger(owner_id, amount, reason, reference_id)
    values (v_auction.highest_bidder_id, v_auction.current_bid, 'AUCTION_OUTBID_REFUND', p_auction_id);
  end if;

  update public.wf_profiles set coins = coins - p_amount where id = v_user;
  insert into public.wf_coin_ledger(owner_id, amount, reason, reference_id)
  values (v_user, -p_amount, 'AUCTION_BID_ESCROW', p_auction_id);

  insert into public.wf_auction_bids(auction_id, bidder_id, amount)
  values (p_auction_id, v_user, p_amount);

  update public.wf_auctions
  set current_bid = p_amount, highest_bidder_id = v_user
  where id = p_auction_id;

  return jsonb_build_object('auction_id', p_auction_id, 'current_bid', p_amount, 'highest_bidder_id', v_user);
end;
$$;

-- Finalize after expiry: transfer the card to the winner and pay the seller from escrow.
create or replace function public.wf_finalize_auction(p_auction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auction public.wf_auctions%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_auction from public.wf_auctions
  where id = p_auction_id for update;
  if not found then raise exception 'AUCTION_NOT_FOUND'; end if;
  if v_auction.status <> 'ACTIVE' then raise exception 'AUCTION_ALREADY_FINALIZED'; end if;
  if v_auction.ends_at > now() then raise exception 'AUCTION_NOT_ENDED'; end if;

  if v_auction.highest_bidder_id is null then
    update public.wf_auctions set status = 'UNSOLD' where id = p_auction_id;
    return jsonb_build_object('auction_id', p_auction_id, 'status', 'UNSOLD');
  end if;

  update public.wf_inventory
  set owner_id = v_auction.highest_bidder_id, source = 'AUCTION', locked = false
  where id = v_auction.inventory_id and owner_id = v_auction.seller_id;

  if not found then raise exception 'AUCTION_CARD_TRANSFER_FAILED'; end if;

  update public.wf_profiles
  set coins = coins + v_auction.current_bid
  where id = v_auction.seller_id;

  insert into public.wf_coin_ledger(owner_id, amount, reason, reference_id)
  values (v_auction.seller_id, v_auction.current_bid, 'AUCTION_SALE', p_auction_id);

  update public.wf_auctions set status = 'SOLD' where id = p_auction_id;
  return jsonb_build_object('auction_id', p_auction_id, 'status', 'SOLD', 'winner_id', v_auction.highest_bidder_id);
end;
$$;

-- Read policies: players/packs/listings are public; personal data is owner-only.
alter table public.wf_profiles enable row level security;
alter table public.wf_clubs enable row level security;
alter table public.wf_player_catalog enable row level security;
alter table public.wf_packs enable row level security;
alter table public.wf_inventory enable row level security;
alter table public.wf_pack_openings enable row level security;
alter table public.wf_market_listings enable row level security;
alter table public.wf_auctions enable row level security;
alter table public.wf_auction_bids enable row level security;
alter table public.wf_coin_ledger enable row level security;

drop policy if exists "profile read own" on public.wf_profiles;
create policy "profile read own" on public.wf_profiles for select to authenticated using (id = auth.uid());
drop policy if exists "club read public" on public.wf_clubs;
create policy "club read public" on public.wf_clubs for select to authenticated using (true);
drop policy if exists "club owner update" on public.wf_clubs;
create policy "club owner update" on public.wf_clubs for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "catalog read public" on public.wf_player_catalog;
create policy "catalog read public" on public.wf_player_catalog for select to authenticated using (active = true);
drop policy if exists "packs read public" on public.wf_packs;
create policy "packs read public" on public.wf_packs for select to authenticated using (active = true);
drop policy if exists "inventory read own" on public.wf_inventory;
create policy "inventory read own" on public.wf_inventory for select to authenticated using (owner_id = auth.uid());
drop policy if exists "openings read own" on public.wf_pack_openings;
create policy "openings read own" on public.wf_pack_openings for select to authenticated using (owner_id = auth.uid());
drop policy if exists "market read active" on public.wf_market_listings;
create policy "market read active" on public.wf_market_listings for select to authenticated using (status = 'ACTIVE' or seller_id = auth.uid());
drop policy if exists "market seller create" on public.wf_market_listings;
create policy "market seller create" on public.wf_market_listings for insert to authenticated with check (
  seller_id = auth.uid() and exists (
    select 1 from public.wf_inventory i where i.id = inventory_id and i.owner_id = auth.uid() and i.locked = false
  )
);
drop policy if exists "auctions read active" on public.wf_auctions;
create policy "auctions read active" on public.wf_auctions for select to authenticated using (status = 'ACTIVE' or seller_id = auth.uid());
drop policy if exists "auction seller create" on public.wf_auctions;
create policy "auction seller create" on public.wf_auctions for insert to authenticated with check (
  seller_id = auth.uid() and current_bid = starting_bid and highest_bidder_id is null and status = 'ACTIVE'
  and exists (select 1 from public.wf_inventory i where i.id = inventory_id and i.owner_id = auth.uid() and i.locked = false)
);
drop policy if exists "bids read authenticated" on public.wf_auction_bids;
create policy "bids read authenticated" on public.wf_auction_bids for select to authenticated using (true);
drop policy if exists "ledger read own" on public.wf_coin_ledger;
create policy "ledger read own" on public.wf_coin_ledger for select to authenticated using (owner_id = auth.uid());

-- No client-side direct writes to balances, inventory, openings, bids, or auction state.
revoke all on public.wf_profiles, public.wf_inventory, public.wf_pack_openings, public.wf_coin_ledger from anon, authenticated;
grant select on public.wf_profiles, public.wf_inventory, public.wf_pack_openings, public.wf_coin_ledger to authenticated;
grant select on public.wf_clubs, public.wf_player_catalog, public.wf_packs, public.wf_market_listings, public.wf_auctions, public.wf_auction_bids to authenticated;
grant update(name, formation) on public.wf_clubs to authenticated;
grant insert on public.wf_market_listings, public.wf_auctions to authenticated;
revoke all on function public.wf_buy_market_listing(uuid) from public, anon;\ngrant execute on function public.wf_buy_market_listing(uuid) to authenticated;\nrevoke all on function public.wf_open_pack(text) from public, anon;
grant execute on function public.wf_open_pack(text) to authenticated;
revoke all on function public.wf_place_bid(uuid, bigint) from public, anon;
grant execute on function public.wf_place_bid(uuid, bigint) to authenticated;

-- Starter content for development. Replace/extend with licensed player data before public launch.
insert into public.wf_player_catalog(id,name,position,overall,rarity,drop_weight,club_name) values
('wf-striker-92','Atacante Estrela','ATA',92,'ÍDOLO',2,'WORLD XI'),
('wf-midfielder-89','Meia Maestro','MEI',89,'LENDÁRIA',5,'WORLD XI'),
('wf-defender-86','Defensor Muralha','ZAG',86,'ÉPICA',12,'WORLD XI'),
('wf-goalkeeper-85','Goleiro Seguro','GOL',85,'ÉPICA',12,'WORLD XI'),
('wf-winger-78','Ponta Veloz','PD',78,'RARA',28,'WORLD XI'),
('wf-midfielder-74','Volante Incansável','VOL',74,'COMUM',41,'WORLD XI')
on conflict (id) do nothing;

insert into public.wf_packs(id,name,price_coins,active)
values ('starter-stars','Pacote Estrelas',500,true)
on conflict (id) do nothing;
