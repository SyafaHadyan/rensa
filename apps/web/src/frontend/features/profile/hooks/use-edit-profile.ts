"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/frontend/providers/ToastProvider";
import { updateProfile } from "@/frontend/services/profile.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import {
	isAcceptedProfileAvatarFile,
	PROFILE_AVATAR_MAX_INPUT_SIZE_BYTES,
	PROFILE_AVATAR_MAX_INPUT_SIZE_MB,
} from "@/shared/configs/profile-avatar.config";
import type { EditableProfile, UpdatedProfile } from "../types";

interface UseEditProfileParams {
	initialProfile: EditableProfile;
	onProfileUpdate: (profile: EditableProfile) => void;
}

const getErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message;
		return typeof message === "string" ? message : "Failed to update profile";
	}
	return "Failed to update profile";
};

export function useEditProfile({
	initialProfile,
	onProfileUpdate,
}: UseEditProfileParams) {
	const [isOpen, setIsOpen] = useState(false);
	const [username, setUsername] = useState(initialProfile.username);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(
		initialProfile.avatarUrl
	);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const queryClient = useQueryClient();
	const { showToast } = useToast();
	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setUser);

	useEffect(() => {
		setUsername(initialProfile.username);
		setAvatarPreviewUrl(initialProfile.avatarUrl);
	}, [initialProfile.avatarUrl, initialProfile.username]);

	useEffect(
		() => () => {
			if (avatarPreviewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(avatarPreviewUrl);
			}
		},
		[avatarPreviewUrl]
	);

	const open = useCallback(() => {
		setUsername(initialProfile.username);
		setAvatarPreviewUrl(initialProfile.avatarUrl);
		setAvatarFile(null);
		setError("");
		setIsOpen(true);
	}, [initialProfile.avatarUrl, initialProfile.username]);

	const close = useCallback(() => {
		setIsOpen(false);
		setError("");
		setAvatarFile(null);
		setUsername(initialProfile.username);
		setAvatarPreviewUrl(initialProfile.avatarUrl);
	}, [initialProfile.avatarUrl, initialProfile.username]);

	const selectAvatar = useCallback(
		(file: File | null) => {
			setError("");
			if (!file) {
				setAvatarFile(null);
				setAvatarPreviewUrl(initialProfile.avatarUrl);
				return;
			}

			if (file.size > PROFILE_AVATAR_MAX_INPUT_SIZE_BYTES) {
				setError(
					`Image must be ${PROFILE_AVATAR_MAX_INPUT_SIZE_MB}MB or smaller.`
				);
				return;
			}
			if (!isAcceptedProfileAvatarFile(file)) {
				setError("Only JPG, PNG, or WebP files are allowed.");
				return;
			}

			setAvatarFile(file);
			setAvatarPreviewUrl((previousUrl) => {
				if (previousUrl?.startsWith("blob:")) {
					URL.revokeObjectURL(previousUrl);
				}
				return URL.createObjectURL(file);
			});
		},
		[initialProfile.avatarUrl]
	);

	const submit = useCallback(async () => {
		const trimmedUsername = username.trim();
		setError("");
		if (!trimmedUsername) {
			setError("Username is required.");
			return;
		}

		setIsSubmitting(true);
		try {
			const updatedProfile = (await updateProfile({
				avatar: avatarFile,
				userId: initialProfile.id,
				username: trimmedUsername,
			})) as UpdatedProfile;
			const nextProfile: EditableProfile = {
				avatarUrl: updatedProfile.avatarUrl,
				email: updatedProfile.email,
				id: updatedProfile.userId,
				username: updatedProfile.username,
			};

			onProfileUpdate(nextProfile);
			if (authUser?.id === initialProfile.id) {
				setAuthUser({
					...authUser,
					image: nextProfile.avatarUrl,
					name: nextProfile.username,
				});
			}
			await queryClient.invalidateQueries({
				queryKey: ["profile", initialProfile.id],
			});
			showToast("Profile updated successfully", "success");
			setIsOpen(false);
			setAvatarFile(null);
		} catch (submitError) {
			const message = getErrorMessage(submitError);
			setError(message);
			showToast(message, "error");
		} finally {
			setIsSubmitting(false);
		}
	}, [
		authUser,
		avatarFile,
		initialProfile.id,
		onProfileUpdate,
		queryClient,
		setAuthUser,
		showToast,
		username,
	]);

	return {
		avatarPreviewUrl,
		close,
		error,
		isOpen,
		isSubmitting,
		open,
		selectAvatar,
		setUsername,
		submit,
		username,
	};
}
