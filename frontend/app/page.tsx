/**
 * Landing Page (Home)
 *
 * Premium, interactive homepage with scroll reveals, rich visuals,
 * and dark/light mode compatibility.
 */

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { AnimatedHeroText } from "@/components/ui/AnimatedHeroText";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "Todo App - Organize Your Tasks",
  description:
    "A modern, intuitive todo application to help you stay organized and productive.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors duration-300">
      <Header />

      <main className="flex-grow relative overflow-hidden">
        <AnimatedBackground />

        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle,rgba(20,184,166,0.2),transparent_60%)] blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(14,165,233,0.25),transparent_60%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.2),transparent_60%)] blur-3xl pointer-events-none" />

        <section className="relative pt-8 pb-20 sm:pt-16 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
              <div>
                <Reveal>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[color:var(--surface-2)] text-[color:var(--muted)] border border-[color:var(--border)] shadow-soft">
                    <span className="w-2 h-2 rounded-full bg-[color:var(--accent)] animate-glow" />
                    New: Focus Sessions + AI summaries
                  </span>
                </Reveal>

                <Reveal delayMs={120}>
                  <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
                    The calm, premium workspace for
                    <span className="text-gradient"> tasks and momentum</span>
                  </h1>
                </Reveal>

                <Reveal delayMs={180}>
                  <div className="mt-3 text-xl sm:text-2xl font-semibold">
                    <AnimatedHeroText />
                  </div>
                </Reveal>

                <Reveal delayMs={220}>
                  <p className="mt-6 text-lg sm:text-xl text-[color:var(--muted)] max-w-2xl">
                    A modern todo experience that blends clarity, focus, and beautiful motion.
                    Organize once, then flow through your day with effortless confidence.
                  </p>
                </Reveal>

                <Reveal delayMs={320}>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/signup"
                      className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[color:var(--accent)] text-white font-semibold shadow-soft hover:translate-y-[-2px] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
                    >
                      Start free
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[color:var(--border)] text-[color:var(--foreground)] font-semibold bg-[color:var(--surface)] hover:bg-[color:var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-2)] focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
                    >
                      See it in action
                    </Link>
                  </div>
                </Reveal>

                <Reveal delayMs={420}>
                  <div className="mt-10 flex flex-wrap gap-6 text-sm text-[color:var(--muted-2)]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[color:var(--accent-2)]" />
                      No credit card needed
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[color:var(--accent)]" />
                      Sync across devices
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[color:var(--accent-3)]" />
                      Built for focus
                    </div>
                  </div>
                </Reveal>
              </div>

              <Reveal delayMs={180}>
                <div className="relative">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[color:var(--accent-2)]/20 blur-3xl animate-glow" />
                  <div className="glass-surface ring-glow rounded-3xl p-6 sm:p-8 shadow-soft">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[color:var(--muted-2)]">Today</p>
                        <h3 className="text-2xl font-semibold">Mon - Focus Sprint</h3>
                      </div>
                      <div className="px-3 py-1 text-xs font-semibold rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                        In progress
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {[
                        "Design the weekly roadmap",
                        "Review pull requests",
                        "Deep work: analytics dashboard",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 hover:translate-x-1 transition-transform"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{item}</p>
                            <p className="text-xs text-[color:var(--muted-2)]">Auto-sorted by priority</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3">
                        <p className="text-xs text-[color:var(--muted-2)]">Focus score</p>
                        <p className="text-lg font-semibold">92%</p>
                        <div className="mt-2 h-2 rounded-full bg-[color:var(--border)] overflow-hidden">
                          <div className="h-full w-[92%] bg-[color:var(--accent)]" />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3">
                        <p className="text-xs text-[color:var(--muted-2)]">Active streak</p>
                        <p className="text-lg font-semibold">14 days</p>
                        <p className="text-xs text-[color:var(--muted-2)] mt-2">Consistency unlocked</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[color:var(--muted-2)]">
                <span className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]">Studio teams</span>
                <span className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]">Product founders</span>
                <span className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]">Remote-first orgs</span>
                <span className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]">Design leaders</span>
                <span className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]">Ops teams</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative py-24 bg-[color:var(--surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-3xl">
                <h2 className="text-3xl sm:text-4xl font-semibold">Designed for clarity, built for flow</h2>
                <p className="mt-4 text-lg text-[color:var(--muted)]">
                  Every interaction is intentional. Gentle motion, smart defaults, and a layout that keeps you in control.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Intelligent prioritization",
                  copy: "Surface what matters most with adaptive sorting and a focus-first agenda.",
                  icon: "M3 7h18M7 11h10M7 15h7M7 19h5",
                },
                {
                  title: "Ambient focus mode",
                  copy: "Dim distractions and enter a serene workspace with built-in timers and soundscapes.",
                  icon: "M12 8v4l3 3",
                },
                {
                  title: "Collaborative boards",
                  copy: "Keep teams aligned with live notes, reactions, and shared project lanes.",
                  icon: "M4 7h16M4 12h16M4 17h10",
                },
                {
                  title: "Automated summaries",
                  copy: "Wrap your day with AI-generated highlights and tomorrow-ready task packs.",
                  icon: "M8 6h13M8 12h13M8 18h8",
                },
                {
                  title: "Seamless sync",
                  copy: "Stay updated across desktop, mobile, and tablet with real-time syncing.",
                  icon: "M4 12a8 8 0 018-8m0 16a8 8 0 100-16",
                },
                {
                  title: "Secure by default",
                  copy: "Data encryption, device-level controls, and privacy-forward architecture.",
                  icon: "M12 11V7a4 4 0 10-8 0v4m2 0h8",
                },
              ].map((item, index) => (
                <Reveal key={item.title} delayMs={index * 90}>
                  <div className="group h-full rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-2)]/60 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-soft">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm text-[color:var(--muted)] leading-relaxed">{item.copy}</p>
                    <div className="mt-6 text-sm font-semibold text-[color:var(--accent)]">Explore feature -&gt;</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-14 items-center">
              <Reveal>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-semibold">A workflow that feels effortless</h2>
                  <p className="mt-4 text-lg text-[color:var(--muted)]">
                    From capture to completion, each step guides you forward with smooth transitions and clarity.
                  </p>
                  <div className="mt-8 space-y-6">
                    {[
                      {
                        title: "Capture in seconds",
                        copy: "Quick add, voice input, and smart templates keep ideas flowing.",
                      },
                      {
                        title: "Organize with intent",
                        copy: "Group by goals, tags, or energy level with automatic suggestions.",
                      },
                      {
                        title: "Finish with focus",
                        copy: "Time-boxed sessions and progress insights keep momentum high.",
                      },
                    ].map((step, index) => (
                      <Reveal key={step.title} delayMs={index * 120}>
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent-2)]/15 text-[color:var(--accent-2)] font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{step.title}</h3>
                            <p className="text-sm text-[color:var(--muted)]">{step.copy}</p>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delayMs={180}>
                <div className="relative">
                  <div className="absolute -top-8 left-10 w-28 h-28 rounded-full bg-[color:var(--accent)]/20 blur-3xl animate-glow" />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="glass-surface rounded-3xl p-6 shadow-soft">
                      <p className="text-sm text-[color:var(--muted-2)]">Weekly balance</p>
                      <h3 className="mt-2 text-2xl font-semibold">78% complete</h3>
                      <div className="mt-4 h-2 rounded-full bg-[color:var(--border)] overflow-hidden">
                        <div className="h-full w-[78%] bg-[color:var(--accent-2)]" />
                      </div>
                      <p className="mt-4 text-sm text-[color:var(--muted)]">
                        Visual progress across projects.
                      </p>
                    </div>
                    <div className="glass-surface rounded-3xl p-6 shadow-soft">
                      <p className="text-sm text-[color:var(--muted-2)]">Next session</p>
                      <h3 className="mt-2 text-2xl font-semibold">2:30 PM</h3>
                      <p className="mt-2 text-sm text-[color:var(--muted)]">
                        Deep work block with curated tasks.
                      </p>
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--accent)]">
                        View agenda
                        <span>-&gt;</span>
                      </div>
                    </div>
                    <div className="sm:col-span-2 glass-surface rounded-3xl p-6 shadow-soft">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[color:var(--muted-2)]">Team velocity</p>
                        <span className="text-xs font-semibold text-[color:var(--accent-3)]">+12% this week</span>
                      </div>
                      <div className="mt-4 grid grid-cols-4 gap-3">
                        {[72, 88, 64, 92].map((value) => (
                          <div key={value} className="flex flex-col items-center gap-2">
                            <div className="h-16 w-5 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
                              <div
                                className="w-full bg-[color:var(--accent)]"
                                style={{ height: `${value}%` }}
                              />
                            </div>
                            <span className="text-xs text-[color:var(--muted)]">{value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative py-24 bg-[color:var(--surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-semibold">Trusted for focused work</h2>
                  <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl">
                    Teams use Check Mate to align on priorities, ship faster, and keep the work calm.
                  </p>
                </div>
                <div className="flex gap-6">
                  {["98%", "120k+", "4.9 / 5"].map((metric, index) => (
                    <div key={metric} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-5 py-4">
                      <p className="text-sm text-[color:var(--muted-2)]">{["Satisfaction", "Tasks completed", "Average rating"][index]}</p>
                      <p className="text-2xl font-semibold mt-1">{metric}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote:
                    "The new focus sessions are exactly what our team needed to stay aligned without meetings.",
                  name: "Priya N.",
                  role: "Product Lead",
                },
                {
                  quote:
                    "The interface is beautiful and calm. It keeps me moving without the usual clutter.",
                  name: "Daniel K.",
                  role: "Designer",
                },
                {
                  quote:
                    "We replaced three tools with Check Mate. The weekly summaries are a game changer.",
                  name: "Lena M.",
                  role: "Ops Manager",
                },
              ].map((item, index) => (
                <Reveal key={item.name} delayMs={index * 120}>
                  <div className="h-full rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-6 shadow-soft">
                    <p className="text-sm text-[color:var(--muted)] leading-relaxed">"{item.quote}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[color:var(--accent)]/20 flex items-center justify-center text-[color:var(--accent)] font-semibold">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-[color:var(--muted-2)]">{item.role}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-[32px] border border-[color:var(--border)] bg-[linear-gradient(120deg,rgba(14,165,233,0.15),rgba(20,184,166,0.12),rgba(245,158,11,0.12))] p-10 sm:p-14 shadow-soft overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl font-semibold">Ready to move with clarity?</h2>
                    <p className="mt-4 text-lg text-[color:var(--muted)]">
                      Start free, invite your team, and watch focus turn into momentum.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[color:var(--foreground)] text-[color:var(--background)] font-semibold hover:opacity-90 transition-opacity"
                    >
                      Create your workspace
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] font-semibold hover:bg-[color:var(--surface-2)] transition-colors"
                    >
                      Book a demo
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
