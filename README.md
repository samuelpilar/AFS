# AFS EV Manager

A production-ready internal management platform for AFS Argentina & Uruguay's Estructuras Voluntarias (EVs).

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database ORM:** Prisma v5
- **Database:** PostgreSQL (Vercel Postgres, Supabase, or Neon)
- **Charts:** Recharts
- **Org Chart:** ReactFlow

---

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd afs-ev-manager
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@host:5432/afs_ev_manager?schema=public"
NEXT_PUBLIC_APP_NAME="AFS EV Manager"
NEXT_PUBLIC_DEFAULT_COUNTRY="Argentina"
NEXT_PUBLIC_ENABLE_ADMIN="true"
NEXT_PUBLIC_ENABLE_EXPORTS="true"
```

### 3. Run Prisma migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed the database

```bash
npm run db:seed
```

This will populate:
- 18 EVs (Activas, Asistidas, Grupos en Desarrollo)
- EWA 2025 scores for 12 EVs
- Default catalog items (EV statuses, coordination areas, hosting statuses)
- Default admin settings

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

---

## Vercel Deployment

### 1. Create a PostgreSQL database

Options:
- **Neon** (recommended): [neon.tech](https://neon.tech) — serverless Postgres, free tier available
- **Vercel Postgres**: Enable in your Vercel project dashboard
- **Supabase**: [supabase.com](https://supabase.com)

### 2. Set environment variables in Vercel

In your Vercel project → Settings → Environment Variables, add:

```
DATABASE_URL          = <your-postgres-connection-string>
NEXT_PUBLIC_APP_NAME  = AFS EV Manager
NEXT_PUBLIC_ENABLE_ADMIN = true
NEXT_PUBLIC_ENABLE_EXPORTS = true
```

### 3. Configure build command

In `vercel.json` (or Vercel project settings), set the build command to run migrations:

```json
{
  "buildCommand": "npx prisma generate && npx prisma migrate deploy && next build"
}
```

Or create a `vercel.json` at the project root:

```json
{
  "buildCommand": "npx prisma generate && npx prisma migrate deploy && next build"
}
```

### 4. Deploy

```bash
vercel --prod
```

### 5. Seed production data (first deploy only)

After the first deploy, run the seed from your local machine pointing to the production database:

```bash
DATABASE_URL="<production-url>" npm run db:seed
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard — KPI cards, EWA ranking, mandate alerts, operational checklist, sending chart |
| `/directorio` | EV directory — filterable card grid by status, country, search |
| `/ev/[id]` | EV detail — 7 tabs: General, Coordinaciones, Hosting, Sending, EWA, Organigrama, Notas |
| `/ev/[id]/organigrama` | Full-page interactive org chart (ReactFlow) |
| `/admin` | Admin overview — system health summary |
| `/admin/settings` | Admin settings — operational params, EWA thresholds, UI labels, catalog management |

## API Routes

All routes live under `/api/`. Full CRUD for:

- `GET/POST /api/evs` — EV list and creation
- `GET/PUT/DELETE /api/evs/[id]` — EV detail
- `/api/evs/[id]/hosting/**` — Hosting records
- `/api/evs/[id]/sending/**` — Sending records
- `/api/evs/[id]/ewa/**` — EWA evaluations
- `/api/evs/[id]/coordinators/**` — Coordinators
- `/api/evs/[id]/coordinators/[coordId]/members/**` — Team members
- `/api/evs/[id]/members/[memberId]` — Member update/delete
- `/api/evs/[id]/notes/**` — Notes
- `/api/admin/settings/**` — App settings
- `/api/admin/catalog/**` — Catalog items

---

## Admin-Editable Settings

All the following can be changed from the Admin UI at `/admin/settings` **without redeploying**:

| Group | Setting | Description |
|---|---|---|
| Operational | `mandate_alert_months` | How many months ahead to alert for mandate expiry |
| Operational | `active_year` | Current active year for EWA and reports |
| Operational | `sending_cycles` | Available cycles for Sending records |
| EWA | `ewa_threshold_green` | Score ≥ this → green badge |
| EWA | `ewa_threshold_yellow` | Score ≥ this → yellow badge (below = red) |
| UI | `app_name` | Application name shown in sidebar |
| UI | `sidebar_labels` | Labels for sidebar navigation items |
| UI | `dashboard_kpi_labels` | Labels for dashboard metric cards |
| UI | `empty_state_messages` | Empty state copy throughout the app |
| Features | `exports_enabled` | Toggle PNG exports on/off |
| Catalogs | EV statuses | Add/edit/remove EV statuses and their colors |
| Catalogs | Coordination areas | Manage and reorder the 9 coordination areas |
| Catalogs | Hosting statuses | Add/edit hosting status options |

---

## Project Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Dashboard
│   ├── directorio/page.tsx     # EV directory
│   ├── ev/[id]/page.tsx        # EV detail
│   ├── ev/[id]/organigrama/    # Org chart
│   ├── admin/page.tsx          # Admin overview
│   ├── admin/settings/page.tsx # Admin settings
│   └── api/                    # REST API routes
├── components/
│   ├── layout/                 # Sidebar, TopBar
│   ├── ui/                     # shadcn/ui primitives
│   ├── dashboard/              # Dashboard widgets
│   ├── directorio/             # EV grid and cards
│   ├── ev/                     # EV detail + tabs
│   ├── organigrama/            # ReactFlow org chart
│   └── admin/                  # Admin settings UI
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── settings.ts             # Settings service layer
│   └── utils.ts                # Utilities and color helpers
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
└── types/index.ts              # Shared TypeScript types
```

---

## Adding Authentication

The app is structured to add auth without major refactor:

1. Add `next-auth` or `clerk` 
2. Wrap the root layout with a session provider
3. Add middleware for route protection
4. The admin area is already logically separated

---

## Data Model

Key models: `EV`, `Hosting`, `Sending`, `EWA`, `Coordinator`, `TeamMember`, `EVNote`, `EVTag`, `AppSetting`, `CatalogItem`.

See `prisma/schema.prisma` for the full schema.
