import { PencilIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import SmallIconButton from "@/frontend/components/buttons/SmallIconButton";
import Heading from "@/frontend/components/Heading";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date-formatter";

interface RollCardViewProps {
	createdAt?: string;
	id: string;
	imageUrls: string[];
	isOwner: boolean;
	name: string;
	onEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const RollCardView: React.FC<RollCardViewProps> = ({
	id,
	name,
	imageUrls,
	createdAt,
	isOwner,
	onEdit,
}) => {
	const previews = imageUrls.slice(0, 4);
	const previewGridCols =
		previews.length <= 1 ? "grid-cols-1" : "grid-cols-2 grid-rows-2";

	return (
		<Link className="group" href={`/roll/${id}`}>
			<div className="relative h-64 w-full min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-gray-300 bg-white p-3 shadow-md transition-transform duration-200 hover:scale-[1.02] md:h-86 md:w-66.25">
				<div className={cn("grid aspect-square gap-2.5", previewGridCols)}>
					{previews.length < 1 && (
						<div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
							<span className="text-gray-500">No image</span>
						</div>
					)}
					{previews.map((url) => {
						const photoClass = "relative h-full min-h-0 w-full";

						return (
							<div className={photoClass} key={url}>
								<Image
									alt={name}
									className="rounded-lg object-cover"
									fill
									src={url}
								/>
							</div>
						);
					})}
				</div>

				<Heading className="mt-2 truncate font-forum text-black" size="s">
					{name}
				</Heading>

				{createdAt && (
					<p className="text-gray-500 text-sm">{formatDate(createdAt)}</p>
				)}

				<div className="pointer-events-none absolute inset-0 rounded-2xl bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

				{isOwner && (
					<div className="pointer-events-auto absolute top-3 right-3">
						<SmallIconButton
							className="rounded-full bg-white p-2 opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100"
							onClick={onEdit}
						>
							<PencilIcon size={16} weight="bold" />
						</SmallIconButton>
					</div>
				)}
			</div>
		</Link>
	);
};

export default RollCardView;
