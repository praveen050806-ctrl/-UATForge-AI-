# UATForge AI

> **From Business Requirements to Ready-to-Execute UAT**

UATForge AI is an enterprise-grade AI-powered UAT engineering platform that converts business requirements, user stories, and specifications into structured, validated, and editable UAT test suites.

---

## 🌟 Core Product Pipeline

```
Requirement Ingestion
       ↓
Requirement Understanding (AI Extraction)
       ↓
Scenario Generation (Positive, Negative, Boundary, Role-Based)
       ↓
Deterministic Quality Validation
       ↓
Human Review, Editing & Regeneration
       ↓
Bidirectional Traceability & Deliverables Export (Excel, CSV)
```

### Core Engineering Principle
> **AI generates. Validation checks. Human approves.**

---

## 🏗️ Architecture & Module Structure

```
src/
├── app/
│   ├── page.tsx               # Enterprise landing & product entry
│   ├── layout.tsx             # Root layout with Geist font & metadata
│   ├── globals.css            # Dark enterprise design system & theme variables
│   ├── dashboard/             # Executive coverage & KPI dashboard
│   ├── requirements/          # Requirement ingestion workspace
│   ├── test-suites/           # Multi-archetype test suites & drill-down
│   ├── validation/            # Automated quality validation & integrity gate
│   ├── traceability/          # Bidirectional requirement-to-case matrix
│   ├── exports/               # Formatted Excel (.xlsx) & CSV export studio
│   └── api/
│       └── health/            # System status & readiness endpoint
│
├── components/
│   ├── layout/                # Sidebar, Header, AppShell, PageHeader
│   ├── ui/                    # Reusable StatusBadge, ScenarioBadge, KpiCard, etc.
│   ├── dashboard/             # Metric cards, coverage charts, recent items
│   ├── requirements/          # Workspace forms, input selectors, intelligence preview
│   ├── test-suites/           # Filterable test case tables & step inspection modal
│   ├── validation/            # Categorized quality inspection cards
│   └── traceability/          # Flow topology and relationship matrix
│
├── lib/
│   ├── ai/                    # Gemini AI service abstraction (Deferred to M2)
│   ├── db/                    # MongoDB connection abstraction (Deferred to M2)
│   ├── validation/            # Zod validation schemas for domain models
│   ├── export/                # Excel & CSV generation abstractions
│   └── utils.ts               # Standard styling utilities (clsx + tailwind-merge)
│
└── types/                     # Extensible TypeScript domain model definitions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation
```bash
# Clone the repository
git clone https://github.com/praveen050806-ctrl/-UATForge-AI-.git
cd -UATForge-AI-

# Install dependencies
npm install
```

### Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Verification
```bash
# Type check & build
npm run build

# Lint verification
npm run lint
```

---

## 🔒 Security & Secrets Hygiene
- No secrets or credentials are hard-coded in this repository.
- `.env*` files are strictly excluded via `.gitignore`.
- Reference configuration is documented in [`.env.example`](.env.example).

---

## 📌 Milestone Status

- **Milestone 1A**: Next.js TypeScript foundation, build system & git configuration. *(Completed)*
- **Milestone 1B**: Enterprise SaaS application shell, navigation, routes, reusable UI components, and architectural abstractions. *(Completed)*
- **Milestone 2**: Gemini API integration for requirement understanding & scenario synthesis. *(Upcoming)*
- **Milestone 3**: MongoDB persistence & dynamic CRUD for suites. *(Upcoming)*
