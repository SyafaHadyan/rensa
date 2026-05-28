"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import type React from "react";
import { createPortal } from "react-dom";
import IconButton from "@/frontend/components/buttons/IconButton";
import PrimaryButton from "@/frontend/components/buttons/PrimaryButton";
import RollDropdownInputItem from "@/frontend/components/dropdowns/rolls/RollDropdownInputItem";
import RollDropdownItem from "@/frontend/components/dropdowns/rolls/RollDropdownItem";
import Heading from "@/frontend/components/Heading";
import SearchInputField from "@/frontend/components/inputfields/SearchInputField";
import Text from "@/frontend/components/Text";
import type { SelectedRoll } from "@/frontend/types/roll";

interface RollOption {
	imageUrl?: string;
	name: string;
	rollId: string;
}

interface RollDropdownIconButtonViewProps {
	buttonRef: React.RefObject<HTMLDivElement | null>;
	disabled: boolean;
	dropdownPosition: { left: number; top: number };
	dropdownRef: React.RefObject<HTMLDivElement | null>;
	handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
	handleCreate: () => void;
	handleCreateRoll: () => Promise<void>;
	isCreating: boolean;
	isLoading: boolean;
	isOpen: boolean;
	listRef: React.RefObject<HTMLUListElement | null>;
	newRollName: string;
	rolls: RollOption[];
	savedToRolls: string[];
	selectedRoll: SelectedRoll | null;
	setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
	setNewRollName: React.Dispatch<React.SetStateAction<string>>;
	setSelectedRoll: React.Dispatch<React.SetStateAction<SelectedRoll | null>>;
}

const RollDropdownIconButtonView: React.FC<RollDropdownIconButtonViewProps> = ({
	buttonRef,
	disabled,
	dropdownPosition,
	dropdownRef,
	handleClick,
	handleCreate,
	handleCreateRoll,
	isCreating,
	isLoading,
	isOpen,
	listRef,
	newRollName,
	rolls,
	savedToRolls,
	selectedRoll,
	setIsCreating,
	setNewRollName,
	setSelectedRoll,
}) => {
	const dropdownContent = (
		<div
			className="item-start flex w-50 origin-top transform flex-col justify-center gap-4 rounded-2xl border border-gray-400 bg-white py-4 text-primary shadow-lg ease-out md:w-82"
			onClick={(e) => e.stopPropagation()}
			ref={dropdownRef}
			style={{
				position: "absolute",
				top: dropdownPosition.top,
				left: dropdownPosition.left,
				zIndex: 9999,
				visibility:
					dropdownPosition.top === 0 && dropdownPosition.left === 0
						? "hidden"
						: "visible",
			}}
		>
			<Heading alignment="center" className="py-2" size="m">
				Rolls
			</Heading>

			<SearchInputField className="ml-2 w-44.5 md:w-77.25" />

			<ul className="max-h-60 w-full overflow-y-auto" ref={listRef}>
				{isLoading ? (
					<div className="relative flex h-32 w-full items-center justify-center">
						<div className="loading loading-spinner" />
					</div>
				) : (
					<>
						{rolls.length > 0 ? (
							rolls.map((roll) => (
								<RollDropdownItem
									isCreating={isCreating}
									isSaved={savedToRolls.includes(roll.rollId)}
									key={roll.rollId}
									onSelectedRoll={() =>
										setSelectedRoll({
											rollId: roll.rollId,
											name: roll.name,
										})
									}
									roll={roll}
									selectedRollId={selectedRoll?.rollId || null}
								/>
							))
						) : (
							<li className="px-4 py-2 text-center text-gray-500">
								No rolls found
							</li>
						)}
						{isCreating && (
							<RollDropdownInputItem
								handleCreateRoll={handleCreateRoll}
								newRollName={newRollName}
								setIsCreating={setIsCreating}
								setNewRollName={setNewRollName}
							/>
						)}
					</>
				)}
			</ul>

			<PrimaryButton
				className="mx-4 mt-2"
				disabled={isLoading}
				onClick={isCreating ? handleCreateRoll : handleCreate}
			>
				{isCreating ? "Add Roll" : "New Roll"}
			</PrimaryButton>
		</div>
	);

	return (
		<div ref={buttonRef}>
			<IconButton
				className="flex cursor-pointer flex-row items-center gap-2 rounded-3xl px-4 py-2 font-semibold outline-0 ring-0"
				color="tertiary"
				disabled={disabled}
				iconPosition="right"
				onClick={handleClick}
				paddingX={1}
			>
				<Text size="xs">{selectedRoll ? selectedRoll.name : "All Photos"}</Text>
				<CaretDownIcon weight="bold" />
			</IconButton>

			{isOpen && createPortal(dropdownContent, document.body)}
		</div>
	);
};

export default RollDropdownIconButtonView;
