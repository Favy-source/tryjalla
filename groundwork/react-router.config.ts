import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src/app",
  ssr: false, // SPA mode — Supabase is the backend, no Node server needed
} satisfies Config;
