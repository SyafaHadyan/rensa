"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useContext, useState } from "react";
import Button from "@/frontend/components/buttons/Button";
import PrimaryButton from "@/frontend/components/buttons/PrimaryButton";
import TertiaryButton from "@/frontend/components/buttons/TertiaryButton";
import { api } from "@/lib/axios-client";
import { ROLL_NAME_MAX_LENGTH } from "@/shared/configs/content-limits.config";
import { cn } from "@/utils/cn";
import { useToast } from "./ToastProvider";

interface EditRollState {
	callbackUrl?: string;
	canDelete?: boolean;
	name: string;
	rollId: string;
	type: "deleting" | "renaming" | "default";
}

interface EditRollContextType {
	closeEditor: () => void;
	isOpen: boolean;
	openEditor: (roll: EditRollState) => void;
	removeRoll: (rollId: string, callbackUrl?: string) => Promise<void>;
	roll: EditRollState | null;
	saveChanges: (rollId: string, name: string) => Promise<void>;
}

const EditRollContext = createContext<EditRollContextType | undefined>(
	undefined
);

export const useEditRoll = () => {
	const ctx = useContext(EditRollContext);
	if (!ctx) {
		throw new Error("useEditRoll must be used within EditRollProvider");
	}
	return ctx;
};

interface EditRollProviderProps {
	children: ReactNode;
	onRollDelete?: (rollId: string) => void;
	onRollUpdate?: (roll: EditRollState) => void;
}

export const EditRollProvider = ({
	children,
	onRollUpdate,
	onRollDelete,
}: EditRollProviderProps) => {
	const [type, setType] = useState<"deleting" | "renaming" | "default">(
		"default"
	);
	const [isOpen, setIsOpen] = useState(false);
	const [roll, setRoll] = useState<EditRollState | null>(null);
	const [name, setName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const { showToast } = useToast();
	const router = useRouter();

	const openEditor = (roll: EditRollState) => {
		setType(roll.type);
		if (roll.type === "deleting") {
			setIsDeleting(true);
		} else if (roll.type === "renaming") {
			setIsDeleting(false);
		}
		setRoll(roll);
		setName(roll.name);
		setIsOpen(true);
	};

	const closeEditor = () => {
		setIsOpen(false);
		setRoll(null);
		setName("");
		setIsDeleting(false);
	};
	const removeRoll = async (rollId: string, callbackUrl?: string) => {
		if (roll?.canDelete === false) {
			showToast("The All Photos roll cannot be deleted", "error");
			return;
		}

		try {
			await api.delete(`/rolls/${rollId}`);
			showToast("Roll deleted successfully", "success");

			if (onRollDelete) {
				onRollDelete(rollId);
			}

			closeEditor();

			if (callbackUrl) {
				router.push(callbackUrl);
			}
		} catch (err) {
			showToast("Failed to delete roll", "error");
			console.error("Failed to delete roll:", err);
		}
	};
	const saveChanges = async (rollId: string, rollName: string) => {
		const trimmedName = rollName.trim();
		if (!trimmedName) {
			showToast("Roll name is required", "error");
			return;
		}

		try {
			await api.patch(`/rolls/${rollId}`, { name: trimmedName });

			if (onRollUpdate) {
				onRollUpdate({ rollId, name: trimmedName, type: "default" });
			}

			closeEditor();
			showToast("Roll updated successfully", "success");
		} catch (err) {
			showToast("Failed to update roll", "error");
			console.error("Failed to update roll:", err);
		}
	};

	return (
		<EditRollContext.Provider
			value={{ isOpen, roll, openEditor, closeEditor, saveChanges, removeRoll }}
		>
			{children}

			{isOpen && roll && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-black">
					<div className="w-95 rounded-2xl bg-white p-6 shadow-xl">
						{isDeleting ? (
							<>
								<h2 className="mb-4 font-semibold text-xl">
									Are you sure you want to delete this roll?
								</h2>
								<div className="mt-5 flex justify-end gap-2">
									<Button
										className="bg-red-600 text-white hover:bg-red-700"
										onClick={() => {
											closeEditor();
											removeRoll(roll.rollId, roll.callbackUrl);
										}}
									>
										Yes
									</Button>
									<TertiaryButton
										onClick={() => {
											if (type === "deleting") {
												closeEditor();
											} else {
												setIsDeleting(false);
											}
										}}
									>
										No
									</TertiaryButton>
								</div>
							</>
						) : (
							<>
								<h2 className="mb-4 font-semibold text-xl">Edit Roll</h2>
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
								<div
									className={cn(
										"mt-5 flex gap-2",
										type === "default" ? "justify-between" : "justify-end"
									)}
								>
									{type === "default" && roll.canDelete !== false && (
										<Button
											className="bg-red-600 text-white hover:bg-red-700"
											onClick={() => setIsDeleting(true)}
										>
											Delete
										</Button>
									)}
									<div className={"flex flex-row gap-2"}>
										<TertiaryButton onClick={closeEditor}>
											Cancel
										</TertiaryButton>
										<PrimaryButton
											disabled={!name.trim()}
											onClick={() => {
												saveChanges(roll.rollId, name);
											}}
										>
											Save
										</PrimaryButton>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</EditRollContext.Provider>
	);
};
