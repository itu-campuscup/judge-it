#!/usr/bin/env bun
/**
 * Judge-It Development CLI
 * Handles configuration and development workflows using Bun native APIs.
 *
 * Environments (mutually exclusive):
 *   (default)  — local development credentials
 *   --prod     — production deployment credentials
 *   --stage    — staging deployment credentials
 */

import { readAppConfig, clearStoredSecrets } from "./src/config";
import { secrets } from "bun";

const SECRET_SERVICE = "judge-it";
const KEYS = ["NEXT_PUBLIC_CONVEX_URL"] as const;

/** Supported environment flags. */
const ENV_FLAGS = ["--prod", "--stage"] as const;
type EnvFlag = (typeof ENV_FLAGS)[number];

// ── Parse CLI arguments ────────────────────────────────────────────────
const args = Bun.argv.slice(2);

const envFlag = args.find((arg): arg is EnvFlag =>
  ENV_FLAGS.includes(arg as EnvFlag),
);

/** Uppercase environment label used as keychain suffix (e.g. "PROD", "STAGE"). */
const env: string | undefined =
  envFlag === "--prod" ? "PROD" : envFlag === "--stage" ? "STAGE" : undefined;

/** The CLI sub-command (first non-flag argument). */
const command = args.find((arg) => !arg.startsWith("--"));

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Extract the Convex deployment id from a Convex URL.
 * e.g. "https://astute-porpoise-689.convex.cloud" → "astute-porpoise-689"
 */
