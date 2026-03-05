/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true, // এরর থাকলেও বিল্ড হবে
  },
  eslint: {
    ignoreDuringBuilds: true, // লিন্টিং এরর ইগনোর করবে
  },
};

export default nextConfig;
