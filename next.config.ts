import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle (.next/standalone) for container
  // deploys (AWS App Runner / ECS Fargate / Elastic Beanstalk).
  output: "standalone",
};

export default nextConfig;
