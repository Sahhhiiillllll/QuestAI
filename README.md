# QuestAI — AI-Powered Assessment Platform

> **QuestAI** is a full-stack AI assessment platform for schools. It enables school admins, teachers, and students to manage, generate, and attempt AI-generated question papers — all from a single unified web application.

---

## 📸 Overview

| Portal | Role | Key Features |
|---|---|---|
| 🏫 School Admin | School | Dashboard, teacher/student management, reports, leaderboard |
| 👩‍🏫 Teacher | Teacher | Create AI assignments, track submissions, view insights |
| 🎓 Student | Student | Attempt assigned tests, view results |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Vanilla CSS (custom design system in `globals.css`) |
| **State** | [Zustand 5](https://zustand-demo.pmnd.rs/) with `persist` middleware |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **PDF Export** | [jsPDF 4](https://github.com/parallax/jsPDF) |
| **Form Utils** | React Hook Form + Zod |
| **Date Utils** | date-fns |
| **Auth** | localStorage-based demo auth (no external provider) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx            # Root redirect (→ /login or dashboard)
│   │   ├── globals.css         # Full design system & all component styles
│   │   │
│   │   ├── login/              # /login  — unified login page (all roles)
│   │   ├── signup/             # /signup — unified registration page
│   │   │
│   │   ├── (school)/           # Route group: School Admin portal
│   │   │   └── school/
│   │   │       ├── page.tsx          # /school       — School dashboard
│   │   │       ├── teachers/         # /school/teachers
│   │   │       ├── students/         # /school/students
│   │   │       ├── reports/          # /school/reports
│   │   │       └── leaderboard/      # /school/leaderboard
│   │   │
│   │   ├── (teacher)/          # Route group: Teacher portal
│   │   │   └── teacher/
│   │   │       ├── page.tsx          # /teacher      — Assignment list
│   │   │       ├── new/              # /teacher/new  — Create assignment
│   │   │       ├── [id]/             # /teacher/[id] — View assignment + paper
│   │   │       └── insights/[id]/    # /teacher/insights/[id] — Submission stats
│   │   │
│   │   ├── (student)/          # Route group: Student portal
│   │   │   └── student/
│   │   │       ├── page.tsx          # /student      — My tests list
│   │   │       └── attempt/[id]/     # /student/attempt/[id] — Take a test
│   │   │
│   │   └── assignments/        # Legacy assignment routes (teacher flow)
│   │
│   ├── components/             # Shared UI components
│   │   ├── AppShell.tsx        # Sidebar + header layout shell (teacher)
│   │   ├── PortalShell.tsx     # Role-aware sidebar layout (school/student)
│   │   ├── AuthGuard.tsx       # Redirect-if-not-authenticated HOC
│   │   ├── Logo.tsx            # QuestAI logo (SVG + wordmark)
│   │   ├── icons.tsx           # All SVG icon components
│   │   └── auth/
│   │       └── AuthLayout.tsx  # Dark animated login/signup layout + RoleTabs
│   │
│   ├── store/                  # Zustand global state
│   │   ├── authStore.ts        # Auth state, login/signup/logout, localStorage
│   │   ├── assignmentStore.ts  # Assignments CRUD (calls backend API)
│   │   └── submissionStore.ts  # Submissions fetch/submit (calls backend API)
│   │
│   ├── lib/
│   │   ├── pdfExport.ts        # jsPDF-based question paper PDF generator
│   │   └── rolePaths.ts        # Maps UserRole → home route
│   │
│   └── types/                  # Shared TypeScript interfaces
│
├── next.config.ts              # Next.js production config (Vercel-ready)
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
└── .env.example                # Environment variable template
```

---

## 🔐 Authentication & Roles

QuestAI uses **client-side localStorage auth** for the demo. No external auth provider is required.

### Demo Accounts (password: `demo123`)

| Role | Email |
|---|---|
| 🏫 School Admin | `school@dpsbokaro.edu` |
| 👩‍🏫 Teacher | `teacher@dpsbokaro.edu` |
| 🎓 Student | `student@dpsbokaro.edu` |

### How Auth Works
- User credentials are stored in `localStorage` under key `questai_users`
- Session is persisted in `localStorage` under key `questai-auth` via Zustand persist
- `AuthGuard` component redirects unauthenticated users to `/login`
- Role-based routing: each role has its own portal (`/school`, `/teacher`, `/student`)

---

## 🎨 Design System

All styles live in a single **`src/app/globals.css`** file with:

- **Dark animated auth pages** — floating orbs, dot-grid overlay, glassmorphism card
- **Light dashboard** — clean white sidebar + gray content area
- **CSS custom properties** — `--orange`, `--bg-page`, `--border`, `--radius`, etc.
- **Responsive** — mobile bottom nav + collapsible sidebar via CSS media queries
- **Micro-animations** — card entrance (`auth-card-in`), orb float, shimmer button

---

## ⚙️ Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL | `http://localhost:5001` |

> **Note:** Auth, role tabs, and the UI work fully without a backend. Only assignment creation and submission fetching require the backend.

---

## 🖥️ Running Locally

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/questai.git
cd questai/frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL if you have a backend

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build optimised production bundle |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## 🌐 Deploying to Vercel

### Option 1 — Vercel CLI (recommended)

```bash
# From the frontend/ directory
npx vercel login          # Authenticate with your Vercel account (browser)
npx vercel --prod --yes   # Deploy to production
```

When prompted:
- **Project name:** `questai`
- **Root directory:** `./` (press Enter)
- Vercel auto-detects Next.js — no extra config needed

### Option 2 — Vercel Dashboard (Git integration)

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Add environment variable: `NEXT_PUBLIC_API_URL` → your backend URL
6. Click **Deploy**

### Environment Variables on Vercel

In your Vercel project → **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` (or leave blank for demo mode) |

---

## 🗺️ Pages & Routes Reference

| Route | Component | Description |
|---|---|---|
| `/` | `page.tsx` | Auto-redirects based on auth state |
| `/login` | `login/page.tsx` | Unified login (School / Teacher / Student tabs) |
| `/signup` | `signup/page.tsx` | Role-based registration |
| `/school` | `(school)/school/page.tsx` | School admin dashboard with stats |
| `/school/teachers` | School Teachers | List of all teachers in the school |
| `/school/students` | School Students | List of all students in the school |
| `/school/reports` | School Reports | Assignment & test reports |
| `/school/leaderboard` | Leaderboard | Student ranking by score |
| `/teacher` | `(teacher)/teacher/page.tsx` | Teacher's assignment list |
| `/teacher/new` | Teacher New | AI assignment creation wizard |
| `/teacher/[id]` | Teacher Detail | View generated paper, export PDF |
| `/teacher/insights/[id]` | Insights | Per-assignment submission analytics |
| `/student` | `(student)/student/page.tsx` | Student's test list |
| `/student/attempt/[id]` | Attempt | Take a test, submit answers |

---

## 🧩 Key Components

| Component | Path | Purpose |
|---|---|---|
| `AuthLayout` | `components/auth/AuthLayout.tsx` | Dark animated split-screen for login/signup |
| `RoleTabs` | (same file) | School / Teacher / Student tab switcher |
| `PortalShell` | `components/PortalShell.tsx` | Role-aware sidebar + header for all portals |
| `AppShell` | `components/AppShell.tsx` | Teacher-specific app shell with full nav |
| `AuthGuard` | `components/AuthGuard.tsx` | Wraps protected pages, redirects if unauth |
| `Logo` | `components/Logo.tsx` | SVG flame logo + "QuestAI" wordmark |

---

## 📦 Dependencies

### Production

| Package | Version | Use |
|---|---|---|
| `next` | 16.2.6 | Framework |
| `react` / `react-dom` | 19.x | UI |
| `zustand` | 5.x | Global state management |
| `axios` | 1.x | HTTP requests to backend |
| `jspdf` | 4.x | PDF question paper export |
| `date-fns` | 4.x | Date formatting |
| `react-hook-form` | 7.x | Form state management |
| `zod` | 4.x | Schema validation |

### Development

| Package | Use |
|---|---|
| `typescript` | Type checking |
| `tailwindcss` | (Available but using vanilla CSS) |
| `eslint` + `eslint-config-next` | Linting |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © QuestAI Team

---

<div align="center">
  <strong>Built with ❤️ using Next.js + Zustand + Vanilla CSS</strong>
</div>
