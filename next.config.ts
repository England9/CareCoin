import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Care Coin runs on Node-compatible Cloudflare Workers via OpenNext
};

export default nextConfig;

// Bindings available during `next dev` when previewing Cloudflare resources
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
