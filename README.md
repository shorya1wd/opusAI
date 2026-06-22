

# Opus AI

### Your Intelligent Workspace for Collaborative Project Management

Opus AI is a full-stack SaaS platform designed to streamline project management, team collaboration, and AI-assisted documentation. Built with a focus on privacy, role-based security, and high performance.

---

## 🚀 Key Features

* **AI-Assisted Workspace:** Integrated AI chat canvas for brainstorming, summarizing project context, and generating notes.
* **Role-Based Access Control (RBAC):** Hierarchical permissions allowing Workspace Admins to manage teams across all projects, while Project Admins maintain granular control.
* **Collaborative Documentation:** Real-time document creation and management directly within project workspaces.
* **Asset Management:** Secure file uploads and management with permission-based access control.
* **Secure Auth:** Enterprise-grade authentication powered by Clerk, supporting Google and Microsoft SSO.

---

## 🛠 Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/) managed via [Prisma ORM](https://www.prisma.io/)
* **Authentication:** [Clerk](https://clerk.com/)
* **AI Engine:** [OpenRouter API](https://openrouter.ai/) (Dynamic Routing for cost-efficiency)
* **File Storage:** [UploadThing](https://uploadthing.com/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

---

## 📦 Getting Started

### Prerequisites

* Node.js 18+
* Postgres database (e.g., Supabase, Neon)
* Clerk Account
* UploadThing API Key
* OpenRouter API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shorya1wd/opusAI.git
cd opus-ai

```


2. Install dependencies:
```bash
npm install

```


3. Configure environment variables (`.env.local`):
```env
DATABASE_URL=your_postgres_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
UPLOADTHING_TOKEN=your_token
OPENROUTER_API_KEY=your_key

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

Opus AI implements a dual-layer security model:

* **Project Admin:** Manages specific project members and project-level assets.
* **Workspace Admin:** Has global oversight, capable of managing team roles, project access, and cross-workspace assets.

---

## 📄 License

This project is proprietary software for Opus AI.

---

### Pro-Tip for your Deploy

Before you commit this `README.md` to GitHub and push to Vercel, make sure you add a `vercel.json` file in your root directory if you need custom redirects or header configurations.

**Are you ready to run `git push` and hit that deploy button?** If you need help verifying your environment variables in the Vercel dashboard before you go live, just let me know!
