import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rensa.site";
	const now = new Date();

	const routes = [
		{
			url: baseUrl,
			lastModified: now,
			changeFrequency: "weekly" as const,
			priority: 1.0,
		},
		{
			url: `${baseUrl}/explore`,
			lastModified: now,
			changeFrequency: "daily" as const,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/home`,
			lastModified: now,
			changeFrequency: "weekly" as const,
			priority: 0.7,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: now,
			changeFrequency: "monthly" as const,
			priority: 0.5,
		},
	];

	return routes;
}
