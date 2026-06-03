"use client";

import { PlusIcon } from "@phosphor-icons/react";
import type React from "react";
import { useCreateRoll } from "@/frontend/providers/CreateRollProvider";

const CreateNewRollCard: React.FC = () => {
	const { openCreator } = useCreateRoll();
	return (
		<button
			className="group relative flex h-64 w-full min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-gray-300 bg-white p-3 shadow-md transition-transform duration-200 hover:scale-[1.02] md:h-86 md:w-66.25"
			onClick={() => openCreator()}
			type="button"
		>
			<div className="pointer-events-none absolute inset-0 rounded-2xl bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

			<div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-gray-100 transition-colors group-hover:bg-gray-200">
				<PlusIcon
					className="text-gray-600 transition-colors group-hover:text-black"
					size={40}
					weight="bold"
				/>
				<p className="mt-2 font-medium text-gray-700 group-hover:text-black">
					Create New Roll
				</p>
			</div>
		</button>
	);
};

export default CreateNewRollCard;
