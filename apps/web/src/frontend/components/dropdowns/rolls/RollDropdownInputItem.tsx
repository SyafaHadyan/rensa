import { motion } from "motion/react";
import Image from "next/image";
import { rollDropdownItemVariants } from "@/frontend/components/animations/dropdownAnimations";
import { ROLL_NAME_MAX_LENGTH } from "@/shared/configs/content-limits.config";

interface RollDropdownItemProps {
	handleCreateRoll: () => void;
	newRollName: string;
	setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
	setNewRollName: React.Dispatch<React.SetStateAction<string>>;
}

const RollDropdownInputItem: React.FC<RollDropdownItemProps> = ({
	setIsCreating,
	setNewRollName,
	handleCreateRoll,
	newRollName,
}) => (
	<motion.li
		animate="visible"
		className="mx-3 my-2 rounded-3xl bg-gray-100"
		exit="exit"
		initial="hidden"
		variants={rollDropdownItemVariants}
	>
		<div className="flex w-full flex-row items-center justify-start gap-2 px-4 py-2 md:px-8 md:py-2">
			<div className="relative h-10 w-10 md:h-12 md:w-12">
				<Image
					alt={"New Roll"}
					className="h-full w-full rounded-2xl object-cover"
					fill
					src={"/images/default-roll.jpg"}
				/>
			</div>
			<input
				className="w-38 rounded-xl font-figtree font-semibold text-[13px] outline-none md:text-[18px]"
				maxLength={ROLL_NAME_MAX_LENGTH}
				onChange={(e) => setNewRollName(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						handleCreateRoll();
					}
					if (e.key === "Escape") {
						setIsCreating(false);
						setNewRollName("");
					}
				}}
				placeholder="Enter roll name..."
				type="text"
				value={newRollName}
			/>
		</div>
	</motion.li>
);

export default RollDropdownInputItem;
