-- ============================================================================
-- vehiculo-qr — Esquema de base de datos, RLS y Storage para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabla: vehicles
-- ----------------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  patente text not null unique,
  propietario text,
  mostrar_propietario boolean not null default false,
  marca text not null default '',
  modelo text not null default '',
  anio integer,
  color text,
  vin text,
  numero_motor text,
  activo boolean not null default true,
  codigo_verificacion text not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vehicles_patente on public.vehicles (patente);

-- ----------------------------------------------------------------------------
-- Tabla: vehicle_documents
-- ----------------------------------------------------------------------------
create table if not exists public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  tipo text not null check (
    tipo in ('padron', 'permiso_circulacion', 'revision_tecnica', 'emisiones', 'soap')
  ),
  nombre text not null default '',
  fecha_vencimiento date,
  archivo_path text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_documents_vehicle_id on public.vehicle_documents (vehicle_id);

-- ----------------------------------------------------------------------------
-- Trigger genérico para actualizar updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_vehicles_updated_at on public.vehicles;
create trigger trg_vehicles_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_documents_updated_at on public.vehicle_documents;
create trigger trg_documents_updated_at
  before update on public.vehicle_documents
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.vehicles enable row level security;
alter table public.vehicle_documents enable row level security;

-- Público: solo puede LEER vehículos activos (todas las columnas quedan
-- expuestas a nivel de fila; el filtrado de columnas sensibles como el RUT,
-- domicilio, teléfono o correo se hace en la capa de aplicación, ya que
-- esos campos ni siquiera existen en esta tabla).
drop policy if exists "public_select_active_vehicles" on public.vehicles;
create policy "public_select_active_vehicles"
  on public.vehicles for select
  to anon
  using (activo = true);

-- Público: solo puede leer documentos activos de vehículos activos.
drop policy if exists "public_select_active_documents" on public.vehicle_documents;
create policy "public_select_active_documents"
  on public.vehicle_documents for select
  to anon
  using (
    activo = true
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_documents.vehicle_id and v.activo = true
    )
  );

-- Administradores autenticados: acceso completo (CRUD) a ambas tablas.
drop policy if exists "admin_all_vehicles" on public.vehicles;
create policy "admin_all_vehicles"
  on public.vehicles for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "admin_all_documents" on public.vehicle_documents;
create policy "admin_all_documents"
  on public.vehicle_documents for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- Storage: bucket privado para documentos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vehicle-documents', 'vehicle-documents', false)
on conflict (id) do nothing;

-- Administradores autenticados: control total del bucket (subir, reemplazar,
-- eliminar, listar).
drop policy if exists "admin_manage_vehicle_documents_storage" on storage.objects;
create policy "admin_manage_vehicle_documents_storage"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'vehicle-documents')
  with check (bucket_id = 'vehicle-documents');

-- Público (rol anon): la página /v/:patente genera "signed URLs" con
-- supabase.storage.from('vehicle-documents').createSignedUrl(path, ttl)
-- usando la clave anon. Esa llamada exige permiso SELECT sobre el objeto,
-- así que se permite únicamente cuando el archivo corresponde a un
-- documento activo de un vehículo activo (nunca acceso libre al bucket).
drop policy if exists "public_select_active_vehicle_documents_storage" on storage.objects;
create policy "public_select_active_vehicle_documents_storage"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'vehicle-documents'
    and exists (
      select 1
      from public.vehicle_documents d
      join public.vehicles v on v.id = d.vehicle_id
      where d.archivo_path = storage.objects.name
        and d.activo = true
        and v.activo = true
    )
  );
