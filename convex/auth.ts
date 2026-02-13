import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Convex Auth requires a signing key in certain deployments (server-side JWT).
// Fail fast with a clear message if the private key is missing so deploys are easier to debug.
if (!process.env.JWT_PRIVATE_KEY) {
  throw new Error(
    "Missing environment variable `JWT_PRIVATE_KEY`.\nSet a PEM private key in your Convex deployment's environment (or in your local env for `bunx convex dev`). See CONTRIBUTING.md for generation and placement instructions.",
  );
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
});
