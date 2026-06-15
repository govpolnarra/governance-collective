# Governance Collective

Phase 1 Next.js/Supabase platform for curated governance problem-solving: field playbooks, validated solution profiles, district canvases, Action Lab workspaces, requests, people discovery, GovCap learning, and curation workflows.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill the Supabase values:

```bash
cp .env.example .env.local
```

3. Apply the Phase 1 migration in Supabase:

```bash
supabase db push
```

4. Seed safe Bihar demo records if desired:

```bash
supabase db execute --file supabase/seed/phase1_demo.sql
```

5. Run the app:

```bash
npm run dev
```

## Product modules

- Public gateway with invite-only, curation-first positioning
- Dashboard with cross-object search, counts, attention items, and role-aware actions
- Discover search across playbooks, solutions, requests, people, districts, Action Labs, and learning resources
- District Canvas and Action Lab workspaces for trusted users
- People Directory with contribution and recognition signals
- Solution Architecture Studio for pathway briefs
- GovCap Learning Hub tabs for inside-government, outside-government, templates, and clinics
- Curator/Admin navigation for review and approval workflows
- Resend-backed invitation and welcome email helpers for invite-only onboarding

## Database

The Phase 1 migration lives at `supabase/migrations/202606150001_governance_collective_phase1.sql`. It expands roles, access tiers, visibility fields, districts, Action Labs, learning logs, organisations, endorsements, request responses, case notes, solution pathways, and curation checklist fields.

No secrets should be committed. Use `.env.local` for Supabase keys and deployment-only values.

## Email

Supabase Auth still owns magic-link sessions. Resend is used for product emails such as invites and welcome messages. For production, set:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO`

To send Supabase magic links through Resend as well, configure Supabase Auth SMTP with Resend's SMTP settings in the Supabase dashboard.

For branded sending, verify `govinit.online` in Resend and set:

```bash
RESEND_FROM_EMAIL="Governance Collective <no-reply@govinit.online>"
```
