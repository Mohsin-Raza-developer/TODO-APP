import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VerificationPendingPanel } from "@/components/auth/VerificationPendingPanel";
import { EmailVerifiedRedirectCard } from "@/components/auth/EmailVerifiedRedirectCard";

export const metadata: Metadata = {
  title: "Verify Email - Check Mate",
  description: "Verify your account email to unlock protected features",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const redirectTarget =
    resolvedSearchParams?.redirect && resolvedSearchParams.redirect.startsWith("/")
      ? resolvedSearchParams.redirect
      : "/dashboard";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?redirect=/verify-email");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-6">
          {session.user.emailVerified ? (
            <EmailVerifiedRedirectCard redirectPath={redirectTarget} />
          ) : (
            <VerificationPendingPanel
              email={session.user.email}
              redirectPath={redirectTarget}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
