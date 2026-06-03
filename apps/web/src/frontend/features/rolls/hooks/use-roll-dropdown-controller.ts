import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutsideClick } from "@/frontend/features/common/hooks/use-outside-click";
import { useToast } from "@/frontend/providers/ToastProvider";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import { useRollsStore } from "@/frontend/stores/useRollsStore";
import { ROLL_NAME_MAX_LENGTH } from "@/shared/configs/content-limits.config";

interface UseRollDropdownControllerParams {
	closeAll?: () => void;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useRollDropdownController<TButtonElement extends HTMLElement>({
	closeAll,
	isOpen,
	setIsOpen,
}: UseRollDropdownControllerParams) {
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
	const [isCreating, setIsCreating] = useState(false);
	const [newRollName, setNewRollName] = useState("");
	const router = useRouter();
	const { rolls, fetchRolls, isLoading, createRoll } = useRollsStore();
	const { showToast } = useToast();
	const { user } = useAuthStore();

	const buttonRef = useRef<TButtonElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const dropdownRef = useOutsideClick<HTMLDivElement>((event: MouseEvent) => {
		setIsCreating(false);
		setNewRollName("");
		if (buttonRef.current?.contains(event.target as Node)) {
			return;
		}
		closeAll?.();
	});

	const closeDropdown = useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	const updateDropdownPosition = useCallback(() => {
		const button = buttonRef.current;
		const dropdown = dropdownRef.current;

		if (!(button && dropdown)) {
			return;
		}

		const buttonRect = button.getBoundingClientRect();
		const dropdownRect = dropdown.getBoundingClientRect();
		setDropdownPosition({
			top: buttonRect.bottom + window.scrollY + 4,
			left:
				buttonRect.left +
				window.scrollX +
				buttonRect.width / 2 -
				dropdownRect.width / 2,
		});
	}, [dropdownRef]);

	useEffect(() => {
		if (isCreating && listRef.current) {
			const list = listRef.current;
			list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
		}
	}, [isCreating]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		fetchRolls().catch(() => undefined);
		updateDropdownPosition();
	}, [fetchRolls, isOpen, updateDropdownPosition]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		window.addEventListener("resize", closeDropdown, { passive: true });
		return () => {
			window.removeEventListener("resize", closeDropdown);
		};
	}, [closeDropdown, isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleScroll = () => {
			const dropdown = dropdownRef.current;
			if (!dropdown) {
				return;
			}

			const rect = dropdown.getBoundingClientRect();
			const completelyOutOfView =
				rect.bottom < 0 || rect.top > window.innerHeight;

			if (completelyOutOfView) {
				closeDropdown();
				return;
			}

			updateDropdownPosition();
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [closeDropdown, dropdownRef, isOpen, updateDropdownPosition]);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (!user?.id) {
			router.push("/login");
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		setIsOpen((prev) => !prev);
	};

	const handleCreate = () => {
		setIsCreating(true);
		setNewRollName("");
	};

	const handleCreateRoll = async () => {
		const trimmedName = newRollName.trim();
		if (!trimmedName) {
			return;
		}
		try {
			await createRoll({ name: trimmedName.slice(0, ROLL_NAME_MAX_LENGTH) });
			showToast("Roll created successfully", "success");
		} catch {
			showToast("Failed to create roll", "error");
		} finally {
			setIsCreating(false);
			setNewRollName("");
		}
	};

	return {
		buttonRef,
		dropdownPosition,
		dropdownRef,
		handleClick,
		handleCreate,
		handleCreateRoll,
		isCreating,
		isLoading,
		listRef,
		newRollName,
		rolls,
		setIsCreating,
		setNewRollName,
	};
}
