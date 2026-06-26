# Opus AI

### Your Intelligent Workspace for Collaborative Project Management

Opus AI is a full-stack SaaS platform designed to streamline project management, team collaboration, and AI-assisted documentation. Built with a focus on privacy, role-based security, real-time communication, and high performance.

---

## 🚀 Key Features

* **Real-Time Team Chat:** Instant walkie-talkie style communication powered by WebSockets, keeping project members synced without page refreshes.
* **Private AI Workspace:** A dedicated, isolated AI canvas using live streaming for brainstorming, context summarization, and one-click document generation.
* **Role-Based Access Control (RBAC):** Hierarchical permissions allowing Workspace Admins (God Mode) to manage teams across all projects, while Project Admins maintain granular control of their own silos.
* **Collaborative Documentation:** Create, manage, and export AI-generated documents directly within secure project workspaces.
* **Asset Management:** Secure file uploads, previews, and forced-downloads with permission-based access control.
* **Secure Auth:** Enterprise-grade authentication powered by Clerk, supporting Google and Microsoft SSO.

---

## 🛠 Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/) managed via [Prisma ORM](https://www.prisma.io/)
* **Authentication:** [Clerk](https://clerk.com/)
* **Real-Time Infrastructure:** [Pusher](https://pusher.com/) (WebSockets)
* **AI Engine:** [OpenRouter API](https://openrouter.ai/) & [Vercel AI SDK](https://sdk.vercel.ai/) (Live Streaming)
* **File Storage:** [UploadThing](https://uploadthing.com/)

---

## 📦 Getting Started

### Prerequisites

* Node.js 18+
* Postgres database (e.g., Neon, Supabase)
* Clerk Account
* UploadThing API Key
* OpenRouter API Key
* Pusher Account (for WebSockets)

### Installation

1. Clone the repository:
```bash
git clone [https://github.com/shorya1wd/opusAI.git](https://github.com/shorya1wd/opusAI.git)
cd opus-ai

```

2. Install dependencies:

```bash
npm install

```

3. Configure environment variables (`.env`):

```env
# Database
DATABASE_URL=your_postgres_url
DIRECT_URL=your_direct_postgres_url

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key

# Storage
UPLOADTHING_TOKEN=your_token

# AI
OPENROUTER_API_KEY=your_key

# WebSockets (Pusher)
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_public_key
PUSHER_SECRET=your_secret_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap2

```

4. Run database migrations:

```bash
npx prisma db push

```

5. Start the development server:

```bash
npm run dev

```

---

## 🛡️ Security & Roles

Opus AI implements a strict siloed security model:

* **Project Admin:** The creator of the project. Cannot be removed. Manages specific project members and project-level assets.
* **Workspace Admin:** Has global oversight. Capable of entering any project, managing team roles, and ensuring data isn't orphaned if an employee leaves.
* **Member:** Can view and interact with the project, chat with the team, and download assets, but cannot delete files or manage the roster.

---

## 🚢 Deployment (Docker / DigitalOcean)

This application is containerized for deployment on VPS infrastructure.

1. SSH into your server and pull the latest code.
2. Ensure your `.env` file is populated securely on the server.
3. Build and run the container:

```bash
docker compose up -d --build

```

---

## 📄 License

This project is proprietary software for Opus AI.