function extractDeploymentId(convexUrl: string): string | null {
  try {
    return new URL(convexUrl).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Spawn a child process using Bun.spawn, inherit stdio, and await its exit.
 * Returns the exit code.
 */
async function run(cmd: string[]): Promise<number> {
  const proc = Bun.spawn(cmd, {
    stdio: ["inherit", "inherit", "inherit"],
    env: Bun.env,
  });
  return await proc.exited;
}

// ── Commands ───────────────────────────────────────────────────────────

async function dev() {
  const envLabel = env ? ` [${env}]` : "";
  try {
    console.log(`[INFO]\t Loading credentials${envLabel}...\n`);
    const config = await readAppConfig(env);
    Bun.env.NEXT_PUBLIC_CONVEX_URL = config.convex.url;

    console.log("[INFO]\t Starting Next.js development server...\n");
    const code = await run(["bun", "next", "dev"]);
    process.exit(code);
  } catch (error) {
    console.error("[ERROR]\t Failed to start:", error);
    console.error(
      "[INFO]\t Credentials will be prompted on next run if needed.",
    );
    process.exit(1);
  }
}

async function build() {
  const envLabel = env ? ` [${env}]` : "";
  try {
    console.log(`[INFO]\t Loading credentials${envLabel}...\n`);
    const config = await readAppConfig(env);
    Bun.env.NEXT_PUBLIC_CONVEX_URL = config.convex.url;

    console.log("[INFO]\t Building Next.js application...\n");
    const code = await run(["bun", "next", "build"]);
    if (code === 0) console.log("\n[INFO]\t Build completed successfully!");
    else console.error("\n[ERROR]\t Build failed");
    process.exit(code);
  } catch (error) {
    console.error("[ERROR]\t Build failed:", error);
    process.exit(1);
  }
}

async function viewSecrets() {
  const envSuffix = env ? `_${env}` : "";
  const envLabel = env ? ` [${env}]` : "";
  console.log(`[INFO]\t Stored credentials${envLabel}:`);

  for (const key of KEYS) {
    const storageKey = key + envSuffix;
    try {
      const value = await secrets.get({
        service: SECRET_SERVICE,
        name: storageKey,
      });
      if (value) {
        const masked =
          value.substring(0, 10) + "..." + value.substring(value.length - 4);
        console.log(`[INFO]\t ${storageKey}: ${masked}`);
      } else {
        console.error(`[ERROR]\t ${storageKey}: Not found`);
      }
    } catch {
      console.error(`[ERROR]\t ${storageKey}: Not found`);
    }
  }
}

async function clearSecrets() {
  const envLabel = env ? ` [${env}]` : "";
  console.log(`[INFO]\t Clearing stored secrets${envLabel}...`);
  await clearStoredSecrets(env);
}

/**
 * Initialize the Convex environment by running `bunx convex dev`.
 * This sets up the local Convex deployment and generates necessary files.
 */
async function init() {
  try {
    console.log(
      "[INFO]\t Initializing Convex environment with 'bunx convex dev'...",
    );
    console.log(
      "[INFO]\t (This will create/connect to a Convex project and generate types)",
    );
    console.log("[INFO]\t Press Ctrl+C when the dev server is running.\n");

    const code = await run(["bunx", "convex", "dev"]);
    if (code === 0) {
      console.log("\n[INFO]\t Convex environment initialized successfully!");
      console.log(
        "[INFO]\t You can now run 'bun dev' to start your application.",
      );
    }
    process.exit(code);
  } catch (error) {
    console.error("[ERROR]\t Failed to initialize Convex:", error);
    process.exit(1);
  }
}

/**
 * Run the `@convex-dev/auth` CLI against dev, stage, or prod deployment.
 *
 * Flag mapping:
 *   --prod   → forwards `--prod` to @convex-dev/auth
 *   --stage  → resolves to `--deployment-name <id>` (extracted from the stage Convex URL)
 *   (none)   → targets the default local dev deployment
 *
 * Usage: `bun cli.ts auth:run [--prod|--stage] [<auth-cli-args>...]`
 */
async function authRun() {
  const envLabel = env ? ` [${env}]` : "";
  try {
    console.log(`[INFO]\t Preparing environment for auth CLI${envLabel}...`);
    const config = await readAppConfig(env);
    Bun.env.NEXT_PUBLIC_CONVEX_URL = config.convex.url;

    // Auto-set CONVEX_DEPLOYMENT from Convex URL for non-dev environments
    if (env && Bun.env.NEXT_PUBLIC_CONVEX_URL) {
      const deployment = extractDeploymentId(Bun.env.NEXT_PUBLIC_CONVEX_URL);
      if (deployment) {
        Bun.env.CONVEX_DEPLOYMENT = deployment;
        console.log(`[INFO]\t Auto-set CONVEX_DEPLOYMENT=${deployment}`);
      } else {
        console.warn(
          "[WARN]\t Could not extract deployment id from NEXT_PUBLIC_CONVEX_URL",
        );
      }
    }

    // Build passthrough: strip our env flags and the command name itself
    const cmdIndex = args.indexOf(command!);
    const passthrough = args
      .slice(cmdIndex + 1)
      .filter((a) => !ENV_FLAGS.includes(a as EnvFlag));

    // Map our env flag → the appropriate @convex-dev/auth flag
    if (env === "PROD") {
      passthrough.unshift("--prod");
    } else if (env === "STAGE") {
      const deployment = extractDeploymentId(Bun.env.NEXT_PUBLIC_CONVEX_URL!);
      if (deployment) {
        passthrough.unshift("--deployment-name", deployment);
      } else {
        console.error(
          "[ERROR]\t Cannot determine deployment name for stage environment",
        );
        process.exit(1);
      }
    }

    console.log(
      `[INFO]\t Running: bunx @convex-dev/auth ${passthrough.join(" ")} (target=${Bun.env.NEXT_PUBLIC_CONVEX_URL})`,
    );

    const code = await run(["bunx", "@convex-dev/auth", ...passthrough]);
    process.exit(code);
  } catch (error) {
    console.error("[ERROR]\t auth:run failed:", error);
    process.exit(1);
  }
}

/**
 * Manage environment variables directly on a Convex deployment.
 * Delegates to `bunx convex env` with the correct deployment flag.
 *
 * Usage: `bun cli.ts env [--prod|--stage] list|get|set|remove [args]`
 */
async function envCmd() {
  const envLabel = env ? ` [${env}]` : "";
  try {
    const cmdIndex = args.indexOf(command!);
    const passthrough = args
      .slice(cmdIndex + 1)
      .filter((a) => !ENV_FLAGS.includes(a as EnvFlag));

    const convexArgs = ["bunx", "convex", "env"];

    if (env === "PROD") {
      convexArgs.push("--prod");
    } else if (env === "STAGE") {
      const config = await readAppConfig(env);
      const deployment = extractDeploymentId(config.convex.url);
      if (deployment) {
        convexArgs.push("--deployment-name", deployment);
      } else {
        console.error(
          "[ERROR]\t Cannot determine deployment name for stage environment",
        );
        process.exit(1);
      }
    }

    convexArgs.push(...passthrough);

    console.log(`[INFO]\t Running: ${convexArgs.join(" ")}${envLabel}`);

    const code = await run(convexArgs);
    process.exit(code);
  } catch (error) {
    console.error("[ERROR]\t env command failed:", error);
    process.exit(1);
  }
}

// ── Dispatch ───────────────────────────────────────────────────────────

switch (command) {
  case "dev":
    await dev();
    break;
  case "build":
    await build();
    break;
  case "auth:run":
    await authRun();
    break;
  case "env":
    await envCmd();
    break;
  case "secrets:view":
    await viewSecrets();
    break;
  case "secrets:clear":
    await clearSecrets();
    break;
  case "init":
    await init();
    break;
  default:
    console.log("Judge-It Development CLI\n");
    console.log("Usage:");
    console.log(
      "  bun cli.ts init                                - Initialize Convex environment (runs bunx convex dev)",
    );
    console.log(
      "  bun cli.ts dev [--prod|--stage]                 - Start dev server (prompts for credentials if needed)",
    );
    console.log(
      "  bun cli.ts build [--prod|--stage]               - Build for production",
    );
    console.log(
      "  bun cli.ts auth:run [--prod|--stage] [args]     - Run `bunx @convex-dev/auth` against target deployment",
    );
    console.log(
      "  bun cli.ts env [--prod|--stage] <subcommand>    - Manage Convex deployment env vars (list/get/set/remove)",
    );
    console.log(
      "  bun cli.ts secrets:view [--prod|--stage]        - View stored credentials (masked)",
    );
    console.log(
      "  bun cli.ts secrets:clear [--prod|--stage]       - Clear stored credentials",
    );
    console.log("\nFlags:");
    console.log(
      "  --prod   Use production credentials (stored separately in keychain)",
    );
    console.log(
      "  --stage  Use staging credentials (stored separately in keychain)",
    );
    console.log("\nEnvironments:");
    console.log(
      "  Credentials are stored under separate keychain keys per environment:",
    );
    console.log("  (default) → NEXT_PUBLIC_CONVEX_URL, JWT_PRIVATE_KEY");
    console.log(
      "  --prod    → NEXT_PUBLIC_CONVEX_URL_PROD, JWT_PRIVATE_KEY_PROD",
    );
    console.log(
      "  --stage   → NEXT_PUBLIC_CONVEX_URL_STAGE, JWT_PRIVATE_KEY_STAGE",
    );
    console.log(
      "\nTip: Use package.json scripts, e.g. 'bun dev --prod', 'bun auth:run --stage'",
    );
    break;
}
