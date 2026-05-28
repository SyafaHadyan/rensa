"use client";

import type React from "react";
import { useEditRoll } from "@/frontend/providers/EditRollProvider";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import RollCardView from "../components/RollCardView";

const DEFAULT_ROLL_NAME = "All Photos";

export interface RollCardContainerProps {
	createdAt?: string;
	id: string;
	imageUrls?: string[];
	name: string;
	userId?: string;
}

const RollCardContainer: React.FC<RollCardContainerProps> = ({
	id,
	userId,
	name,
	imageUrls,
	createdAt,
}) => {
	const { user } = useAuthStore();
	const isOwner = user?.id === userId;
	const canDelete = name !== DEFAULT_ROLL_NAME;
	const { openEditor } = useEditRoll();

	const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		openEditor({ canDelete, rollId: id, name, type: "default" });
	};

	return (
		<RollCardView
			createdAt={createdAt}
			id={id}
			imageUrls={(imageUrls ?? []).filter(
				(url) => url.startsWith("/") || url.startsWith("http")
			)}
			isOwner={isOwner}
			name={name}
			onEdit={handleEdit}
		/>
	);
};

export default RollCardContainer;
