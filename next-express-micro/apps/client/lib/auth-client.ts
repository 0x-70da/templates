import { createAuthClient } from "better-auth/react";

const serverBaseURL = process.env.GATEWAY_URL;

// المتصفح: same-origin (/api/auth/* → Next rewrite → gateway). السيرفر: الـ gateway مباشرة
export const authClient = createAuthClient(
  typeof window === "undefined" && serverBaseURL ? { baseURL: serverBaseURL } : {},
);
