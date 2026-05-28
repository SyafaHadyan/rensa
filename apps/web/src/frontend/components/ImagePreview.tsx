"use client";
import { XIcon } from "@phosphor-icons/react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { getOptimizedCloudinaryImageUrl } from "@/utils/cloudinary-image";
import { cn } from "@/utils/cn";
import LinkIconButton from "./buttons/LinkIconButton";

interface ImagePreviewProps {
	alt: string;
	height?: number;
	src: string;
	width?: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
	src,
	alt,
	width,
	height,
}) => {
	const [loaded, setLoaded] = useState(false);
	return (
		<div className="relative flex flex-col items-center justify-center gap-5">
			<LinkIconButton className="self-start" href={"back"} Icon={XIcon} />
			<div className="relative w-fit max-w-full overflow-hidden rounded-3xl xl:max-w-2xl">
				{!loaded && (
					<div className="skeleton absolute inset-0 z-10 animate-pulse bg-[#D5D5D5]" />
				)}
				<Image
					alt={alt}
					className={cn(
						"h-auto max-w-full rounded-3xl transition-opacity duration-300",
						loaded ? "opacity-100" : "opacity-0"
					)}
					height={height}
					onLoad={() => setLoaded(true)}
					src={getOptimizedCloudinaryImageUrl(src, {
						quality: 40,
						width: 1200,
						crop: "limit",
					})}
					width={width}
				/>
			</div>
		</div>
	);
};
export default ImagePreview;
