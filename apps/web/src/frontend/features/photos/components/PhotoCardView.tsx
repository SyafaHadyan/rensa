import { ArrowUpRightIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import type React from "react";
import RollDropdown from "@/frontend/components/dropdowns/rolls/RollDropdown";
import { ImageWithSkeleton } from "@/frontend/components/ImageWithSkeleton";
import Text from "@/frontend/components/Text";
import type { Photo } from "@/frontend/services/photo.service";
import { cn } from "@/utils/cn";

interface PhotoCardViewProps {
	closeAllDropdowns: () => void;
	id: string | null;
	isDropdownOpen: boolean;
	isLoading: boolean;
	isSaved: boolean;
	onSaveToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
	onToggleDropdown: React.Dispatch<React.SetStateAction<boolean>>;
	photo: Photo;
	savedToRolls: string[];
	selectedRoll: { roll_id: string; name: string } | null;
	setSelectedRoll: React.Dispatch<
		React.SetStateAction<{ roll_id: string; name: string } | null>
	>;
	showVisitPageCta: boolean;
}

const PhotoCardView: React.FC<PhotoCardViewProps> = ({
	id,
	photo,
	isDropdownOpen,
	onToggleDropdown,
	closeAllDropdowns,
	selectedRoll,
	setSelectedRoll,
	isLoading,
	isSaved,
	savedToRolls,
	onSaveToggle,
	showVisitPageCta,
}) => {
	const user = photo.userId ?? photo.user_id;
	const username =
		typeof user === "object" && user !== null ? user.username : undefined;

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="m-3 mb-5 max-w-[256px]"
			exit={{ opacity: 0 }}
			initial={{ opacity: 0 }}
			layout
			transition={{ duration: 0.35, ease: "easeOut" }}
		>
			<Link className="block" href={id ? `/photo/${id}` : "#"} prefetch={false}>
				<div
					className={cn(
						"group relative cursor-pointer overflow-hidden rounded-3xl transition-transform duration-300",
						isDropdownOpen ? "scale-103" : "scale-100"
					)}
				>
					<ImageWithSkeleton
						image={{
							src: photo.url,
							alt: photo.title,
							width: 350,
							height: 450,
						}}
					/>

					<div
						className={cn(
							"pointer-events-none absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-40",
							isDropdownOpen ? "opacity-40" : "opacity-0"
						)}
					/>

					<div
						className={cn(
							"pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100",
							isDropdownOpen ? "opacity-100" : "opacity-0"
						)}
					>
						<div className="pointer-events-auto absolute top-0 right-0 flex w-full justify-between p-4">
							{showVisitPageCta ? (
								<div className="flex items-center gap-1">
									<Text size="xs">Visit Page</Text>
									<ArrowUpRightIcon size={20} />
								</div>
							) : (
								<>
									<RollDropdown
										closeAll={closeAllDropdowns}
										disabled={isSaved}
										isOpen={isDropdownOpen}
										savedToRolls={savedToRolls}
										selectedRoll={selectedRoll}
										setIsOpen={onToggleDropdown}
										setSelectedRoll={setSelectedRoll}
									/>

									<button
										className={cn(
											"pointer-events-auto z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-black transition-colors duration-200 hover:bg-white-700",
											isSaved
												? "border-black bg-black text-white"
												: "border-white bg-white text-black"
										)}
										disabled={!selectedRoll || isLoading}
										onClick={onSaveToggle}
										type="button"
									>
										{isSaved ? (
											<CheckIcon size={16} weight="bold" />
										) : (
											<PlusIcon size={16} />
										)}
									</button>
								</>
							)}
						</div>

						<Text
							className="pointer-events-none absolute right-0 bottom-0 p-4 font-normal"
							size="xs"
						>
							@{username ?? "photographer"}
						</Text>
					</div>
				</div>
			</Link>
		</motion.div>
	);
};

export default PhotoCardView;
