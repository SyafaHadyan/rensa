"use client";

import { DotsThreeCircleIcon } from "@phosphor-icons/react";
import type React from "react";
import DropdownItem from "@/frontend/components/dropdowns/DropdownItem";
import IconDropdown from "@/frontend/components/dropdowns/IconDropdown";

interface RollPageDropdownViewProps {
	canDelete: boolean;
	isOwner: boolean;
	onDelete: () => void;
	onRename: () => void;
	onShare: () => void;
}

const RollPageDropdownView: React.FC<RollPageDropdownViewProps> = ({
	canDelete,
	isOwner,
	onDelete,
	onRename,
	onShare,
}) => (
	<div className="z-20">
		<IconDropdown
			className="no-scrollbar flex max-h-40 flex-col items-center justify-center overflow-y-auto font-figtree font-semibold"
			closeOnItemClick={false}
			iconSize={48}
			Tag={DotsThreeCircleIcon}
			weight="light"
		>
			{isOwner && (
				<DropdownItem className="px-10" onClick={onRename}>
					Rename
				</DropdownItem>
			)}
			<DropdownItem className="px-10" onClick={onShare}>
				Share
			</DropdownItem>
			{isOwner && canDelete && (
				<DropdownItem className="px-10" onClick={onDelete}>
					Delete
				</DropdownItem>
			)}
		</IconDropdown>
	</div>
);

export default RollPageDropdownView;
