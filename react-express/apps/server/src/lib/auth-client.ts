import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.BASE_URL
      : "http://localhost:5000",
  plugins: [adminClient()],
});
