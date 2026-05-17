import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/frontend/providers/ToastProvider";
import {
	addPhotoToRoll,
	fetchDefaultRoll,
	fetchIsSavedToRolls,
	removePhotoFromRoll,
} from "@/frontend/services/roll.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";

interface DefaultRoll {
	name: string;
	rollId: string;
}

export function usePhotoRoll(photoId: string | null) {
	const { showToast } = useToast();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	const [selectedRoll, setSelectedRoll] = useState<{
		rollId: string;
		name: string;
	} | null>(null);

	// -----------------------
	// Fetch DEFAULT ROLL
	// -----------------------
	const { data: defaultRoll } = useQuery<DefaultRoll>({
		queryKey: ["defaultRoll"],
		queryFn: fetchDefaultRoll,
		enabled: !!user?.id,
	});

	// Set selected roll once default roll is loaded
	useEffect(() => {
		if (defaultRoll && !selectedRoll) {
			setSelectedRoll({
				rollId: defaultRoll.rollId,
				name: defaultRoll.name,
			});
		}
	}, [defaultRoll, selectedRoll]);

	// -----------------------
	// Fetch rolls containing this photo
	// -----------------------
	const { data: savedToRolls = [] } = useQuery({
		queryKey: ["savedRolls", photoId],
		queryFn: async () => {
			if (!photoId) {
				return [];
			}
			const res = await fetchIsSavedToRolls(photoId);
			return res || [];
		},
		enabled: !!photoId && !!user?.id,
	});

	// -----------------------
	// Add photo to roll
	// -----------------------
	const saveMutation = useMutation({
		mutationFn: (rollId: string) => addPhotoToRoll(rollId, photoId || ""),
		onSuccess: async () => {
			showToast("Photo added to roll", "success");
			await queryClient.invalidateQueries({
				queryKey: ["savedRolls", photoId],
			});
		},
		onError: () => {
			showToast("Failed to add photo", "error");
		},
		onMutate: async (rollId: string) => {
			await queryClient.cancelQueries({ queryKey: ["savedRolls", photoId] });
			const previousSavedRolls = queryClient.getQueryData<string[]>([
				"savedRolls",
				photoId,
			]);
			queryClient.setQueryData<string[]>(
				["savedRolls", photoId],
				(old = []) => {
					if (!old.includes(rollId)) {
						return [...old, rollId];
					}
					return old;
				}
			);
			return { previousSavedRolls };
		},
	});

	// -----------------------
	// Remove photo from roll
	// -----------------------
	const removeMutation = useMutation({
		mutationFn: (rollId: string) => removePhotoFromRoll(rollId, photoId || ""),
		onSuccess: async () => {
			showToast("Photo removed from roll", "success");
			await queryClient.invalidateQueries({
				queryKey: ["savedRolls", photoId],
			});
		},
		onError: () => {
			showToast("Failed to remove photo", "error");
		},
	});

	// -----------------------
	// Check if photo is in default roll
	// -----------------------
	return {
		selectedRoll,
		isLoading: saveMutation.isPending || removeMutation.isPending,
		isSaved: selectedRoll ? savedToRolls.includes(selectedRoll.rollId) : false,
		savedToRolls,
		setSelectedRoll,
		saveToRoll: () => selectedRoll && saveMutation.mutate(selectedRoll.rollId),
		removeFromRoll: () =>
			selectedRoll && removeMutation.mutate(selectedRoll.rollId),
	};
}

export default usePhotoRoll;
