/** @type {import('next').NextConfig} */
// Force deploy - Updated for Vercel compatibility
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig