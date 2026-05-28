import Link from "next/link";
import React from "react";
import { cn } from "@/utils/cn";

interface DropdownItemProps {
	children: React.ReactNode;
	className?: string;
	href?: string;
	onClick?: () => void;
}
const DropdownItem = React.forwardRef<HTMLLIElement, DropdownItemProps>(
	({ href, children, className, onClick }, ref) => {
		const itemClassName = cn(
			"flex w-full cursor-pointer px-3 py-2 text-left hover:bg-gray-200 active:bg-white-600",
			className
		);

		return (
			<li className="w-full" ref={ref}>
				{href ? (
					<Link className={itemClassName} href={href} onClick={onClick}>
						{children}
					</Link>
				) : (
					<button className={itemClassName} onClick={onClick} type="button">
						{children}
					</button>
				)}
			</li>
		);
	}
);
DropdownItem.displayName = "DropdownItem";
export default DropdownItem;
