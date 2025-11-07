/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['phaser'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'phaser3spectorjs': false,
    };
    return config;
  },
}

module.exports = nextConfig
