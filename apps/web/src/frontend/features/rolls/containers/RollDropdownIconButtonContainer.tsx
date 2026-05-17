"use client";

import type React from "react";
import { useRollDropdownController } from "@/frontend/features/rolls/hooks/use-roll-dropdown-controller";
import type { SelectedRoll } from "@/frontend/types/roll";
import RollDropdownIconButtonView from "../components/RollDropdownIconButtonView";

export interface RollDropdownIconButtonContainerProps {
	closeAll?: () => void;
	disabled: boolean;
	isOpen: boolean;
	savedToRolls: string[];
	selectedRoll: SelectedRoll | null;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedRoll: React.Dispatch<React.SetStateAction<SelectedRoll | null>>;
}

const RollDropdownIconButtonContainer: React.FC<
	RollDropdownIconButtonContainerProps
> = ({
	isOpen,
	setIsOpen,
	closeAll,
	savedToRolls,
	selectedRoll,
	setSelectedRoll,
	disabled,
}) => {
	const {
		buttonRef,
		dropdownPosition,
		dropdownRef,
		handleClick,
		handleCreate,
		handleCreateRoll,
		isCreating,
		isLoading,
		listRef,
		newRollName,
		rolls,
		setIsCreating,
		setNewRollName,
	} = useRollDropdownController<HTMLDivElement>({
		closeAll,
		isOpen,
		setIsOpen,
	});

	return (
		<RollDropdownIconButtonView
			buttonRef={buttonRef}
			disabled={disabled}
			dropdownPosition={dropdownPosition}
			dropdownRef={dropdownRef}
			handleClick={handleClick}
			handleCreate={handleCreate}
			handleCreateRoll={handleCreateRoll}
			isCreating={isCreating}
			isLoading={isLoading}
			isOpen={isOpen}
			listRef={listRef}
			newRollName={newRollName}
			rolls={rolls}
			savedToRolls={savedToRolls}
			selectedRoll={selectedRoll}
			setIsCreating={setIsCreating}
			setNewRollName={setNewRollName}
			setSelectedRoll={setSelectedRoll}
		/>
	);
};

export default RollDropdownIconButtonContainer;
