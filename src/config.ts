/**
 * Configuration management using Bun.secrets for secure credential storage
 * Falls back to environment variables for CI/CD environments
 */

import { secrets } from "bun";

const SECRET_SERVICE = "judge-it";

interface ConvexConfig {
  url: string;
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
 * @param envSuffix - Optional suffix for different environments (e.g., '_PROD', '_STAGE')
 */
const getOrPrompt = async (
  envKey: string,
  envSuffix: string = "",
): Promise<string | null> => {
  const storageKey = envKey + envSuffix;

  // In CI we must not access the OS keychain — read only from environment
  if (isCI()) {
    const fromEnv = Bun.env[envKey];
    if (fromEnv) {
      console.log(`[INFO]\t Loaded ${envKey} from environment (CI)`);
      return fromEnv;
    }
    return null;
  }

  // Local/dev flow: try Bun.secrets for keychain storage first
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
        } catch (saveErr) {
          console.error(
            `[WARN]\t Could not save ${storageKey} to keychain:`,
            saveErr,
          );
          return entered;
        }
      }
    } catch (promptErr) {
      console.error(`[ERROR]\t Prompt failed for ${storageKey}:`, promptErr);
    }
  }

  return null;
};

/**
 * Read Convex configuration
 * Returns the configuration or throws if required values are missing
 * @param env - Optional environment suffix (e.g., 'PROD' for production, 'STAGE' for staging)
 */
export const readConvexConfig = async (env?: string): Promise<ConvexConfig> => {
  const envSuffix = env ? `_${env.toUpperCase()}` : "";
  const url = await getOrPrompt("NEXT_PUBLIC_CONVEX_URL", envSuffix);

  if (!url) {
    throw new Error(
      "Missing required Convex configuration. Please set NEXT_PUBLIC_CONVEX_URL",
    );
  }

  return {
    url,
  };
};

/**
 * Read all application configuration (Convex URL).
 * JWT_PRIVATE_KEY is managed on the Convex deployment (via `bun auth:run`), not locally.
 * @param env - Optional environment suffix (e.g., 'PROD' for production, 'STAGE' for staging)
 */
export const readAppConfig = async (env?: string) => {
  const convex = await readConvexConfig(env);
  return { convex };
};

/**
 * Clear all stored secrets for this service
 * Useful for testing or resetting configuration
 * @param env - Optional environment suffix (e.g., 'PROD' to clear production, 'STAGE' for staging)
 */
export const clearStoredSecrets = async (env?: string): Promise<void> => {
  const envSuffix = env ? `_${env.toUpperCase()}` : "";
  const keysToDelete = ["NEXT_PUBLIC_CONVEX_URL"];
  try {
    for (const key of keysToDelete) {
      await secrets.delete({
        service: SECRET_SERVICE,
        name: `${key}${envSuffix}`,
      });
    }
    console.log(
      `[INFO]\t Cleared stored secrets${envSuffix ? ` for ${env}` : ""}`,
    );
  } catch (err) {
    console.error("[ERROR]\t Could not clear secrets:", err);
  }
};
