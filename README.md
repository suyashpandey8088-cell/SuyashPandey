# Suyash Pandey — NIAT Student Council Presidential Campaign

A production-ready campaign platform: an editorial public website plus a private,
database-backed dashboard that the candidate controls without touching code.

**Live:** <https://suyash-pandey-campaign.vercel.app> · admin at `/admin`

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · GSAP +
ScrollTrigger · Supabase (Postgres, Auth, Storage, RLS) · Vercel.

> This is a **campaign** website. It is not an official NIAT website, and every
> initiative on it is labelled as a proposal. See “Editorial rules” below.

---

## 1. What is here

### Public site (`/`)

| Route | Purpose |
| --- | --- |
| `/` | The full scrolling campaign: hero, statement, candidate, vision, manifesto, live updates, events, progress board, Student Voice form, closing statement |
| `/manifesto` | All proposals in full, filterable by theme |
| `/updates` | Campaign bulletin with category filters and progressive pagination (`?show=`) |
| `/updates/[slug]` | Update detail: Markdown body, gallery, related proposal, copy-link sharing |
| `/events` | Upcoming and past events, with cancelled/postponed states |
| `/privacy` | Privacy notice |
| `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | SEO and sharing, generated from live content |
| `/api/feedback` | Validated, rate-limited Student Voice submissions |
| `/api/cron/publish-scheduled` | Secret-protected scheduled-publishing endpoint |

### Admin (`/admin`)

Sign-in at `/admin/login`. Modules: **Overview**, **Updates** (with draft /
schedule / publish / archive, Markdown editor with live preview, gallery, cover
images), **Manifesto**, **Vision pillars**, **Events**, **Progress board**,
**Candidate profile**, **Website settings**, **Student Voice inbox**, plus an
append-only activity log.

---

## 1a. Current deployment

| | |
| --- | --- |
| Public site | <https://suyash-pandey-campaign.vercel.app> |
| Admin | <https://suyash-pandey-campaign.vercel.app/admin/login> |
| Vercel project | `suyash-pandey-campaign` (`prj_rQ41tP0sEq5pSUCBoNO2XK23rA6L`) |
| Supabase project | `niat-campaign` · `pdoozdcraehqiqqxffdi` · `ap-south-1` |
| Scheduled job | `/api/cron/publish-scheduled`, daily 00:05 UTC |

> **Note on URLs.** The team has Vercel Authentication enabled for all
> deployment URLs except custom domains, so the per-deployment hostnames
> (`…-<hash>-…vercel.app`) show a Vercel login page. The project's stable
> domain `suyash-pandey-campaign.vercel.app` serves the site normally.
> If you attach a custom domain it is exempt from that protection
> automatically. To make every URL public instead, go to
> **Project → Settings → Deployment Protection → Vercel Authentication →
> Disable**.

## 2. Getting started locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see §4)
npm run dev                  # http://localhost:3000
```

Useful scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run test        # 19 unit tests for validation, Markdown, timezones, events
npm run build       # production build
npm run check       # typecheck + tests + build
```

---

## 3. Database

Schema lives in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
initial campaign content in [`supabase/seed.sql`](supabase/seed.sql).

Apply in the Supabase SQL editor (or `supabase db push`), in order:

1. `0001_init.sql` — tables, indexes, triggers, RLS policies, storage bucket,
   and the `publish_scheduled_updates()` routine.
2. `seed.sql` — the six proposals, six vision pillars, six progress entries,
   three launch updates and two clearly-labelled draft events.

### Tables

`admin_users`, `update_posts`, `manifesto_items`, `vision_pillars`, `events`,
`progress_items`, `feedback_submissions`, `site_settings`, `audit_log`, plus the
`public_updates` read view.

`public_updates` is a `security_invoker` view that applies the publication-time
rule once, so the site never has to remember it: an update is visible when it is
**published** with a past `published_at`, **or scheduled** with a past
`scheduled_for`. A delayed cron run therefore cannot delay publication.

---

## 4. Environment variables

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Safe to expose; RLS does the work |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used by the cron endpoint and feedback rate limiting. Never import into a client component. |
| `CRON_SECRET` | server only | `openssl rand -hex 32`. Vercel Cron sends it as `Authorization: Bearer …` |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin for metadata, OG images and sitemap |
| `NEXT_PUBLIC_SITE_TIMEZONE` | public | Fallback editorial timezone (`Asia/Kolkata`) |
| `FEEDBACK_HASH_SALT` | optional | Salt for the one-way client hash used by the spam guard |

Nothing else is required. No credentials are hardcoded anywhere in the repository.

---

## 5. First administrator

Administrator rights are an explicit allow-list row in `public.admin_users`.
There is **no** self-service path to become an administrator: the table has RLS
enabled with no insert/update/delete policy, so only the service role can write
to it.

1. Create the user in **Supabase → Authentication → Users** (email + password).
   Keep public sign-ups disabled in **Authentication → Providers → Email**.
2. Grant the role:

   ```sql
   insert into public.admin_users (user_id, email, display_name)
   select id, email, 'Suyash Pandey'
   from auth.users
   where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

