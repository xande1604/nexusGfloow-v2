# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Production build → ./dist/
npm run lint       # ESLint check
npm run preview    # Preview production build locally
```

**Deploy**: Push to `main` → GitHub Actions runs `npm install && npm run build` → FTP upload to Hostinger `/public_html/`. No manual deploy needed.

**Edge Functions**: Deployed via Supabase MCP (`deploy_edge_function`) or Supabase CLI. The Supabase CLI is NOT available in this environment — always use the MCP tools.

---

## Architecture Overview

**Stack**: React 18.3 + TypeScript + Vite 5, Tailwind CSS + shadcn/ui (Radix UI), Supabase (PostgreSQL + Auth + Edge Functions in Deno), React Router v6, React Hook Form + Zod, Recharts, sonner (toasts).

**Supabase project ID**: `qashsyjrazmkhgeesglb`  
**Production URL**: `https://nexus.gfloow.com.br`  
**Self-assessment portal**: `https://nexus.gfloow.com.br/autoavaliacao`

### Directory structure

```
src/
  components/      # Feature-scoped UI components
    demo/          # demoData.ts — static mock data for demo mode
    performance/   # CycleManagementView, PerformanceView, ReviewDetailView, etc.
    ui/            # shadcn/ui primitives (never edit directly)
  contexts/        # DemoContext (demo mode), AuthContext
  hooks/           # Data hooks: useEvaluationCycles, usePerformanceReviews, useEmployees, etc.
  integrations/
    supabase/      # client.ts (typed client) + types.ts (generated DB types)
  lib/
    fetchAllRows.ts        # Paginated Supabase reads (bypasses 1000-row limit)
    utils.ts               # cn() helper
    generateCycleReport.ts # PDF generation for evaluation cycles
  pages/           # Route-level components (Index, SelfAssessment, Auth, etc.)
  types/           # index.ts — shared interfaces (Employee, JobRole, CareerRoadmap, etc.)

supabase/
  functions/       # Deno Edge Functions
    send-evaluation-invite/   # Email invites via Resend API
    submit-self-assessment/   # Employee self-assessment submission
    generate-review-questions/ # AI-generated questions
    generate-roadmap/          # AI career roadmap generation
    (+ others)
  migrations/      # SQL migrations
```

---

## Critical Database Rules

### Table naming
There are **two employee tables**:
- `nexus_employees` — the real table. Has FKs from `employee_evaluations` and `performance_reviews`. Use this everywhere.
- `employees` — legacy/different table. **No FK relations to evaluations or reviews.** Never join from evaluation tables to `employees`.

Always join as: `employee:nexus_employees(id, nome, email, codigocargo, gestor_id)`

### Employee fields
- `nexus_employees.nome` — employee name (not `name`)
- `nexus_employees.linked_user_id` — UUID if employee has a platform account, `null` if not
- `Employee.roleId` in TypeScript maps to `nexus_employees.codigocargo` — this is a **string code** (e.g. `'2991'`), NOT a UUID

### Role lookup
`Employee.roleId` stores `codigocargo` (a string code), not the role's UUID. When matching roles to employees:
```typescript
const role = roles.find(r =>
  r.id === employee.roleId ||
  r.title === employee.roleId ||
  String(r.codigocargo).trim() === String(employee.roleId).trim()
);
// Always use role.id (UUID) as the Select value, not codigocargo
```

### owner_admin_id (required on all inserts)
Every insert into `evaluation_cycles`, `employee_evaluations`, and `performance_reviews` requires `owner_admin_id`. Fetch it like this:
```typescript
const { data: userData } = await supabase.auth.getUser();
const userId = userData?.user?.id;
const { data: ownerIdData } = await supabase.rpc('get_owner_admin_id', { _user_id: userId });
const ownerAdminId = ownerIdData ?? userId;
```

### RLS Policies
- `evaluation_cycles`, `employee_evaluations`: `auth.role() = 'authenticated'`
- `performance_reviews`: same policy applied via migration
- Always test inserts as an authenticated user; RLS blocks anonymous access

