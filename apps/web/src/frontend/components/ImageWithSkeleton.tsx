import Image, { type ImageProps } from "next/image";
import type React from "react";
import { useState } from "react";
import { getOptimizedCloudinaryImageUrl } from "@/utils/cloudinary-image";
import { cn } from "@/utils/cn";

interface ImageWithSkeletonProps {
	image: Omit<ImageProps, "width" | "height"> & {
		width: number;
		height: number;
	};
	onLoad?: () => void;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
	image,
	onLoad,
}) => {
	const [loaded, setLoaded] = useState<boolean>(false);
	const handleLoad = () => {
		setLoaded(true);
		if (onLoad) {
			onLoad();
		}
	};
	return (
		<div className="relative h-auto w-full transform transition-transform duration-300">
			{!loaded && (
				<div className="absolute inset-0 z-10 flex items-center justify-center">
					<div className="skeleton h-full w-full animate-none bg-[#D5D5D5]" />
				</div>
			)}
			<Image
				{...image}
				alt="pic"
				className={cn(
					"h-full w-full object-cover",
					loaded ? "opacity-100" : "opacity-0"
				)}
				loading="lazy"
				onLoad={() => {
					// console.log("Image loaded:", image.src);
					handleLoad();
				}}
				src={
					typeof image.src === "string"
						? getOptimizedCloudinaryImageUrl(image.src, {
								quality: 30,
								width: image.width,
								crop: "limit",
							})
						: image.src
				}
			/>
		</div>
	);
};
