/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: "standalone",
  basePath: "/portal",
  trailingSlash: true,
  env: {
    BASE_URL: process.env.BASE_URL
  }
};

export default nextConfig;
