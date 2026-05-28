"use client";

import type React from "react";
import { cn } from "@/utils/cn";

interface ModalFrameProps {
	children: React.ReactNode;
	className?: string;
	footer?: React.ReactNode;
	onClose: () => void;
	title: string;
}

const ModalFrame: React.FC<ModalFrameProps> = ({
	children,
	className,
	footer,
	onClose,
	title,
}) => (
	<div
		aria-modal="true"
		className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 text-black"
		onMouseDown={(event) => {
			if (event.target === event.currentTarget) {
				onClose();
			}
		}}
		role="dialog"
	>
		<div
			className={cn(
				"w-full max-w-md rounded-2xl bg-white p-6 shadow-xl",
				className
			)}
		>
			<h2 className="mb-4 font-semibold text-xl">{title}</h2>
			{children}
			{footer && <div className="mt-5">{footer}</div>}
		</div>
	</div>
);

export default ModalFrame;
