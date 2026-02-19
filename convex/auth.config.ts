import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL || "default-site-url",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