3. Sign in at `/admin/login`.
4. Change the password immediately from **Admin → Account** (`changePasswordAction`),
   and keep email confirmation enabled so password resets work.

To **revoke** access, delete the row — the user keeps their account but loses all
ability to read or write campaign content.

---

## 6. Scheduled publishing

Two independent mechanisms, deliberately redundant:

1. **Time-based visibility (always on).** The `public_updates` view and the RLS
   policy treat a scheduled post as public once `scheduled_for` has passed. Even
   if no job ever runs, the post appears at exactly the right moment.
2. **Server-side promotion (Vercel Cron).** `GET /api/cron/publish-scheduled`
   calls `publish_scheduled_updates()`, which flips due rows to `published`
   inside a single statement. It is idempotent: it only touches rows still in
   `scheduled`, so repeated or concurrent runs cannot double-publish.

`vercel.json` schedules it daily at 00:05 UTC. **Vercel Hobby limits cron jobs to
one invocation per day**; Pro allows minute-level schedules. If you want statuses
promoted more often on Hobby, point an external scheduler (e.g. cron-job.org) at:

```
https://your-domain.com/api/cron/publish-scheduled
Authorization: Bearer <CRON_SECRET>
```

Calling it more often is purely cosmetic — the public site is already correct.

---

## 7. Security model

Authorisation is enforced by Postgres, not by hiding buttons.

| Layer | Role |
| --- | --- |
| `middleware.ts` | Refreshes the Supabase session for `/admin`, redirects signed-out visitors |
| `requireAdmin()` / `assertAdminForAction()` | Authoritative check on every admin render and every server action |
| **RLS policies** | The real boundary. Every write requires `is_admin()`; public reads are restricted to genuinely public rows |

`is_admin()` is `SECURITY DEFINER`, so the allow-list is never exposed to a
client. `feedback_submissions` and `admin_users` have **no** public read policy,
and feedback inserts go exclusively through the validated server route using the
service role (so a leaked anon key cannot spam the inbox).

Also implemented: server-side Zod validation on every mutation and submission,
HTML-escaping-first Markdown rendering (raw HTML can never execute), magic-byte
image-type sniffing before upload, 8 MB upload cap, MIME allow-list on the
storage bucket, http(s)-only external links with `rel="noopener noreferrer"`,
security headers, noindex + `no-store` on `/admin`, and an append-only audit log.

### Verified by direct SQL policy tests

Run against the live project by impersonating each role and JWT claim set:

| Test | Result |
| --- | --- |
| `anon` sees published updates / manifesto / pillars / progress / settings | 3 / 6 / 6 / 6 / 1 ✅ |
| `anon` sees draft events, feedback, admin allow-list, audit log | 0 / 0 / 0 / 0 ✅ |
| `anon` attempts to deface updates, settings, manifesto statuses | 0 rows changed ✅ |
| Signed-in non-admin: `is_admin()` | `false`, sees only public rows ✅ |
| Admin: `is_admin()` / sees draft events / can update | `true` / 2 / permitted ✅ |
| `publish_scheduled_updates()` run twice | 1 then 0 rows — idempotent ✅ |
| Admin credential hash + email confirmation + identity row | verified ✅ |

### Not claimed

- No third-party penetration test was commissioned.
- Lighthouse scores were **not** measured — no browser was available in the build
  environment. Performance work was done by construction (static-heavy pages,
  variable fonts, `next/image`, no analytics or third-party scripts), not by
  measurement.
- `X-Frame-Options` / `frame-ancestors` are intentionally omitted so the site can
  be embedded in preview panes. Add them on the production domain if you do not
  need embedding:

  ```js
  // next.config.ts → headers()
  { key: "X-Frame-Options", value: "SAMEORIGIN" }
  ```

---

## 8. Deploying to Vercel

1. Push this repository to GitHub.
2. **Vercel → Add New → Project → import the repo.** Framework: Next.js. No build
   overrides needed.
3. Add the environment variables from §4 to **Production** and **Preview**.
4. Deploy. Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy so OG
   images and the sitemap use absolute URLs.
