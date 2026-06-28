import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necesario para contenedorizar con Docker
  // Ver mas en:
  // - https://docs.docker.com/guides/nextjs/containerize/
  // - https://nextjs.org/docs/pages/getting-started/deploying
  output: "standalone"
};

export default nextConfig;
