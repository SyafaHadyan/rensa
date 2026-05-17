"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import PrimaryButton from "@/frontend/components/buttons/PrimaryButton";
import TertiaryButton from "@/frontend/components/buttons/TertiaryButton";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import { api } from "@/lib/axios-client";
import type { SelectedRoll } from "../types/roll";
import { useToast } from "./ToastProvider";

interface CreateRollContextType {
	closeCreator: () => void;
	createRoll: (name: string) => Promise<void>;
	isOpen: boolean;
	openCreator: () => void;
}

const CreateRollContext = createContext<CreateRollContextType | undefined>(
	undefined
);

export const useCreateRoll = () => {
	const ctx = useContext(CreateRollContext);
	if (!ctx) {
		throw new Error("useCreateRoll must be used within CreateRollProvider");
	}
	return ctx;
};

interface CreateRollProviderProps {
	children: ReactNode;
	onRollCreate?: (roll: SelectedRoll) => void;
}

export const CreateRollProvider = ({
	children,
	onRollCreate,
}: CreateRollProviderProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { user } = useAuthStore();
	const [name, setName] = useState("");
	const { showToast } = useToast();

	const openCreator = () => {
		setName("");
		setIsOpen(true);
	};

	const closeCreator = () => {
		setIsOpen(false);
		setName("");
	};

	const createRoll = async (name: string) => {
		try {
			const res = await api.post("/rolls", { name, userId: user?.id });

			showToast("Roll created successfully", "success");

			if (onRollCreate) {
				onRollCreate(res.data.data);
			}

			closeCreator();
		} catch (err) {
			console.error("Failed to create roll:", err);
			showToast("Failed to create roll", "error");
		}
	};

	return (
		<CreateRollContext.Provider
			value={{ isOpen, openCreator, closeCreator, createRoll }}
		>
			{children}

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-black">
					<div className="w-95 rounded-2xl bg-white p-6 shadow-xl">
						<h2 className="mb-4 font-semibold text-xl">Create New Roll</h2>

						<label className="font-medium text-sm">Roll Name</label>
						<input
							className="mt-1 mb-3 w-full rounded-lg border px-3 py-2"
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>

						<div className="mt-5 flex justify-end gap-2">
							<TertiaryButton onClick={closeCreator}>Cancel</TertiaryButton>
							<PrimaryButton
								onClick={() => {
									closeCreator();
									createRoll(name);
								}}
							>
								Create
							</PrimaryButton>
						</div>
					</div>
				</div>
			)}
		</CreateRollContext.Provider>
	);
};
