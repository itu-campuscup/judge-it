#!/usr/bin/env bun
/**
 * Judge-It Development CLI
 * Handles configuration and development workflows with Bun.secrets
 */

import { readAppConfig, clearStoredSecrets } from "./src/config";
import { spawn } from "child_process";
import { secrets } from "bun";

const SECRET_SERVICE = "judge-it";
const KEYS = [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
];

// Parse flags
const args = process.argv.slice(2);
const env = args.includes("--prod") ? "PROD" : undefined;
const command = args.find((arg) => !arg.startsWith("--"));

async function dev() {
  const envLabel = env ? ` [${env}]` : "";
  try {
    console.log(`[INFO]\t Loading credentials${envLabel}...\n`);
    const config = await readAppConfig(env);
    process.env.NEXT_PUBLIC_CONVEX_URL = config.convex.url;
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = config.clerk.publishableKey;
    process.env.CLERK_SECRET_KEY = config.clerk.secretKey;
    console.log("[INFO]\t Starting Next.js development server...\n");
    const nextDev = spawn("bun", ["next", "dev"], {
      stdio: "inherit",
      env: process.env,
    });

    nextDev.on("exit", (code) => process.exit(code || 0));
  } catch (error) {
    console.error("[ERROR]\t Failed to start:", error);
    console.error(
      "[INFO]\t Credentials will be prompted on next run if needed."
    );
    process.exit(1);
  }
}

async function build() {
  const envLabel = env ? ` [${env}]` : "";
  try {
    console.log(`[INFO]\t Loading credentials${envLabel}...\n`);
    const config = await readAppConfig(env);
    process.env.NEXT_PUBLIC_CONVEX_URL = config.convex.url;
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = config.clerk.publishableKey;
    process.env.CLERK_SECRET_KEY = config.clerk.secretKey;
    console.log("[INFO]\t Building Next.js application...\n");
    const nextBuild = spawn("bun", ["next", "build"], {
      stdio: "inherit",
      env: process.env,
    });

    nextBuild.on("exit", (code) => {
      if (code === 0) console.log("\n[INFO]\t Build completed successfully!");
      else console.error("\n[ERROR]\t Build failed");
      process.exit(code || 0);
    });
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

switch (command) {
  case "dev":
    await dev();
    break;
  case "build":
    await build();
    break;
  case "secrets:view":
    await viewSecrets();
    break;
  case "secrets:clear":
    await clearSecrets();
    break;
  default:
    console.log("Judge-It Development CLI\n");
    console.log("Usage:");
    console.log(
      "  bun cli.ts dev [--prod]           - Start dev server (prompts for credentials if needed)"
    );
    console.log("  bun cli.ts build [--prod]         - Build for production");
    console.log(
      "  bun cli.ts secrets:view [--prod]  - View stored credentials"
    );
    console.log("  bun cli.ts secrets:clear [--prod] - Clear credentials");
    console.log("\nFlags:");
    console.log(
      "  --prod  Use production credentials (stored separately from dev)"
    );
    break;
}
