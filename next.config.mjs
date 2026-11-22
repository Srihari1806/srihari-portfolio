/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'assets.aceternity.com', 'raw.githubusercontent.com'],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
