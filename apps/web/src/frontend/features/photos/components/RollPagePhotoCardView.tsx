import { TrashIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import type React from "react";
import SmallIconButton from "@/frontend/components/buttons/SmallIconButton";
import { ImageWithSkeleton } from "@/frontend/components/ImageWithSkeleton";
import type { Photo } from "@/frontend/types/photo";
import { cn } from "@/utils/cn";

interface RollPagePhotoCardViewProps {
	handleUnsaveClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
	id: string;
	isLoading: boolean;
	isOwner: boolean;
	photo: Photo;
}

const RollPagePhotoCardView: React.FC<RollPagePhotoCardViewProps> = ({
	id,
	photo,
	isOwner,
	isLoading,
	handleUnsaveClick,
}) => (
	<motion.div
		animate={{ opacity: 1 }}
		className="m-3 mb-5"
		exit={{ opacity: 0 }}
		initial={{ opacity: 0 }}
		layout
		transition={{ duration: 0.35, ease: "easeOut" }}
	>
		<Link href={id ? `/photo/${id}` : "#"} prefetch={false}>
			<div className="group relative cursor-pointer overflow-hidden rounded-3xl transition-transform duration-300 hover:scale-[1.02]">
				<ImageWithSkeleton
					image={{
						src: photo.url,
						alt: photo.title,
						width: 350,
						height: 450,
					}}
				/>

				<div className="pointer-events-none absolute inset-0 rounded-3xl bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-40" />

				{isOwner && (
					<div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<div className="pointer-events-auto absolute top-3 right-3">
							<SmallIconButton
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-colors duration-200 hover:bg-gray-200",
									isLoading && "cursor-wait opacity-70"
								)}
								disabled={isLoading}
								onClick={handleUnsaveClick}
							>
								{isLoading ? (
									<div className="loading loading-spinner text-current" />
								) : (
									<TrashIcon size={16} weight="bold" />
								)}
							</SmallIconButton>
						</div>
					</div>
				)}
			</div>
		</Link>
	</motion.div>
);

export default RollPagePhotoCardView;
