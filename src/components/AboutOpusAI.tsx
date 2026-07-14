"use client";

import { useEffect, useRef, useState } from "react";

// ─── Tech Stack Data ────────────────────────────────────────────────────────
const techStack = [
  {
    category: "Framework",
    icon: "▲",
    items: ["Next.js 16", "React 19", "TypeScript 5"],
    color: "from-slate-500 to-slate-700",
    accent: "#94a3b8",
  },
  {
    category: "AI & Models",
    icon: "✦",
    items: ["Vercel AI SDK", "Google Gemini", "Groq / OpenRouter"],
    color: "from-violet-500 to-purple-700",
    accent: "#a78bfa",
  },
  {
    category: "Auth",
    icon: "🔐",
    items: ["Clerk Auth", "SSO & OAuth", "JWT Sessions"],
    color: "from-sky-500 to-blue-700",
    accent: "#38bdf8",
  },
  {
    category: "Database",
    icon: "🗄️",
    items: ["Prisma ORM", "PostgreSQL", "Prisma Adapter"],
    color: "from-emerald-500 to-green-700",
    accent: "#34d399",
  },
  {
    category: "Real-time",
    icon: "⚡",
    items: ["Pusher WebSockets", "Live Collaboration", "Event Streams"],
    color: "from-amber-500 to-yellow-600",
    accent: "#fbbf24",
  },
  {
    category: "UI & Styling",
    icon: "🎨",
    items: ["Tailwind CSS v4", "shadcn/ui", "Radix UI"],
    color: "from-rose-500 to-pink-700",
    accent: "#fb7185",
  },
  {
    category: "File Uploads",
    icon: "📁",
    items: ["UploadThing", "Serverless Storage", "Type-safe Router"],
    color: "from-orange-500 to-red-600",
    accent: "#fb923c",
  },
  {
    category: "Deployment",
    icon: "🚀",
    items: ["Docker", "CI / CD Ready", "Vercel-compatible"],
    color: "from-indigo-500 to-blue-700",
    accent: "#818cf8",
  },
];

