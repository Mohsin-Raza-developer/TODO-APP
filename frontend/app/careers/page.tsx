import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "Careers - Check Mate",
  description: "Join the team building the calm workspace for focused work.",
};

const roles = [
  {
    title: "Product Designer",
    location: "Remote - EMEA",
    type: "Full-time",
  },
  {
    title: "Frontend Engineer",
    location: "Remote - Americas",
    type: "Full-time",
  },
  {
    title: "Customer Experience Lead",
    location: "Remote - Global",
    type: "Full-time",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <main className="flex-grow">
        <section className="relative overflow-hidden">
          <div className="absolute -top-24 left-0 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(20,184,166,0.18),transparent_60%)] blur-3xl pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted-2)]">Careers</p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Build the future of calm productivity
            </h1>
            <p className="mt-6 text-lg text-[color:var(--muted)] max-w-3xl">
              We are a small, thoughtful team obsessed with clarity, motion, and delightful workflows.
              If you love shipping polished experiences, we would love to meet you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Remote-first", "Flexible hours", "Learning budget", "Home office"]
                .map((perk) => (
                  <span
                    key={perk}
                    className="px-4 py-2 rounded-full text-sm border border-[color:var(--border)] bg-[color:var(--surface)]"
                  >
                    {perk}
                  </span>
                ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl sm:text-3xl font-semibold">Open roles</h2>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[color:var(--accent)] text-white font-semibold shadow-soft hover:translate-y-[-1px] transition-all"
              >
                Join the talent list
              </Link>
            </div>
            <div className="mt-6 grid gap-5">
              {roles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{role.title}</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {role.location} • {role.type}
                    </p>
                  </div>
                  <button className="px-5 py-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-sm font-semibold hover:bg-[color:var(--surface)] transition-colors">
                    View details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-10 shadow-soft">
              <h2 className="text-2xl sm:text-3xl font-semibold">Our values</h2>
              <div className="mt-6 grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Craft",
                    copy: "We sweat the details because delight lives there.",
                  },
                  {
                    title: "Kindness",
                    copy: "We build with empathy for teammates and customers.",
                  },
                  {
                    title: "Focus",
                    copy: "We prioritize the work that matters most.",
                  },
                ].map((value) => (
                  <div key={value.title} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">{value.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
