import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler for automatic memoization
  reactCompiler: true,

  // Enable source maps for error tracking in production (disable for faster builds if needed)
  productionBrowserSourceMaps: process.env.ANALYZE === 'true',

  // Optimize output for production
  output: 'standalone',

  // Compress responses (improves load times)
  compress: true,

  // Fix for postgres module in client components
  serverComponentsExternalPackages: ['postgres', '@neondatabase/serverless'],

  // Webpack configuration for Railway deployment
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't try to bundle server-only modules in client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'tls': false,
        'net': false,
        'dns': false,
        'fs': false,
        'path': false,
      };
    }
    return config;
  },

  // Allow remote icons/assets used by PTE data
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgp1.digitaloceanspaces.com",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "pedagogistspte.com" },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Content Security Policy headers


  experimental: {
    // Faster dev restarts for large apps
    turbopackFileSystemCacheForDev: true,
    browserDebugInfoInTerminal: true,

  
  },


  
};

export default nextConfig;
