import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Auth layout — split screen (no sidebar, no auth gate)
  layout("routes/_auth-layout.tsx", [
    route("auth/login", "routes/auth/login.tsx"),
    route("auth/signup", "routes/auth/signup.tsx"),
    route("auth/reset-password", "routes/auth/reset-password.tsx"),
    route("auth/callback", "routes/auth/callback.tsx"),
  ]),

  // Root layout — sidebar + auth gate
  layout("routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    route("projects", "routes/projects.tsx"),
    route("projects/new", "routes/projects.new.tsx"),
    route("projects/:projectId", "routes/projects.$projectId.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
