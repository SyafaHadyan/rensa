import type { Metadata } from "next";
import PhotoPageContainer from "@/frontend/features/photos/containers/PhotoPageContainer";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;

	return {
		title: "Photo",
		description: "Discover photography inspiration on Rensa.",
		alternates: {
			canonical: `/photo/${id}`,
		},
		openGraph: {
			title: "Photo",
			description: "Discover photography inspiration on Rensa.",
			url: `/photo/${id}`,
			type: "article",
		},
		twitter: {
			card: "summary_large_image",
			title: "Photo",
			description: "Discover photography inspiration on Rensa.",
		},
	};
}

export default async function PhotoPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return <PhotoPageContainer photoId={id} />;
}
