import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy - Check Mate",
  description: "Read how we handle your data and privacy.",
};

const sections = [
  {
    title: "What we collect",
    copy: "We collect account details (name, email), task data you create, and essential usage analytics to improve performance and reliability.",
  },
  {
    title: "How we use data",
    copy: "Your data is used to deliver the service, secure your account, and improve product quality. We do not sell personal data.",
  },
  {
    title: "Security",
    copy: "We use encryption in transit and at rest, role-based access controls, and ongoing monitoring to keep data secure.",
  },
  {
    title: "Your choices",
    copy: "You can export or delete your data at any time from your account settings. Contact support for additional requests.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <main className="flex-grow">
        <section className="relative overflow-hidden">
          <div className="absolute -top-24 right-0 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(245,158,11,0.16),transparent_60%)] blur-3xl pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted-2)]">Privacy</p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Privacy-first by design
            </h1>
            <p className="mt-6 text-lg text-[color:var(--muted)] max-w-3xl">
              We respect your data. This page summarizes how we collect, use, and protect your information.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6">
            {sections.map((item) => (
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
              <h2 className="text-2xl sm:text-3xl font-semibold">Contact</h2>
              <p className="mt-4 text-[color:var(--muted)]">
                Questions about privacy? Reach out to our team and we will respond quickly.
              </p>
              <div className="mt-6 text-sm text-[color:var(--muted)]">
                Email: hassansk032183@gmail.com
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
