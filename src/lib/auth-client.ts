import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: "http://localhost:5123",
  // redirectURI: "http://localhost:3030",
  basePath: "/auth",
});
