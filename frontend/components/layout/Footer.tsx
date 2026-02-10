/**
 * Footer Component
 *
 * Antigravity-inspired footer with large wordmark and footer image.
 */

"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--background)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted-2)]">
            Experience liftoff
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/in/mohsin-raza-ag01"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-[color:var(--muted-2)] hover:text-[color:var(--foreground)] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20.45 20.45h-3.56v-5.4c0-1.29-.03-2.94-1.79-2.94-1.79 0-2.06 1.4-2.06 2.85v5.49H9.48V9h3.42v1.56h.05c.48-.9 1.65-1.85 3.4-1.85 3.64 0 4.3 2.4 4.3 5.52v6.22zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.27V1.72C24 .77 23.21 0 22.23 0z"
                />
              </svg>
            </Link>
            <Link
              href="https://github.com/Mohsin-Raza-developer/TODO-APP"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-[color:var(--muted-2)] hover:text-[color:var(--foreground)] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.97 0-1.32.47-2.4 1.24-3.24-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.24a11.5 11.5 0 0 1 6 0c2.29-1.56 3.3-1.24 3.3-1.24.66 1.65.24 2.87.12 3.17.77.84 1.24 1.92 1.24 3.24 0 4.64-2.81 5.66-5.49 5.96.43.37.81 1.1.81 2.22 0 1.6-.02 2.9-.02 3.29 0 .32.22.7.83.58C20.56 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="font-display text-[clamp(3rem,12vw,10rem)] leading-none font-normal tracking-[-0.04em] text-[color:var(--foreground)]">
            Check Mate
          </h2>
        </div>

        <div className="mt-8 pt-6 border-t border-[color:var(--border)] flex flex-col gap-4 text-sm text-[color:var(--muted-2)]">
          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/about" className="hover:text-[color:var(--foreground)] transition-colors">
              About
            </Link>
            <Link href="/careers" className="hover:text-[color:var(--foreground)] transition-colors">
              Careers
            </Link>
            <Link href="/privacy" className="hover:text-[color:var(--foreground)] transition-colors">
              Privacy
            </Link>
          </div>
          <span className="w-full text-center">© {currentYear} Check Mate — Created by Mohsin Raza</span>
        </div>
      </div>
    </footer>
  );
}
