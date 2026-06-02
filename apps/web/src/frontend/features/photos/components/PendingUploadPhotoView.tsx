import Image from "next/image";
import type { UploadedPhoto } from "@/frontend/types/photo";
import { getOptimizedCloudinaryImageUrl } from "@/utils/cloudinary-image";

interface PendingUploadPhotoViewProps {
	photo?: UploadedPhoto | null;
	photoId: string;
	processingError?: string | null;
	status: "pending" | "failed";
}

const PendingUploadPhotoView: React.FC<PendingUploadPhotoViewProps> = ({
	photo,
	photoId,
	processingError,
	status,
}) => {
	const isFailed = status === "failed";
	const title = photo?.title || "Your photo";

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-white-500 px-5 py-24 text-primary md:px-10">
			<section className="grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
				<div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white-200 shadow-lg">
					{photo?.url ? (
						<Image
							alt={title}
							className="h-full w-full object-cover"
							fill
							priority
							src={getOptimizedCloudinaryImageUrl(photo.url, {
								crop: "limit",
								quality: 45,
								width: 1200,
							})}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-white-200">
							<div className="loading loading-spinner loading-lg text-primary" />
						</div>
					)}
					<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 text-white">
						<p className="font-forum text-[28px] leading-tight">{title}</p>
						<p className="mt-1 font-figtree text-[13px]">
							Photo ID {photoId.slice(0, 8)}
						</p>
					</div>
				</div>

				<div className="rounded-3xl bg-white-200 p-6 shadow-lg">
					<div className="mb-5 flex items-center gap-3">
						<span
							className={
								isFailed
									? "h-3 w-3 rounded-full bg-red-500"
									: "h-3 w-3 animate-pulse rounded-full bg-primary"
							}
						/>
						<p className="font-figtree text-[13px] text-black-200 uppercase tracking-wide">
							{isFailed ? "Processing failed" : "Upload complete"}
						</p>
					</div>
					<h1 className="font-forum text-[34px] text-primary leading-tight">
						{isFailed ? "This upload needs attention." : "Your photo is in."}
					</h1>
					<p className="mt-4 font-figtree text-[15px] text-black-200 leading-7">
						{isFailed
							? processingError ||
								"We could not finish processing this image. Try uploading it again."
							: "We are preparing the final image in the background. You can leave this page; it will update automatically when the photo is ready."}
					</p>
					{!isFailed && (
						<div className="mt-6 h-2 overflow-hidden rounded-full bg-white-700">
							<div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default PendingUploadPhotoView;
