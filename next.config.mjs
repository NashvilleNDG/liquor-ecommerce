/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.openfoodfacts.org",
        pathname: "/images/products/**",
      },
      {
        protocol: "https",
        hostname: "cityhive-prod-cdn.cityhive.net",
      },
      {
        protocol: "https",
        hostname: "cityhive-production-cdn.cityhive.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
