import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/results",
        destination: "/meets#results",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
