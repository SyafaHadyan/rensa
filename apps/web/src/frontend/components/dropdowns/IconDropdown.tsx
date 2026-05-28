"use client";

import type React from "react";
import { useState } from "react";
import { useOutsideClick } from "@/frontend/features/common/hooks/use-outside-click";
import { cn } from "@/utils/cn";

interface IconDropdownProps {
	children?: React.ReactNode;

	className?: string;
	closeOnItemClick?: boolean;
	iconSize?: number;
	id?: string;
	position?: "left" | "right" | "center";
	Tag?: React.ElementType;
	weight?:
		| "bold"
		| "duotone"
		| "fill"
		| "light"
		| "regular"
		| "thin"
		| undefined;
}

const IconDropdown: React.FC<IconDropdownProps> = ({
	children,
	iconSize = 32,
	Tag,
	position = "center",
	closeOnItemClick = true,
	weight = "fill",
	className = "",
}) => {
	const positionClasses = {
		left: "-right-0",
		right: "left-0",
		center: "-left-23",
	};
	const [open, setOpen] = useState(false);
	const dropdownRef = useOutsideClick<HTMLDivElement>(() => setOpen(false));

	const handleItemClick = (event: React.SyntheticEvent) => {
		if (closeOnItemClick) {
			setOpen(false);
			return;
		}

		const target = event.target as HTMLElement | null;
		const shouldClose = target?.closest('[data-close-dropdown="true"]');
		if (shouldClose) {
			setOpen(false);
		}
	};

	return (
		<div className={"relative text-black"} ref={dropdownRef}>
			{Tag && (
				<Tag
					className="cursor-pointer text-black transition-colors duration-200 hover:text-black-200"
					onClick={() => setOpen((prev) => !prev)}
					size={iconSize}
					weight={weight}
				/>
			)}
			{open && (
				<ul
					className={cn(
						"absolute top-10 mt-2 flex w-90 origin-top transform flex-col items-center rounded-2xl bg-white-200 p-0 shadow-lg transition-all duration-200 ease-out md:top-13",
						positionClasses[position],
						className,
						open
							? "translate-y-0 scale-100 opacity-100"
							: "pointer-events-none -translate-y-2 scale-95 opacity-0"
					)}
					onClick={handleItemClick}
				>
					{children}
				</ul>
			)}
		</div>
	);
};

export default IconDropdown;