// ─── Feature Data ────────────────────────────────────────────────────────────
const features = [
  {
    icon: "🤖",
    title: "AI-Powered Chat",
    desc: "Every project has a built-in AI chat powered by OpenRouter — giving the team access to capable AI models to brainstorm, write, debug, and think through problems together.",
  },
  {
    icon: "✨",
    title: "Streaming AI Responses",
    desc: "AI replies stream in token-by-token in real time — you see the response as it is being generated, not after it is fully done. Powered by the Vercel AI SDK streaming pipeline.",
  },
  {
    icon: "📋",
    title: "Project & Document Management",
    desc: "Create projects, write and store documents, upload assets, and keep everything organized — all inside one workspace your whole team can access.",
  },
  {
    icon: "👥",
    title: "Real-Time Team Chat",
    desc: "Built-in team messaging powered by Pusher WebSockets. Messages appear instantly for every team member — no polling, no delays, no refresh needed.",
  },
  {
    icon: "🔒",
    title: "Auth via Clerk",
    desc: "Sign-in, sign-up, SSO, and session management are all handled by Clerk. Secure by default, with support for social login and email/password out of the box.",
  },
  {
    icon: "🎯",
    title: "Project-Aware AI Context",
    desc: "The AI assistant knows your project — its name, team members, documents, and assets — so it can give you answers that are actually relevant to what you are working on.",
  },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1400;
          const step = Math.ceil(target / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AboutOpusAI() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* ── Styles injected inline so they work without extra CSS file ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-2deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float2 8s ease-in-out infinite 1s; }
        .float-3 { animation: float 7s ease-in-out infinite 2s; }
        .fade-up { animation: fade-up 0.7s ease forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #a78bfa, #38bdf8, #fb7185, #a78bfa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, rgba(167,139,250,0.08), rgba(56,189,248,0.08));
        }
        .gradient-border::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, #a78bfa40, #38bdf840, #fb718540);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(167,139,250,0.12);
        }
        .spin-slow { animation: spin-slow 20s linear infinite; }
        .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        .gradient-animate {
          background: linear-gradient(-45deg, #6d28d9, #0ea5e9, #ec4899, #7c3aed);
          background-size: 400% 400%;
          animation: gradient-x 6s ease infinite;
        }
        .cursor-blink { animation: blink 1s step-end infinite; }
        .section-gap { margin-top: 100px; }
        .tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          background: rgba(167,139,250,0.12);
          border: 1px solid rgba(167,139,250,0.3);
          color: #a78bfa;
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] px-6 pt-20 pb-16 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div
          className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }}
        />

        {/* Floating orbs */}
        <div className="float-1 absolute top-20 left-[8%] w-4 h-4 rounded-full bg-violet-400/50 blur-sm" />
        <div className="float-2 absolute top-40 right-[10%] w-6 h-6 rounded-full bg-sky-400/40 blur-sm" />
        <div className="float-3 absolute bottom-24 left-[15%] w-3 h-3 rounded-full bg-pink-400/50 blur-sm" />
        <div className="float-1 absolute bottom-16 right-[20%] w-5 h-5 rounded-full bg-emerald-400/40 blur-sm" />

        {/* Tag */}
        <div className="tag-badge mb-6 fade-up">
          <span>✦</span> About Opus AI
        </div>

        {/* Logo + Title */}
        <div className="relative mb-4 fade-up">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div
              className="absolute inset-0 rounded-2xl spin-slow opacity-60"
              style={{
                background:
                  "conic-gradient(from 0deg, #7c3aed, #0ea5e9, #ec4899, #7c3aed)",
                borderRadius: "18px",
              }}
            />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-neutral-50 dark:bg-neutral-950 text-2xl font-black">
              ◆
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-4 fade-up">
          <span className="shimmer-text">Opus AI</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed fade-up">
          An AI-powered project management platform where intelligent automation
          meets real-time team collaboration — built to help teams move faster,
          think smarter, and ship more.
        </p>

        {/* Built by — prominent, in the hero where everyone sees it */}
        <a
          href="https://shoryabhushan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="fade-up inline-flex items-center gap-3 mt-6 px-5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm hover:border-violet-400/60 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full gradient-animate flex items-center justify-center text-xs font-black text-white shrink-0">
            S
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Built by{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Shorya Bhushan
            </span>
          </span>
          <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Stats row — real data from Lighthouse audit on opusai.online */}
        <div className="flex flex-wrap justify-center gap-10 mt-14 fade-up">
          <div className="text-center">
            <div className="text-4xl font-black shimmer-text">0.7s</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
              Page Load (LCP)
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black shimmer-text">
              <Counter target={99} suffix="/100" />
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
              Lighthouse Score
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black shimmer-text">
              <Counter target={32000} suffix="+" />
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
              Lines of Code
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black shimmer-text">
              <Counter target={100} suffix="%" />
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
              TypeScript
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IT DOES ─────────────────────────────────────────────────── */}
      <section className="section-gap px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag-badge mb-4 inline-flex">
            <span>🎯</span> What Opus AI Does
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Everything your team needs,{" "}
            <span className="shimmer-text">powered by AI</span>
          </h2>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
            Opus AI replaces scattered tools with one intelligent workspace —
            where task management, team chat, and AI assistance all live
            together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="gradient-border card-hover rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-sm"
            >
              <div className="text-3xl mb-4">{feat.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="section-gap px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag-badge mb-4 inline-flex">
            <span>⚙️</span> How It Works
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Under the <span className="shimmer-text">hood</span>
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-sky-500/50 to-pink-500/50 hidden md:block" />

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Sign in securely",
                desc: "Clerk handles auth — OAuth, SSO, or email/password. Sessions are JWT-backed and automatically refreshed.",
                color: "#a78bfa",
              },
              {
                step: "02",
                title: "Create a project & invite your team",
                desc: "Projects are stored in PostgreSQL via Prisma. Invite teammates by email — roles and permissions are scoped per workspace.",
                color: "#38bdf8",
              },
              {
                step: "03",
                title: "Add tasks & collaborate live",
                desc: "Tasks update in real time using Pusher WebSocket channels. Every change is broadcast to all connected team members instantly.",
                color: "#34d399",
              },
              {
                step: "04",
                title: "Ask the AI",
                desc: "The AI sidebar has full context about your project. Ask it to generate tasks, summarize progress, or draft a report — using whichever model you prefer (Gemini, GPT, Groq).",
                color: "#fb7185",
              },
              {
                step: "05",
                title: "Ship faster",
                desc: "Opus AI surfaces bottlenecks, suggests next actions, and keeps your team aligned — so you spend less time on process and more time building.",
                color: "#fbbf24",
              },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-6 md:pl-20 relative">
                {/* Step dot */}
                <div
                  className="absolute left-5 top-3 w-6 h-6 rounded-full border-2 border-neutral-200 dark:border-neutral-700 hidden md:flex items-center justify-center text-[10px] font-black"
                  style={{
                    background: `${item.color}22`,
                    borderColor: item.color,
                    color: item.color,
                  }}
                >
                  {i + 1}
                </div>

                <div className="gradient-border card-hover rounded-2xl p-5 flex-1 bg-white dark:bg-neutral-900 shadow-sm">
                  <div
                    className="text-xs font-black tracking-widest mb-1 opacity-60"
                    style={{ color: item.color }}
                  >
                    STEP {item.step}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────────────────────────────── */}
      <section className="section-gap px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag-badge mb-4 inline-flex">
            <span>🛠️</span> Tech Stack
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Built with the <span className="shimmer-text">best tools</span>
          </h2>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            Every layer of Opus AI is carefully chosen for performance, developer
            experience, and scalability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <div
              key={tech.category}
              className="card-hover rounded-2xl p-5 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-100 dark:border-neutral-800 relative overflow-hidden"
            >
              {/* Background accent */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-xl"
                style={{ background: tech.accent }}
              />

              <div className="text-2xl mb-3">{tech.icon}</div>
              <div
                className="text-xs font-black tracking-widest uppercase mb-3"
                style={{ color: tech.accent }}
              >
                {tech.category}
              </div>
              <ul className="space-y-1.5">
                {tech.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: tech.accent }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUILT BY ────────────────────────────────────────────────────── */}
      <section className="section-gap px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="tag-badge mb-4 inline-flex">
            <span>👤</span> The Builder
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Made with <span className="shimmer-text">obsession</span>
          </h2>
        </div>

        <div className="gradient-border rounded-3xl p-8 md:p-12 bg-white dark:bg-neutral-900 shadow-sm text-center relative overflow-hidden">
          {/* Decorative background */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, #7c3aed, transparent 50%), radial-gradient(circle at 70% 80%, #0ea5e9, transparent 50%)",
            }}
          />

          {/* Avatar */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="pulse-ring absolute w-16 h-16 rounded-full border-2 border-violet-400/40" />
            <div className="w-20 h-20 rounded-full gradient-animate flex items-center justify-center text-3xl font-black text-white shadow-lg">
              S
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold mb-2">
            Shorya Bhushan
          </h3>
          <p className="text-violet-500 dark:text-violet-400 font-semibold mb-4">
            Full-Stack Developer · Builder · Designer
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed mb-8 text-sm md:text-base">
            I built Opus AI because I believe great teams deserve tools that
            actually think. Every line of code, every design decision, every AI
            integration was crafted with one goal — to make complex work feel
            effortless.
          </p>

          {/* Contact links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:shoryabhushan0@gmail.com"
              className="card-hover flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-colors bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 border border-neutral-200 dark:border-neutral-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              shoryabhushan0@gmail.com
            </a>

            <a
              href="https://shoryabhushan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-colors bg-neutral-100 dark:bg-neutral-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 border border-neutral-200 dark:border-neutral-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              shoryabhushan.com
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="section-gap pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-2xl font-black shimmer-text mb-2">Opus AI</div>
          <p className="text-neutral-400 dark:text-neutral-600 text-sm">
            Built with React 19 · Next.js 16 · Powered by frontier AI models
          </p>
          <div className="mt-6 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
          <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-600">
            © {new Date().getFullYear()} Shorya Bhushan · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
