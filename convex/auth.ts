import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Convex Auth requires a signing key in certain deployments (server-side JWT).
// Warn at module-load time but don't throw — throwing here blocks `npx convex deploy`
// because Convex evaluates modules during push before env vars can be set.
// The key is validated at runtime when auth functions are actually called.
if (!process.env.JWT_PRIVATE_KEY) {
  console.error(
    "[WARN] Missing environment variable `JWT_PRIVATE_KEY`.\n" +
      "Auth functions will fail at runtime until it is set.\n" +
      "See CONTRIBUTING.md for generation and placement instructions.",
  );
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
});
