/**
 * Dashboard Page
 *
 * Protected page showing user's todos
 *
 * Features:
 * - Server-side session verification
 * - Redirects unauthenticated users to login
 * - Displays todo list, filters, and stats
 * - Dark mode support
 *
 * Route: /dashboard
 * Access: Protected (authenticated users only)
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardClient } from "@/components/todo/DashboardClient";

export const metadata = {
  title: "Dashboard - Todo App",
  description: "Manage your tasks and todos",
};

export default async function DashboardPage() {
  // Server-side session check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  const user = session.user;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardClient
          userId={user.id}
          userName={user.name || user.email?.split("@")[0] || "User"}
        />
      </main>

      <Footer />
    </div>
  );
}
