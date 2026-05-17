import { CheckIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Image from "next/image";
import type { SelectedRoll } from "@/frontend/types/roll";
import { cn } from "@/utils/cn";
import { rollDropdownItemVariants } from "../../animations/dropdownAnimations";
import Text from "../../Text";

interface RollDropdownItemProps {
	isCreating?: boolean;
	isSaved?: boolean;
	onSelectedRoll: (roll: SelectedRoll) => void;
	roll: {
		rollId: string;
		name: string;
		imageUrl?: string;
	};
	selectedRollId: string | null;
}

const RollDropdownItem: React.FC<RollDropdownItemProps> = ({
	roll,
	onSelectedRoll,
	selectedRollId,
	isCreating,
	isSaved,
}) => {
	const isSelected = selectedRollId === roll.rollId;
	const handleClick = () => {
		if (isCreating) {
			return;
		}
		onSelectedRoll({ rollId: roll.rollId, name: roll.name });
	};
	return (
		<motion.li
			animate="visible"
			className={cn(
				"mx-3 my-2 cursor-pointer rounded-3xl transition-colors duration-100",
				isSelected && "bg-gray-200"
			)}
			exit="exit"
			initial="hidden"
			key={roll.rollId}
			variants={rollDropdownItemVariants}
		>
			<button
				className="flex w-full flex-row items-center justify-start gap-2 px-4 py-2 md:px-8 md:py-2"
				onClick={handleClick}
			>
				<div className="relative h-10 w-10 md:h-12 md:w-12">
					<Image
						alt={roll?.name || "Untitled Roll"}
						className="h-full w-full rounded-2xl object-cover"
						fill
						src={roll?.imageUrl || "/images/default-roll.jpg"}
					/>
				</div>
				<div className="flex flex-col">
					<Text className="text-left font-semibold" size="s">
						{roll?.name || "Untitled Roll"}
					</Text>
					<p className="font-figtree text-primary text-xs">
						{isSaved ? "Saved here already." : ""}
					</p>
				</div>
				<CheckIcon
					className={cn(
						"ml-auto text-black transition-opacity duration-150",
						isSelected ? "opacity-100" : "opacity-0"
					)}
					size={24}
					weight="bold"
				/>
			</button>
		</motion.li>
	);
};

export default RollDropdownItem;
