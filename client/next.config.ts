import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://lifeos-api-qnfy.onrender.com/api/:path*',
      },
    ];
  },
};


export default nextConfig;

