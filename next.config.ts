import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Custom domain (oiiii.studio) → empty basePath.
 * Only set PROJECT_PATH=true if hosting under github.io/oiiiistudio/ without a domain.
 *
 * Static export is ON for GitHub Pages / EXPORT=true, OFF for local `next dev` / `next start`
 * so local preview and production deploy can both work.
 */
const repo = "oiiiistudio";
const useProjectPath = process.env.PROJECT_PATH === "true";
const basePath = useProjectPath ? `/${repo}` : "";
const isStaticExport =
  process.env.GITHUB_ACTIONS === "true" || process.env.EXPORT === "true";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Avoid Turbopack guessing the wrong monorepo root under nested folders
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
