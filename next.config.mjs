/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // বিল্ড করার সময় টাইপ এরর থাকলেও সে এগিয়ে যাবে
    ignoreBuildErrors: true,
  },
  eslint: {
    // বিল্ডের সময় লিন্টিং এরর ইগনোর করবে
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
