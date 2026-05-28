import { XIcon } from "@phosphor-icons/react";
import type React from "react";
import { cn } from "@/utils/cn";
import Text from "../Text";

interface TagChipProps {
	className?: string;
	disabled?: boolean;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	tag: string;
}

const TagChip: React.FC<TagChipProps> = ({
	tag,
	onClick,
	className,
	disabled = false,
}) => (
	<span
		className={cn(
			"flex w-20 min-w-0 justify-between gap-2 rounded-full border bg-black p-2 pr-6 pl-4 text-white-200 sm:w-25",
			className
		)}
	>
		<Text className="truncate" size="xs">
			{tag}
		</Text>
		<button
			aria-label={`Remove ${tag}`}
			className="shrink-0"
			disabled={disabled}
			onClick={onClick}
			type="button"
		>
			<XIcon color={"white"} size={10} />
		</button>
	</span>
);

export default TagChip;
