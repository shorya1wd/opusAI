import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Moved to the top level!
  allowedDevOrigins: ['*.loca.lt', 'loca.lt'],
  
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // You can remove the experimental block entirely if it's empty now
};

export default nextConfig;