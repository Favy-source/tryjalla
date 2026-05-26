import { Outlet, isRouteErrorResponse, useRouteError } from "react-router";
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
        {/*
          pt-14 on mobile offsets the fixed top bar (h-14).
          lg:pt-0 resets it on desktop where the sidebar is beside the content.
        */}
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}

/**
 * Per-route error boundary — catches uncaught errors inside any
 * authenticated page and surfaces a recoverable message instead of
 * a blank white screen.
 */
export function ErrorBoundary() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText || "Unexpected error"}`
    : error instanceof Error
      ? error.message
      : "An unexpected error occurred";

  return (
    <div className="flex h-screen items-center justify-center bg-brand-light-grey">
      <div className="max-w-md rounded-lg border border-brand-border-grey bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-brand-border-grey">
          <svg
            className="h-6 w-6 text-brand-mid-grey"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-lg font-semibold text-brand-near-black">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-brand-mid-grey">{message}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-md bg-brand-near-black px-4 py-2 text-sm font-medium text-white hover:bg-brand-rich-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
