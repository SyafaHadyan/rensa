import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import type React from "react";
import DropdownItem from "@/frontend/components/dropdowns/DropdownItem";
import IconDropdown from "@/frontend/components/dropdowns/IconDropdown";

interface PhotoDropdownViewProps {
	isOwner: boolean;
	onDelete: () => void;
	onShare: () => void;
}

const PhotoDropdownView: React.FC<PhotoDropdownViewProps> = ({
	isOwner,
	onDelete,
	onShare,
}) => (
	<div className="flex items-center justify-center">
		<IconDropdown
			className="no-scrollbar flex max-h-40 flex-col items-center justify-center overflow-y-auto font-figtree font-semibold"
			iconSize={24}
			Tag={DotsThreeVerticalIcon}
			weight="bold"
		>
			<DropdownItem className="px-10" onClick={onShare}>
				Share
			</DropdownItem>
			{isOwner && (
				<DropdownItem className="px-10" onClick={onDelete}>
					Delete
				</DropdownItem>
			)}
		</IconDropdown>
	</div>
);

export default PhotoDropdownView;
