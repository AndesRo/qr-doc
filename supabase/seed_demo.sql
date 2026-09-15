-- ============================================================================
-- Datos DEMO — SOLO para probar la interfaz. No usar datos reales.
-- Ejecutar después de schema.sql si quieres ver la app con contenido de prueba.
-- ============================================================================

insert into public.vehicles (patente, propietario, mostrar_propietario, marca, modelo, anio, color, vin, numero_motor, activo)
values
  ('AA1234', 'DEMO - Juan Pérez', false, 'Toyota', 'Yaris', 2021, 'Gris', 'DEMO-VIN-0001', 'DEMO-MOTOR-0001', true),
  ('BBBB12', 'DEMO - María López', false, 'Chevrolet', 'Sail', 2019, 'Blanco', 'DEMO-VIN-0002', 'DEMO-MOTOR-0002', true)
on conflict (patente) do nothing;

-- Documentos DEMO para el primer vehículo (AA1234)
insert into public.vehicle_documents (vehicle_id, tipo, nombre, fecha_vencimiento, archivo_path, activo)
select id, 'padron', 'Certificado de Inscripción / Padrón (DEMO)', null, null, true
from public.vehicles where patente = 'AA1234'
on conflict do nothing;

insert into public.vehicle_documents (vehicle_id, tipo, nombre, fecha_vencimiento, archivo_path, activo)
select id, 'permiso_circulacion', 'Permiso de Circulación (DEMO)', (current_date + interval '6 months')::date, null, true
from public.vehicles where patente = 'AA1234'
on conflict do nothing;

insert into public.vehicle_documents (vehicle_id, tipo, nombre, fecha_vencimiento, archivo_path, activo)
select id, 'revision_tecnica', 'Revisión Técnica (DEMO)', (current_date - interval '10 days')::date, null, true
from public.vehicles where patente = 'AA1234'
on conflict do nothing;

-- Nota: como archivo_path queda en null, estas tarjetas se mostrarán como
-- "NO DISPONIBLE" hasta que subas un PDF real desde /admin/documentos.
