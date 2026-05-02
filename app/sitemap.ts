import type { MetadataRoute } from "next";

const routes = ["", "/scan", "/create-token", "/pricing", "/about", "/feedback"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://solguard-nine.vercel.app";
  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
