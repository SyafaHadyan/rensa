import type React from "react";
import PrimaryButton from "@/frontend/components/buttons/PrimaryButton";
import PhotoDropdown from "@/frontend/components/dropdowns/PhotoDropdown";
import RollDropdownIconButton from "@/frontend/components/dropdowns/rolls/RollDropdownIconButton";
import Heading from "@/frontend/components/Heading";
import RecipeList from "@/frontend/components/lists/RecipeList";
import Text from "@/frontend/components/Text";
import BookmarkToggleContainer from "@/frontend/features/photos/containers/BookmarkToggleContainer";
import CommentSection from "@/frontend/sections/CommentSection";
import type { PhotoMetadata } from "@/frontend/types/photo";
import type { SelectedRoll } from "@/frontend/types/roll";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date-formatter";

interface PhotoInfoCardViewProps {
	className?: string;
	description?: string;
	id: string;
	initialBookmarks?: number;
	isDropdownOpen: boolean;
	isLoading: boolean;
	isOwner: boolean;
	isSaved: boolean;
	metadata?: PhotoMetadata;
	onSaveToggle: () => void;
	profileBadge: React.ReactNode;
	savedToRolls: string[];
	selectedRoll: SelectedRoll | null;
	setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedRoll: React.Dispatch<React.SetStateAction<SelectedRoll | null>>;
	title?: string;
	userId?: string;
}

const PhotoInfoCardView: React.FC<PhotoInfoCardViewProps> = ({
	id,
	className,
	title,
	initialBookmarks,
	description,
	metadata,
	isOwner,
	userId,
	profileBadge,
	selectedRoll,
	isLoading,
	isSaved,
	setSelectedRoll,
	savedToRolls,
	isDropdownOpen,
	setIsDropdownOpen,
	onSaveToggle,
}) => (
	<div
		className={cn(
			"flex w-full flex-col gap-1.5 rounded-3xl bg-white-200 p-10 text-primary shadow-lg lg:max-w-3xl xl:w-[40%]",
			className
		)}
		id={id}
	>
		{userId && (
			<div className="inline-flex w-full items-center justify-between">
				<BookmarkToggleContainer
					initialBookmarks={initialBookmarks}
					photoId={id}
				/>
				<div className="inline-flex gap-5">
					<RollDropdownIconButton
						disabled={isLoading || isSaved}
						isOpen={isDropdownOpen}
						savedToRolls={savedToRolls}
						selectedRoll={selectedRoll}
						setIsOpen={setIsDropdownOpen}
						setSelectedRoll={setSelectedRoll}
					/>
					<PrimaryButton onClick={onSaveToggle}>
						{isSaved ? "Saved" : "Save"}
					</PrimaryButton>

					<PhotoDropdown isOwner={isOwner} photoId={id} />
				</div>
			</div>
		)}
		<div className="mb-9">
			<div className="mb-7">
				<Text className="text-white-700" size="s">
					{formatDate(metadata?.uploadedAt)}
				</Text>
				<Heading size="m">{title}</Heading>
			</div>
			{profileBadge}
			<p className="max-w-87.5 text-[16px] text-black-200">{description}</p>
		</div>
		<div>
			<RecipeList metadata={metadata} />
		</div>
		<CommentSection id={id} />
	</div>
);

export default PhotoInfoCardView;
