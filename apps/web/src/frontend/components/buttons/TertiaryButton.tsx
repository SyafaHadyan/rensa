import type React from "react";
import { cn } from "@/utils/cn";
import Button, { type ButtonProps } from "./Button";

const TertiaryButton: React.FC<ButtonProps> = ({
	id,
	className,
	children,
	href,
	onClick,
	type,
	disabled,
}) => (
	<Button
		className={cn(
			"btn-ghost border border-primary text-primary hover:border-white-600 hover:bg-transparent hover:text-black-200",
			className
		)}
		disabled={disabled}
		href={href}
		id={id}
		onClick={onClick}
		type={type}
	>
		{children}
	</Button>
);

export default TertiaryButton;
