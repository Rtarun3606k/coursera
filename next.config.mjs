/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "walkez.blob.core.windows.net",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