5. The cron entry in `vercel.json` is picked up automatically on the next deploy.

Content is read from the database on every request with `cache: "no-store"`, so
publishing an update needs no rebuild and no redeploy.

### Backups

Supabase takes daily backups on paid plans. On Free, schedule a periodic logical
dump (`pg_dump` via the connection string) or export the content tables from the
SQL editor. Media lives in the `campaign-media` bucket — mirror it if you keep
large galleries.

---

## 9. Editing the campaign (no code required)

Everything below is editable from `/admin`:

- **Candidate profile** — name, position, slogan, monogram, portrait, biography,
  leadership philosophy, involvement, motivation.
- **Website settings** — page title/description, hero headline and supporting
  text, statement, closing copy, logo, social links, contact details, election
  date, featured announcement, per-section visibility, accent colours, timezone.
- **Updates** — write in Markdown with live preview, save as draft, schedule,
  publish, archive, pin, attach cover images and a gallery, link to a proposal,
  add an external link.
- **Manifesto / Vision pillars / Progress board** — full CRUD, ordering, and
  visibility. Status vocabulary is enforced: Proposed · In Progress · Awaiting
  Approval · Completed · On Hold.
- **Events** — confirmed details only, with cancelled and postponed states and a
  past-event recap field.
- **Student Voice inbox** — read submissions, mark read/replied/archived, keep
  private notes, delete. Submissions are never published.

### Editorial rules baked into the seed content

- Every initiative is **Proposed** (the bulletin is **In Progress** because the
  website itself is its first version).
- No endorsements, approvals, funding, statistics or achievements were invented.
- No events are published by default — the two seeded events are drafts marked
  “Draft —” so nothing unconfirmed can appear publicly.
- No photograph of the candidate is fabricated: until one is uploaded the site
  shows a designed placeholder with the monogram.

---

## 10. Design system

Colour, type and spacing tokens are defined once in `src/app/globals.css` under
`@theme` and consumed as Tailwind utilities.

| Token | Value | Use |
| --- | --- | --- |
| `ivory` | `#FAF8F3` | Page background |
| `paper` | `#FFFFFF` | Alternating panels |
| `lavender` | `#E9E1F4` | Section transitions, closing panel |
| `purple` | `#76639A` | Headings accents, primary buttons, links |
| `plum` | `#443451` | Display type, secondary buttons |
| `champagne` | `#D9BFA0` | Hairlines and small decorative details only |
| `charcoal` | `#28262D` | Body text |
| `muted` | `#77737D` | Secondary text |
| `line` | `#E8E2DA` | Borders |

Type: **Cormorant Garamond** for display (self-hosted, weights 300–600 +
italic), **Inter Variable** for everything else. Both are bundled from npm
(`@fontsource`) so builds never depend on Google Fonts availability.

### Motion

GSAP + ScrollTrigger, in `src/components/motion/MotionLayer.tsx`: staggered hero
line masks, scroll-triggered reveals, clip-path image reveals, gentle parallax
(desktop only), and a scroll-progress bar.

It is strictly progressive enhancement:

- `html.js` is set by an inline script before paint; content is only hidden while
  motion has not initialised.
- `prefers-reduced-motion` disables everything and reveals all content.
- A 3.2 s failsafe, and a `catch` around the GSAP import, add `no-motion` so
  content can never stay invisible if JS fails.

---

## 11. Project structure

```
src/
  app/
    (site)/           public pages (shared nav/footer/motion layout)
    admin/
      (dashboard)/    authenticated modules
      actions.ts      every server action, each admin-guarded
      login/
    api/              feedback + cron endpoints
  components/
    site/             hero, sections, cards, portrait frame
    admin/            form renderer, upload fields, dashboard UI
    motion/           GSAP layer
  lib/
    data.ts           public reads (no-store, graceful fallback)
    admin-data.ts     admin reads (session + RLS)
    supabase/         public / session / service clients
    validation.ts     Zod schemas for every mutation
    time.ts           timezone-correct datetime-local conversion
    markdown.ts       escape-first Markdown renderer
supabase/
  migrations/0001_init.sql
  seed.sql
tests/logic.test.ts
```

---

## 12. Known constraints

- **Serverless hosting cannot reach Supabase from the build sandbox used to
  create this repo**, so the local fallback content in
  `src/lib/content-defaults.ts` is what renders in that environment. It is also
  the reason the public data layer degrades to bundled content instead of an
  error page. In production the database is always used.
- `next/image` optimisation runs on Vercel; on Hobby, keep an eye on the monthly
  image-optimisation quota if galleries grow large.
- The cron frequency limit described in §6.
