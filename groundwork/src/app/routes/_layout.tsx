import { Outlet } from "react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";

/**
 * Root layout — authenticated shell.
 * Wraps all client-facing pages with the sidebar and auth gate.
 */
export default function RootLayout() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-brand-light-grey">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
