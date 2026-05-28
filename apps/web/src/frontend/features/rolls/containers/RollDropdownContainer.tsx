import type React from "react";
import { useRollDropdownController } from "@/frontend/features/rolls/hooks/use-roll-dropdown-controller";
import RollDropdownView from "../components/RollDropdownView";

export interface RollDropdownContainerProps {
	closeAll: () => void;
	disabled: boolean;
	isOpen: boolean;
	savedToRolls: string[];
	selectedRoll: { rollId: string; name: string } | null;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedRoll: React.Dispatch<
		React.SetStateAction<{ rollId: string; name: string } | null>
	>;
}

const RollDropdownContainer: React.FC<RollDropdownContainerProps> = ({
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
	} = useRollDropdownController<HTMLButtonElement>({
		closeAll,
		isOpen,
		setIsOpen,
	});

	return (
		<RollDropdownView
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

export default RollDropdownContainer;
