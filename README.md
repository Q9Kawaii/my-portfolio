# Yash Dingar | Portfolio

Personal portfolio showcasing my full-stack and security projects.

**Live site:** [yashdingar.space](https://yashdingar.space)

## Built with

- Next.js 16 (App Router), React and TypeScript
- Tailwind CSS 4, React Three Fiber, Framer Motion, d3-force
- Firebase (Auth + Firestore), Vercel Blob, Web3Forms

## Featured work

- **Shine Portal:** academic monitoring portal used by 40+ faculty and 2,500+ students ([shineportal.online](https://www.shineportal.online))
- **TaskMesh:** smart workflow system that assigns client requests by capability and efficiency ([repo](https://github.com/Q9Kawaii/TaskMesh), [demo](https://task-mesh.vercel.app))
- **Company Management Portal:** role-based portal on React and Supabase ([repo](https://github.com/Q9Kawaii/company-management-portal), [demo](https://company-management-portal-five.vercel.app))

## Features

- **Interactive 3D:** a draggable hero object (mouse, touch or arrow keys) and cards that tilt toward the cursor. three.js is lazy-loaded, pauses when off-screen and respects `prefers-reduced-motion`.
- **Intro animation:** about 2.5 s, plays once per session and is skipped for reduced motion. It's pure CSS that starts at first paint; a tiny script handles Skip/Esc. Content renders underneath, so SEO is unaffected.
- **Career knowledge graph:** a d3-force canvas graph built from the same Firestore content (`lib/graph.ts`). Projects, awards and education link to skills through their `tech`/`tags`; extra links come from `portfolioGraphLinks` (Admin → Graph connections). It supports drag, zoom, pan, search, group filters, path tracing and a list view, and is lazy-loaded when scrolled near.
- **Masonry layout** for skills, projects and awards. It is row-major and keeps DOM order, so keyboard and screen-reader order match what you see.
- **Content managed from `/admin`:** profile, social links, CV, projects (featured / hidden / order), skills, experience, education and awards. Saving updates the live site within seconds with no redeploy.
- **Contact form:** each message is emailed via Web3Forms straight from the browser and backed up to Firestore `messages` through `/api/messages` (validated and rate-limited). It counts as sent if either succeeds. You can read, mark and delete messages in Admin → Messages.

## How content flows

```
Admin (/admin/dashboard) ──writes──▶ Firestore  (allowed by firestore.rules for the admin email only)
        │
        └──POST /api/revalidate (Firebase ID token verified on the server) ──▶ revalidatePath("/")

Public page (server component) ──reads──▶ Firestore REST API ──▶ ISR page (revalidate 10 min + on demand)
```

Until the admin clicks **Import defaults** once, the site renders the built-in content in `lib/defaults.ts`.

| Firestore path | Content |
| --- | --- |
| `portfolio/settings` | Name, headline, bio, stats, email, phone + `showPhone`, CV URL, social links |
| `portfolioProjects` | Projects (`featured`, `hidden`, `order`, `isPrivate`, …) |
| `portfolioSkills` | Skill groups |
| `portfolioExperience` / `portfolioEducation` | Timeline |
| `portfolioAwards` | Awards & certificates (`kind`, `tags` for the graph) |
| `portfolioGraphLinks` | Manual knowledge-graph connections (`source`, `target`, `label`) |
| `portfolioPrivate` | Admin-only (e.g. the phone number while hidden) |
| `messages` | Contact-form backups; server writes only, admin reads |

Uploaded images and CVs go to **Vercel Blob** through `/api/upload`, which verifies the admin's Firebase ID token, accepts PNG/JPEG/WebP/AVIF/GIF/PDF up to 4 MB (no SVG), and stores public blobs.

## Security

- `firestore.rules`: public read on portfolio collections only; writes require the admin email with `email_verified`; everything else is denied.
- Admin API routes (`/api/revalidate`, `/api/upload`, `PATCH`/`DELETE /api/messages`) verify Firebase ID tokens against Google's JWKS (`lib/admin-auth.ts`) and check the admin allowlist.
- The admin UI gate is cosmetic. Rules and server checks are the real protection.
- `/admin` is `noindex`, can't be framed, and is excluded in `robots.txt`.

## Run locally

```bash
git clone https://github.com/Q9Kawaii/my-portfolio.git
cd my-portfolio
npm install
cp .env.example .env.local   # fill in the Web3Forms key, service account and Blob token
npm run dev
```

Open http://localhost:3000.

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client (falls back to the committed public config) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Admin allowlist; keep in sync with `firestore.rules` |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Contact form email (public access key) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Server writes to `messages` (service-account JSON, raw or base64) |
| `BLOB_READ_WRITE_TOKEN` | Admin uploads (created when a Blob store is connected in Vercel) |

## Deploying

1. **Firestore rules:** `firebase deploy --only firestore:rules`
2. **Vercel Blob:** Vercel dashboard → Storage → create a Blob store → connect it to this project, then pull the token locally with `vercel env pull .env.local`.
3. Push to `main`; Vercel builds and deploys.
4. Sign in at `/admin` and click **Import defaults** once.

## Project structure

```
app/
  page.tsx              public site (server component, ISR)
  admin/                login + dashboard (client)
  api/messages          contact backup (POST) + admin mark-read/delete
  api/upload            admin uploads → Vercel Blob
  api/revalidate        admin save → refresh live page
components/site/        Hero, 3D scene, TiltCard, Masonry, sections
components/admin/       Editors and form fields
lib/                    types, defaults, Firestore reader, auth helpers
firestore.rules         Firestore security rules
```

## Contact

- Email: yashdingar17@gmail.com
- LinkedIn: [in/yashdingar](https://www.linkedin.com/in/yashdingar/)
- GitHub: [Q9Kawaii](https://github.com/Q9Kawaii)
