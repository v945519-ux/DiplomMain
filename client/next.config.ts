import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Anchor dev, build and production tracing to this app, not the parent lockfile.
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_API_URL
        ? [new URL("/media/**", process.env.NEXT_PUBLIC_API_URL)]
        : []),
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
