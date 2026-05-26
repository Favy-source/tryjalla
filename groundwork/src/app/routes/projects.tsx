/**
 * /projects — My Projects list page.
 *
 * Day 3: shell with empty state and "New Project" button.
 * Day 5: real project cards loaded from Supabase.
 */
import { Link } from "react-router";
import { FolderPlus, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProjectsPage() {
  const { profile } = useAuth();

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-brand-border-grey bg-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-near-black">My Projects</h1>
          <p className="text-sm text-brand-mid-grey mt-1">
            Track every build from ground to handover.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 rounded-lg bg-brand-near-black px-4 py-2 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New project</span>
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Empty state — replace with real project cards in Day 5 */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-border-grey bg-white mb-4">
            <FolderOpen className="h-7 w-7 text-brand-border-grey" />
          </div>
          <h2 className="text-base font-semibold text-brand-near-black mb-2">
            No projects yet
          </h2>
          <p className="text-sm text-brand-mid-grey max-w-xs mb-6">
            Create your first project to start tracking your construction build
            stage by stage.
          </p>
          <Link
            to="/projects/new"
            className="flex items-center gap-2 rounded-lg bg-brand-near-black px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Create your first project
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-brand-mid-grey">
        Failed to load projects. Please refresh.
      </p>
    </div>
  );
}
