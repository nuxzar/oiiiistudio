import type { NextConfig } from "next";

/**
 * Custom domain (oiiii.studio) serves from site root — no basePath.
 * Only set PROJECT_PATH=true if you must host under github.io/oiiiistudio/ without a domain.
 */
const repo = "oiiiistudio";
const useProjectPath = process.env.PROJECT_PATH === "true";
const basePath = useProjectPath ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
