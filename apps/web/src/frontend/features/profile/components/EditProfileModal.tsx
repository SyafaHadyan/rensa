"use client";

import Image from "next/image";
import type React from "react";
import PrimaryButton from "@/frontend/components/buttons/PrimaryButton";
import TertiaryButton from "@/frontend/components/buttons/TertiaryButton";
import TextInput from "@/frontend/components/inputfields/TextInputField";
import ModalFrame from "@/frontend/components/modal/ModalFrame";
import ProfileAvatar from "@/frontend/components/ProfileAvatar";
import { PROFILE_AVATAR_ACCEPT_ATTRIBUTE } from "@/shared/configs/profile-avatar.config";

interface EditProfileModalProps {
	avatarPreviewUrl?: string;
	error: string;
	isSubmitting: boolean;
	onAvatarChange: (file: File | null) => void;
	onClose: () => void;
	onSubmit: () => void;
	onUsernameChange: (username: string) => void;
	username: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
	avatarPreviewUrl,
	error,
	isSubmitting,
	onAvatarChange,
	onClose,
	onSubmit,
	onUsernameChange,
	username,
}) => (
	<ModalFrame
		className="max-w-lg"
		footer={
			<div className="flex justify-end gap-3">
				<TertiaryButton disabled={isSubmitting} onClick={onClose}>
					Cancel
				</TertiaryButton>
				<PrimaryButton disabled={isSubmitting} onClick={onSubmit}>
					{isSubmitting ? "Saving" : "Save"}
				</PrimaryButton>
			</div>
		}
		onClose={onClose}
		title="Edit Profile"
	>
		<div className="flex flex-col gap-5">
			<div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 border-dashed bg-gray-50 px-5 py-6">
				<label className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-full bg-gray-200 hover:bg-black/50">
					{avatarPreviewUrl ? (
						<Image
							alt="Profile avatar preview"
							className="object-cover"
							fill
							sizes="112px"
							src={avatarPreviewUrl}
						/>
					) : (
						<ProfileAvatar
							alt="Profile avatar preview"
							className="h-full w-full"
							sizes="112px"
						/>
					)}
					<span className="absolute inset-0 flex items-center justify-center bg-black/45 font-figtree text-sm text-white opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
						Change
					</span>
					<input
						accept={PROFILE_AVATAR_ACCEPT_ATTRIBUTE}
						className="sr-only"
						onChange={(event) =>
							onAvatarChange(event.currentTarget.files?.[0] ?? null)
						}
						type="file"
					/>
				</label>
				<span className="font-figtree font-semibold text-primary text-sm">
					Change profile picture
				</span>
				<span className="font-figtree text-[12px] text-black-300">
					JPG, PNG, or WebP up to 4MB
				</span>
			</div>

			<TextInput
				disabled={isSubmitting}
				label="Username"
				onChange={(event) => onUsernameChange(event.currentTarget.value)}
				value={username}
			/>

			{error && (
				<p className="rounded-xl bg-red-50 px-4 py-3 font-figtree text-red-700 text-sm">
					{error}
				</p>
			)}
		</div>
	</ModalFrame>
);

export default EditProfileModal;
