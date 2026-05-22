import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache, Suspense } from "react";
import PhotoInfoCard from "@/frontend/components/cards/PhotoInfoCard";
import Heading from "@/frontend/components/Heading";
import ImagePreview from "@/frontend/components/ImagePreview";
import PhotoPageFallback, {
	PhotoRecommendationsFallback,
} from "@/frontend/features/photos/components/fallbacks/PhotoPageFallbacks";
import PhotoRecommendationsSection from "@/frontend/features/photos/components/PhotoRecommendationsSection";
import { fetchPhotoById } from "@/frontend/services/photo.service";
import type { Photo } from "@/frontend/types/photo";

const getPhotoById = cache(async (id: string): Promise<Photo | null> => {
	try {
		return await fetchPhotoById(id);
	} catch {
		return null;
	}
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const photo = await getPhotoById(id);

	if (!photo) {
		return {
			title: "Photo Not Found",
			robots: {
				index: false,
				follow: false,
			},
		};
	}

	const title = photo.title || "Photo";
	const description =
		photo.description || "Discover photography inspiration on Rensa.";

	return {
		title: `${title}`,
		description,
		alternates: {
			canonical: `/photo/${id}`,
		},
		openGraph: {
			title,
			description,
			url: `/photo/${id}`,
			type: "article",
			images: photo.url
				? [
						{
							url: photo.url,
							alt: title,
						},
					]
				: undefined,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: photo.url ? [photo.url] : undefined,
		},
	};
}

export default async function PhotoPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return (
		<Suspense fallback={<PhotoPageFallback />}>
			<PhotoPageContent id={id} />
		</Suspense>
	);
}

async function PhotoPageContent({ id }: { id: string }) {
	const photo = await getPhotoById(id);

	if (!photo) {
		redirect("/not-found");
	}

	return (
		<div className="flex w-full flex-col items-center justify-center gap-10 bg-white-500 px-6.25 md:px-7.5 lg:px-17.5 xl:px-22.5 2xl:px-65">
			<div className="flex flex-col items-start justify-center gap-16.75 pt-35 lg:flex-row">
				<div className="flex flex-col items-center justify-center gap-2 md:items-start md:justify-start">
					<ImagePreview
						alt={photo.title ?? "Photo"}
						height={photo.metadata?.height}
						src={photo.url ?? ""}
						width={photo.metadata?.width}
					/>
				</div>
				<PhotoInfoCard
					description={photo.description}
					id={id}
					initialBookmarks={photo.bookmarks}
					metadata={photo.metadata}
					ownerId={photo.user.userId}
					title={photo.title}
				/>
			</div>
			<Heading className="text-primary" size="s">
				We thought you will like this
			</Heading>
			<Suspense fallback={<PhotoRecommendationsFallback />}>
				<PhotoRecommendationsSection />
			</Suspense>
		</div>
	);
}
