"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import PrimaryButton from "@/frontend/components/buttons/PrimaryButton";
import TertiaryButton from "@/frontend/components/buttons/TertiaryButton";
import { api } from "@/lib/axios-client";
import { ROLL_NAME_MAX_LENGTH } from "@/shared/configs/content-limits.config";
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

	const createRoll = async (rollName: string) => {
		const trimmedName = rollName.trim();
		if (!trimmedName) {
			showToast("Roll name is required", "error");
			return;
		}

		try {
			const res = await api.post("/rolls", { name: trimmedName });

			showToast("Roll created successfully", "success");

			if (onRollCreate) {
				onRollCreate(res.data.data);
			}

			closeCreator();
		} catch {
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
					<form
						className="w-95 rounded-2xl bg-white p-6 shadow-xl"
						onSubmit={(event) => {
							event.preventDefault();
							createRoll(name).catch(() => undefined);
						}}
					>
						<h2 className="mb-4 font-semibold text-xl">Create New Roll</h2>

						<label className="font-medium text-sm">Roll Name</label>
						<input
							className="mt-1 mb-3 w-full rounded-lg border px-3 py-2"
							maxLength={ROLL_NAME_MAX_LENGTH}
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>
						<p className="text-gray-500 text-xs">
							{name.length}/{ROLL_NAME_MAX_LENGTH}
						</p>

						<div className="mt-5 flex justify-end gap-2">
							<TertiaryButton onClick={closeCreator} type="button">
								Cancel
							</TertiaryButton>
							<PrimaryButton disabled={!name.trim()} type="submit">
								Create
							</PrimaryButton>
						</div>
					</form>
				</div>
			)}
		</CreateRollContext.Provider>
	);
};
