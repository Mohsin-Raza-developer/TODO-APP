import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "About - Check Mate",
  description: "Learn more about Check Mate and our mission.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <main className="flex-grow">
        <section className="relative overflow-hidden">
          <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(14,165,233,0.18),transparent_60%)] blur-3xl pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted-2)]">About</p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Calm tools for focused teams
            </h1>
            <p className="mt-6 text-lg text-[color:var(--muted)] max-w-3xl">
              Check Mate helps teams and individuals turn intention into momentum.
              We combine thoughtful design, clear structure, and modern technology
              to make every day feel lighter and more purposeful.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Clarity",
                copy: "We reduce noise so you can focus on the next right task.",
              },
              {
                title: "Momentum",
                copy: "Small wins compound. We build flows that keep progress visible.",
              },
              {
                title: "Trust",
                copy: "Security, privacy, and reliability are built in from day one.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-soft"
              >
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm text-[color:var(--muted)]">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-10 shadow-soft">
              <h2 className="text-2xl sm:text-3xl font-semibold">Our mission</h2>
              <p className="mt-4 text-[color:var(--muted)]">
                Empower people to do their best work without the clutter. We focus on
                deliberate product design, accessibility, and delightful interactions
                that feel effortless.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Focused", "Human-first", "Privacy-led", "Always improving"].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full text-sm border border-[color:var(--border)] bg-[color:var(--surface)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[color:var(--accent)] text-white font-semibold shadow-soft hover:translate-y-[-1px] transition-all"
                >
                  Start free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
