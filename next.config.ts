import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  compiler: {
    removeConsole: {
      exclude: ['error'], git a
    },
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;