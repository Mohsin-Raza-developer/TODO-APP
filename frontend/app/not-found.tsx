import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted-2)]">404</p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="mt-4 text-lg text-[color:var(--muted)]">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[color:var(--accent)] text-white font-semibold shadow-soft hover:translate-y-[-1px] transition-all"
            >
              Back to home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] font-semibold hover:bg-[color:var(--surface-2)] transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
