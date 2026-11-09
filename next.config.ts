import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the whole demo runs in the browser, with a mock API in lib/api.ts.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
