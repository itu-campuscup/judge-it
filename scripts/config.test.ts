import { afterEach, expect, spyOn, test } from "bun:test";
import { secrets } from "bun";
import { readConvexConfig } from "../src/config";

const originalEnv = { ...Bun.env };

afterEach(() => {
  for (const key of Object.keys(Bun.env)) {
    if (!(key in originalEnv)) delete Bun.env[key];
  }
  Object.assign(Bun.env, originalEnv);
});

test("injected configuration wins over a stale local keychain value", async () => {
  for (const key of [
    "CI",
    "GITHUB_ACTIONS",
    "GITLAB_CI",
    "CIRCLECI",
    "JENKINS_URL",
    "VERCEL",
  ]) {
    delete Bun.env[key];
  }
  Bun.env.NEXT_PUBLIC_CONVEX_URL = "https://injected.example.convex.cloud";
  const stored = spyOn(secrets, "get").mockResolvedValue(
    "https://stale.example.convex.cloud",
  );

  try {
    expect(await readConvexConfig()).toEqual({
      url: Bun.env.NEXT_PUBLIC_CONVEX_URL,
    });
    expect(stored).not.toHaveBeenCalled();
  } finally {
    stored.mockRestore();
  }
});

test("CI with missing configuration never reads the keychain", async () => {
  Bun.env.CI = "1";
  delete Bun.env.NEXT_PUBLIC_CONVEX_URL;
  const stored = spyOn(secrets, "get").mockRejectedValue(
    new Error("must not access keychain"),
  );

  try {
    await expect(readConvexConfig()).rejects.toThrow(
      "Missing required Convex configuration",
    );
    expect(stored).not.toHaveBeenCalled();
  } finally {
    stored.mockRestore();
  }
});

test("local keychain remains a fallback when no environment value exists", async () => {
  for (const key of [
    "CI",
    "GITHUB_ACTIONS",
    "GITLAB_CI",
    "CIRCLECI",
    "JENKINS_URL",
    "VERCEL",
  ]) {
    delete Bun.env[key];
  }
  delete Bun.env.NEXT_PUBLIC_CONVEX_URL;
  delete Bun.env.NEXT_PUBLIC_CONVEX_URL_STAGE;
  const stored = spyOn(secrets, "get").mockResolvedValue(
    "https://stage.example.convex.cloud",
  );

  try {
    expect(await readConvexConfig("STAGE")).toEqual({
      url: "https://stage.example.convex.cloud",
    });
    expect(stored).toHaveBeenCalledWith({
      service: "judge-it",
      name: "NEXT_PUBLIC_CONVEX_URL_STAGE",
    });
  } finally {
    stored.mockRestore();
  }
});

for (const env of ["PROD", "STAGE"]) {
  test(`${env} ignores the unsuffixed development environment`, async () => {
    for (const key of [
      "CI",
      "GITHUB_ACTIONS",
      "GITLAB_CI",
      "CIRCLECI",
      "JENKINS_URL",
      "VERCEL",
    ]) {
      delete Bun.env[key];
    }
    Bun.env.NEXT_PUBLIC_CONVEX_URL = "https://development.example.convex.cloud";
    delete Bun.env[`NEXT_PUBLIC_CONVEX_URL_${env}`];
    const stored = spyOn(secrets, "get").mockResolvedValue(
      "https://target.example.convex.cloud",
    );

    try {
      expect(await readConvexConfig(env)).toEqual({
        url: "https://target.example.convex.cloud",
      });
      expect(stored).toHaveBeenCalledWith({
        service: "judge-it",
        name: `NEXT_PUBLIC_CONVEX_URL_${env}`,
      });
    } finally {
      stored.mockRestore();
    }
  });

  test(`${env} uses its own injected environment value`, async () => {
    Bun.env.CI = "1";
    Bun.env.NEXT_PUBLIC_CONVEX_URL = "https://development.example.convex.cloud";
    Bun.env[`NEXT_PUBLIC_CONVEX_URL_${env}`] =
      "https://target.example.convex.cloud";
    const stored = spyOn(secrets, "get").mockRejectedValue(
      new Error("must not access keychain"),
    );

    try {
      expect(await readConvexConfig(env)).toEqual({
        url: "https://target.example.convex.cloud",
      });
      expect(stored).not.toHaveBeenCalled();
    } finally {
      stored.mockRestore();
    }
  });
}

for (const env of [undefined, "PROD", "STAGE"]) {
  test(`missing ${env ?? "development"} configuration names the correct variable`, async () => {
    Bun.env.CI = "1";
    const key = `NEXT_PUBLIC_CONVEX_URL${env ? `_${env}` : ""}`;
    delete Bun.env[key];
    await expect(readConvexConfig(env)).rejects.toThrow(
      `Missing required Convex configuration. Please set ${key}.`,
    );
  });
}
