import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;