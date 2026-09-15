# vehiculo-qr

Aplicación web para asociar un vehículo a una patente y generar un código QR
que permite consultar públicamente el estado de sus documentos.

> ⚠️ **Esta plataforma es informativa y no reemplaza la verificación oficial
> de Carabineros de Chile ni de los organismos competentes.** No es un
> servicio oficial del Estado de Chile, Carabineros, Registro Civil ni del
> Ministerio de Transportes.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (componentes propios en estilo shadcn/ui)
- React Router
- Supabase (Auth, PostgreSQL, Storage)
- `qrcode.react` para generación de QR (PNG/SVG)
- Listo para desplegar en Vercel

---

## 1. Requisitos previos

- Node.js 18+
- Una cuenta y proyecto en [Supabase](https://supabase.com)

---

## 2. Configuración de Supabase

### 2.1 Crear el proyecto

1. Crea un proyecto nuevo en Supabase.
2. Ve a **Project Settings → API** y copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

   **Nunca copies ni uses la `service_role` key en el frontend.**

### 2.2 Crear las tablas, RLS y el bucket de Storage

1. Abre **SQL Editor** en el dashboard de Supabase.
2. Ejecuta el contenido completo de [`supabase/schema.sql`](./supabase/schema.sql).

   Esto crea:
   - Tabla `vehicles` (patente, marca, modelo, año, color, VIN, N° de motor,
     propietario, flags de visibilidad/activo, código de verificación).
   - Tabla `vehicle_documents` (tipo, nombre, fecha de vencimiento, ruta del
     archivo, activo), con `tipo` restringido a:
     `padron | permiso_circulacion | revision_tecnica | emisiones | soap`.
   - Row Level Security en ambas tablas:
     - **Público (`anon`)**: solo puede leer vehículos **activos** y
       documentos **activos** de vehículos activos.
     - **Administradores (`authenticated`)**: CRUD completo.
   - Bucket privado `vehicle-documents` en Storage, con políticas para que:
     - Los administradores autenticados puedan subir/reemplazar/eliminar
       archivos.
     - El público solo pueda generar **URLs firmadas** (`createSignedUrl`)
       para archivos que pertenezcan a un documento activo de un vehículo
       activo — nunca acceso libre al bucket.

3. (Opcional) Para probar la interfaz con datos de ejemplo, ejecuta también
   [`supabase/seed_demo.sql`](./supabase/seed_demo.sql). Todos los registros
   quedan marcados explícitamente como `DEMO` y no representan datos reales.

### 2.3 Crear el primer administrador

El panel `/admin` usa **Supabase Auth** (email + contraseña). Para crear el
primer usuario administrador:

1. Ve a **Authentication → Users** en el dashboard de Supabase.
2. Haz clic en **Add user** → **Create new user**.
3. Ingresa un correo y una contraseña, y confirma el usuario (o desactiva la
   confirmación por correo en **Authentication → Providers → Email** durante
   desarrollo).
4. Ese usuario ya puede iniciar sesión en `/login` y acceder a `/admin`.

No existe un flujo de registro público: los administradores solo se crean
desde el dashboard de Supabase, a propósito, para no exponer un endpoint de
alta de administradores.

---

## 3. Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SITE_URL=https://tudominio.cl
```

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: desde **Project Settings → API**.
- `VITE_SITE_URL`: el dominio público final (usado para construir la URL que
  codifica cada QR: `https://tudominio.cl/v/PATENTE`). En desarrollo puedes
  omitirlo y la app usará `window.location.origin` automáticamente.

---

## 4. Ejecución local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

- Página pública de ejemplo: `http://localhost:5173/v/AA1234` (si cargaste
  el seed demo).
- Panel admin: `http://localhost:5173/login`.

---

## 5. Generación de QR

Desde `/admin/vehiculos`, cada vehículo tiene un botón de QR que lleva a
`/admin/qr/:id`. Esa página muestra:

- La patente destacada.
- El QR (apunta siempre a `VITE_SITE_URL/v/PATENTE`, por lo que sigue
  funcionando aunque se actualicen los documentos del vehículo).
- Botón **Copiar URL**.
- Botón **Descargar QR PNG**.
- Botón **Descargar QR SVG**.
- Botón **"Ver documentos sin escanear"**: abre la misma vista pública en
  una pestaña nueva, para el caso en que el fiscalizador prefiera no
  escanear el código y revisar los documentos directamente desde el celular
  de quien conduce. El mismo acceso directo (icono ↗) está disponible junto
  a cada vehículo en `/admin/vehiculos`.

## 5.1 Diseño e identidad visual

- **Logo propio** (`src/components/Logo.tsx`): un "ojo" buscador de QR
  combinado con un check de verificación — sin escudos ni símbolos que
  puedan confundirse con un organismo oficial. Se usa como favicon, en el
  header admin, en el login y en las páginas públicas.
- **Tipografía**: Space Grotesk para títulos, Inter para texto y
  JetBrains Mono para patentes y datos técnicos (VIN, N° de motor).
- **Color**: se mantiene el azul institucional `#0F3D68` pedido en el
  brief, sumando un acento cian (`#0EA5E9`) para las acciones de
  verificación/QR y fondos con leve textura (`bg-mesh-light`).
  Los estados (verde/rojo/naranja) siguen siendo los mismos para no perder
  reconocimiento visual.
- **Login** rediseñado con panel de marca en pantallas grandes (oculto en
  celular para priorizar el formulario) y tarjeta con logo en móvil.

## 5.2 SEO

- `index.html` incluye título, meta description, Open Graph y
  `theme-color`.
- Cada página actualiza dinámicamente `<title>` y la meta description
  mediante `src/lib/useSeo.ts`.
- Las rutas administrativas (`/admin/*`, `/login`) se marcan como
  `noindex, nofollow` para no quedar expuestas en buscadores.
- `public/robots.txt` bloquea el rastreo de `/admin` y `/login`.
- Pendiente opcional: agregar una imagen `public/og-image.png` (1200×630)
  si quieres una vista previa enriquecida al compartir el enlace en redes.

## 5.3 Mobile-first

- El listado de vehículos usa tarjetas apiladas en celular y tabla en
  pantallas ≥640px (no se fuerza scroll horizontal en el teléfono).
- La navegación admin es desplazable horizontalmente si no cabe en pantallas
  angostas.
- El modal de carga de documentos tiene altura máxima con scroll interno
  para no desbordar en pantallas pequeñas.
- La página pública `/v/:patente` — la más usada desde un celular al
  escanear el QR — se mantiene en una sola columna, con tarjetas grandes y
  botones de ancho completo para facilitar la lectura y el toque rápido.

---

## 6. Estructura del proyecto

```
src/
  components/         Componentes de dominio (PlateDisplay, DocumentCard, StatusBanner, AdminLayout, ProtectedRoute)
  components/ui/       Componentes base de UI (Button, Card, Input, Badge, Skeleton, Spinner)
  context/AuthContext.tsx   Estado de sesión de Supabase Auth
  lib/
    supabase.ts         Cliente de Supabase
    patente.ts           Normalización y validación de patente chilena
    documentStatus.ts     Cálculo de estados (documento y vehículo)
    utils.ts              Helpers (cn, formatDate)
  pages/
    Home.tsx
    PublicVehicle.tsx     Consulta pública /v/:patente
    Login.tsx
    NotFound.tsx
    admin/
      Dashboard.tsx
      VehiclesList.tsx
      VehicleForm.tsx      Crear / editar vehículo
      DocumentsList.tsx    Listado + carga de documentos
      QrPage.tsx           Generación y descarga del QR
supabase/
  schema.sql            Tablas, RLS, Storage
  seed_demo.sql          Datos de ejemplo (DEMO)
```

---

## 7. Reglas de negocio clave

- **Padrón**: no vence. Su estado es `REGISTRADO` una vez cargado.
- **Permiso de Circulación, Revisión Técnica, Emisiones, SOAP**: requieren
  fecha de vencimiento. Estado `VIGENTE` o `VENCIDO` según la fecha actual.
- **Estado general del vehículo**:
  - `VEHÍCULO VERIFICADO`: activo, con los 5 documentos requeridos cargados
    y ninguno vencido.
  - `DOCUMENTACIÓN INCOMPLETA`: falta algún documento requerido.
  - `DOCUMENTACIÓN CON VENCIMIENTOS`: hay al menos un documento vencido.
  - No se usan los términos "vehículo legal", "autorizado" ni "aprobado".
- **Datos nunca expuestos en la consulta pública**: RUT, domicilio, teléfono,
  correo electrónico. El campo "Propietario" solo se muestra si se activa
  explícitamente el flag `mostrar_propietario` al crear/editar el vehículo.

---

## 8. Despliegue en Vercel

1. Sube el repositorio a GitHub/GitLab/Bitbucket.
2. En Vercel, **Add New → Project** y selecciona el repositorio.
3. Framework preset: **Vite**.
4. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` → el dominio final que asignará Vercel (o tu dominio
     propio conectado).
5. Deploy.

Como es una SPA con rutas del lado del cliente (`/v/:patente`, `/admin`,
etc.), agrega un archivo `vercel.json` con reescritura a `index.html` si
usas rutas limpias (ya incluido en este proyecto).

---

## 9. Seguridad

- La `service_role` key de Supabase **nunca** se usa ni se expone en el
  frontend; toda la app funciona solo con la clave `anon` + RLS.
- Los documentos se sirven exclusivamente mediante URLs firmadas de vida
  corta (60 segundos), nunca mediante URLs públicas permanentes.
- RLS impide que el rol `anon` vea vehículos/documentos inactivos o
  modifique cualquier dato.
- Los errores técnicos de Supabase no se muestran directamente al usuario;
  se traducen a mensajes genéricos en español.
