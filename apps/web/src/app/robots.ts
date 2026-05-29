import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rensa.site";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",
					"/dashboard",
					"/bookmarks",
					"/upload",
					"/login",
					"/register",
					"/logout",
					"/forgot-password",
					"/reset-password",
					"/verified",
				],
			},
		],
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
