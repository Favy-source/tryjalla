import { Outlet } from "react-router";

/**
 * Auth layout — split-screen.
 * LEFT: white panel with logo + form (Outlet)
 * RIGHT: dark panel with architectural blueprint image + testimonial (hidden on mobile)
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT — Form panel ===== */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white lg:px-16 xl:px-24">
        {/* Logo */}
        <div className="mb-12">
          <p className="text-xl font-bold text-brand-near-black tracking-tight leading-none">
            Groundwork
          </p>
          <p className="text-sm font-medium text-brand-mid-grey mt-0.5">by Jalla</p>
        </div>

        {/* Route content */}
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      {/* ===== RIGHT — Blueprint image + testimonial (lg+ only) ===== */}
      <div className="hidden lg:flex lg:flex-1 relative bg-brand-rich-black overflow-hidden">
        {/* Architectural blueprint background — dark floor plan with measurement annotations */}
        <div
          className="absolute inset-0 opacity-20"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%230d0d0d'/%3E%3Cg stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.6'%3E%3Crect x='40' y='40' width='320' height='240'/%3E%3Crect x='40' y='40' width='180' height='120'/%3E%3Crect x='220' y='40' width='140' height='120'/%3E%3Crect x='40' y='160' width='120' height='120'/%3E%3Crect x='160' y='160' width='200' height='120'/%3E%3Cline x1='40' y1='20' x2='360' y2='20'/%3E%3Cline x1='40' y1='16' x2='40' y2='24'/%3E%3Cline x1='360' y1='16' x2='360' y2='24'/%3E%3Cline x1='380' y1='40' x2='380' y2='280'/%3E%3Cline x1='376' y1='40' x2='384' y2='40'/%3E%3Cline x1='376' y1='280' x2='384' y2='280'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "cover",
          }}
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-brand-rich-black/60" aria-hidden="true" />

        {/* Testimonial block */}
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <div className="max-w-md">
            <p
              className="text-6xl font-light text-brand-mid-grey mb-4 leading-none"
              aria-hidden="true"
            >
              "
            </p>
            <blockquote className="text-white text-lg font-light leading-relaxed mb-6">
              Groundwork has become the single source of truth across our
              projects. It keeps our teams aligned, our docs organized, and our
              builds on track.
            </blockquote>
            <footer>
              <p className="text-white font-semibold text-sm">Michael Rivera</p>
              <p className="text-brand-mid-grey text-sm">
                Project Executive, BuildCore
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
