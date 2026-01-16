/**
 * Configuration management using Bun.secrets for secure credential storage
 * Falls back to environment variables for CI/CD environments
 */

import { secrets } from "bun";

const SECRET_SERVICE = "judge-it";

interface ConvexConfig {
  url: string;
}

interface ClerkConfig {
  publishableKey: string;
  secretKey: string;
}

/**
 * Check if we're running in a CI/CD environment
 */
const isCI = (): boolean => {
  return !!(
    Bun.env.CI ||
    Bun.env.GITHUB_ACTIONS ||
    Bun.env.GITLAB_CI ||
    Bun.env.CIRCLECI ||
    Bun.env.JENKINS_URL ||
    Bun.env.VERCEL
  );
};

/**
 * Get a configuration value from secrets, environment (CI only), or prompt
 * Priority: Bun.secrets (keychain) > Environment Variable (CI only) > Interactive Prompt
 * @param envKey - The environment variable key
 * @param envSuffix - Optional suffix for different environments (e.g., '_PROD')
 */
const getOrPrompt = async (
  envKey: string,
  envSuffix: string = "",
): Promise<string | null> => {
  const storageKey = envKey + envSuffix;

  // Try Bun.secrets for local keychain storage first
  try {
    const stored = await secrets.get({
      service: SECRET_SERVICE,
      name: storageKey,
    });
    if (stored) {
      console.log(`[INFO]\t Loaded ${storageKey} from keychain`);
      return stored;
    }
  } catch (err) {
    console.error(`[ERROR]\t Error accessing secrets for ${storageKey}:`, err);
  }

  // Check environment variables only in CI/CD environments
  if (isCI()) {
    const fromEnv = Bun.env[envKey];
    if (fromEnv) {
      console.log(`[INFO]\t Loaded ${envKey} from environment (CI)`);
      return fromEnv;
    }
  }

  // Interactive prompt (only on TTY)
  if (process.stdin.isTTY) {
    try {
      const displayName = envSuffix ? `${envKey}${envSuffix}` : envKey;
      const entered = prompt(`Enter ${displayName}:`);
      if (entered) {
        try {
          // Save to Bun.secrets for future local runs
          await secrets.set({
            service: SECRET_SERVICE,
            name: storageKey,
            value: entered,
          });
          console.log(`[INFO]\t Saved ${storageKey} to keychain`);
          return entered;
        } catch (err) {
          console.warn(
            `[WARN]\t Could not save ${storageKey} to keychain:`,
            err
          );
          return entered;
        }
      }
    } catch (err) {
      console.error(`[ERROR]\t Error prompting for ${storageKey}:`, err);
    }
  }

  return null;
};

/**
 * Read Convex configuration
 * Returns the configuration or throws if required values are missing
 * @param env - Optional environment suffix (e.g., 'PROD' for production credentials)
 */
export const readConvexConfig = async (env?: string): Promise<ConvexConfig> => {
  const envSuffix = env ? `_${env.toUpperCase()}` : "";
  const url = await getOrPrompt("NEXT_PUBLIC_CONVEX_URL", envSuffix);

  if (!url) {
    throw new Error(
      "Missing required Convex configuration. Please set NEXT_PUBLIC_CONVEX_URL"
    );
  }

  return {
    url,
  };
};

/**
 * Read Clerk configuration
 * Returns the configuration or throws if required values are missing
 * @param env - Optional environment suffix (e.g., 'PROD' for production credentials)
 */
export const readClerkConfig = async (env?: string): Promise<ClerkConfig> => {
  const envSuffix = env ? `_${env.toUpperCase()}` : "";
  const publishableKey = await getOrPrompt(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    envSuffix
  );
  const secretKey = await getOrPrompt("CLERK_SECRET_KEY", envSuffix);

  if (!publishableKey || !secretKey) {
    throw new Error(
      "Missing required Clerk configuration. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY"
    );
  }

  return {
    publishableKey,
    secretKey,
  };
};

/**
 * Read all application configuration (Convex + Clerk)
 */
export const readAppConfig = async (env?: string) => {
  const convex = await readConvexConfig(env);
  const clerk = await readClerkConfig(env);
  return { convex, clerk };
};

/**
 * Clear all stored secrets for this service
 * Useful for testing or resetting configuration
 * @param env - Optional environment suffix (e.g., 'PROD' to clear production credentials)
 */
export const clearStoredSecrets = async (env?: string): Promise<void> => {
  const envSuffix = env ? `_${env.toUpperCase()}` : "";
  try {
    await secrets.delete({
      service: SECRET_SERVICE,
      name: `NEXT_PUBLIC_CONVEX_URL${envSuffix}`,
    });
    await secrets.delete({
      service: SECRET_SERVICE,
      name: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY${envSuffix}`,
    });
    await secrets.delete({
      service: SECRET_SERVICE,
      name: `CLERK_SECRET_KEY${envSuffix}`,
    });
    const envLabel = env ? ` (${env.toUpperCase()})` : "";
    console.log(`✓ Cleared stored secrets${envLabel}`);
  } catch (err) {
    console.error("Error clearing secrets:", err);
  }
};
