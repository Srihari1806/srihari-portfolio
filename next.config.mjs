/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'assets.aceternity.com', 'raw.githubusercontent.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'a.ltrbxd.com', pathname: '/resized/**' },
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: process.platform === 'win32',
    webpackBuildWorker: process.platform === 'win32' ? false : undefined,
  },
};

export default nextConfig;
