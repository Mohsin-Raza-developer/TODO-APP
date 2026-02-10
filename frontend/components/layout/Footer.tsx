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
        <div className="grid grid-cols-1 gap-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted-2)]">
              Experience liftoff
            </p>
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