### Supabase joins
`employee_evaluations` and `performance_reviews` each have **two FKs to `nexus_employees`** (`employee_id` and `hr_responsible_id`). Always use the explicit column hint to avoid PostgREST HTTP 300 errors:
```typescript
// Correct — disambiguate with column name hint
select: 'id, employee_id, nexus_employees!performance_reviews_employee_id_fkey(nome)'
select: '*, employee:nexus_employees!employee_evaluations_employee_id_fkey(id, nome, email, codigocargo, gestor_id)'

// Wrong — ambiguous when multiple FKs exist to same table
select: 'id, employee_id, nexus_employees(nome)'
```

---

## Status Values

**`employee_evaluations.status`** (cycle evaluations):
- `'pending'` — not started
- `'self_assessment_done'` — employee completed self-assessment
- `'completed'` — manager completed evaluation

**`performance_reviews.status`** (standalone reviews):
- `'PendingSelf'` — waiting for employee self-assessment
- `'PendingManager'` — waiting for manager evaluation
- `'Completed'` — fully done

---

## Data Fetching

Always use `fetchAllRows` from `src/lib/fetchAllRows.ts` instead of direct `.select()` for lists. This paginates automatically to bypass Supabase's 1000-row limit:

```typescript
import { fetchAllRows } from '@/lib/fetchAllRows';

const data = await fetchAllRows('employee_evaluations', {
  select: '*, employee:nexus_employees(id, nome, email)',
  order: { column: 'created_at', ascending: false },
  filters: cycleId ? (q) => q.eq('cycle_id', cycleId) : undefined,
});
```

---

## Demo Mode

`DemoContext` controls demo mode. When `isDemoMode` is true:
- Use static data from `src/components/demo/demoData.ts` instead of real DB queries
- Demo user email: `demo@gfloow.com.br`
- Users with no `user_roles` entry automatically get demo mode

Pattern used throughout hooks:
```typescript
const { isDemoMode } = useDemo();
const reviews = isDemoMode ? demoPerformanceReviews as PerformanceReview[] : realReviews;
```

Never call mutating operations (insert/update/delete) in demo mode.

---

## Email System (Resend API)

Emails are sent via the `send-evaluation-invite` Edge Function using the Resend API.

**Secrets** (set in Supabase Dashboard → Edge Functions → Secrets):
- `RESEND_API_KEY` — Resend API key
- `RESEND_FROM_EMAIL` — sender address (e.g. `contato@gfloow.com.br`)

**Invocation pattern**:
```typescript
await supabase.functions.invoke('send-evaluation-invite', {
  body: {
    type: 'self_assessment' | 'manager_evaluation',
    reviewType: 'cycle' | 'standalone',
    employeeName: string,
    employeeEmail: string,
    // For cycles:
    cycleTitle?: string,
    cycleId?: string,
    evaluationId?: string,
    cycleEndDate?: string,
    // For standalone:
    performanceReviewId?: string,
    // For manager evaluation:
    managerName?: string,
    managerEmail?: string,
  }
});
```

The function checks `nexus_employees.linked_user_id` by email — users with an account get a direct login link; users without an account get step-by-step registration instructions.

Auto-send invites:
- When creating a standalone review (`PerformanceView` → `handleSaveReview`)
- When adding an employee to a cycle (`CycleManagementView` → `handleAddEmployeeWithQuestions`)

---

## Supabase MCP Usage

In this environment the Supabase CLI is not available. Use MCP tools instead:

- `execute_sql` — run raw SQL queries for debugging or verification
- `apply_migration` — apply schema changes (RLS policies, table alterations)
- `deploy_edge_function` — deploy Edge Functions from `supabase/functions/<name>/`
- `get_logs` — check Edge Function invocation logs
- `list_tables`, `generate_typescript_types` — schema introspection

---

## Evaluation Cycle Flow

1. Admin creates cycle via `useEvaluationCycles.createCycle()`
2. Admin adds employees via `addEmployeesToCycle()` → inserts into `employee_evaluations` + auto-sends self-assessment invite email
3. Employee completes self-assessment via `/autoavaliacao` portal → `submit-self-assessment` Edge Function → status → `'self_assessment_done'`
4. Manager evaluates via `CycleManagementView` → `submitManagerEvaluation()` → status → `'completed'`
5. Cycle can be closed via `closeCycle()` → `evaluation_cycles.status = 'closed'`

Invite history logged to `evaluation_invite_history` table (cycle evaluations only, not standalone).
