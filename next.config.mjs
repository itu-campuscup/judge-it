/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable strict type checking
    tsconfigPath: "./tsconfig.json",
  },
  // Ensure proper module resolution for TypeScript
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  // Disable static optimization to prevent build issues with Convex hooks
  output: "standalone",
};

export default nextConfig;
