import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PhotoInfoCard from "@/frontend/components/cards/PhotoInfoCard";
import Heading from "@/frontend/components/Heading";
import ImagePreview from "@/frontend/components/ImagePreview";
import MasonryGalleryPage from "@/frontend/sections/MasonryGallerySection/MasonryGallerySection";
import { fetchPhotoById } from "@/frontend/services/photo.service";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	try {
		const photo = await fetchPhotoById(id);
		const title = photo?.title || "Photo";
		const description =
			photo?.description || "Discover photography inspiration on Rensa.";

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
				images: photo?.url
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
				images: photo?.url ? [photo.url] : undefined,
			},
		};
	} catch {
		return {
			title: "Photo Not Found",
			robots: {
				index: false,
				follow: false,
			},
		};
	}
}

export default async function PhotoPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	let photo: Awaited<ReturnType<typeof fetchPhotoById>> | null = null;
	try {
		photo = await fetchPhotoById(id);
		console.log("Fetched photo:", photo);
	} catch {
		photo = null;
	}
	if (!photo) {
		redirect("/not-found");
	}
	return (
		<div className="flex w-full flex-col items-center justify-center gap-10 bg-white-500 px-6.25 md:px-7.5 lg:px-17.5 xl:px-22.5 2xl:px-65">
			<div className="flex flex-col items-start justify-center gap-16.75 pt-35 lg:flex-row">
				<div className="flex flex-col items-center justify-center gap-2 md:items-start md:justify-start">
					<ImagePreview
						alt={photo?.title ?? "Photo"}
						height={photo.metadata.height}
						src={photo?.url ?? ""}
						width={photo.metadata.width}
					/>
				</div>
				<PhotoInfoCard
					description={photo?.description}
					id={id}
					initialBookmarks={photo?.bookmarkedBy?.length || 0}
					metadata={photo?.metadata}
					ownerId={photo?.user?.user_id}
					title={photo?.title}
				/>
			</div>
			<Heading className="text-primary" size="s">
				We thought you will like this
			</Heading>
			<MasonryGalleryPage type="explore" />
		</div>
	);
}
