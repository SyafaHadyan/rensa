"use client";

import Link from "next/link";
import BookmarkButton from "@/frontend/components/buttons/BookmarkButton";
import PrimaryButton from "@/frontend/components/buttons/PrimaryButton";
import ProfileButton from "@/frontend/components/buttons/ProfileIconButton";
import SecondaryButton from "@/frontend/components/buttons/SecondaryButton";
import TertiaryButton from "@/frontend/components/buttons/TertiaryButton";
import AccountDropdown from "@/frontend/components/dropdowns/AccountDropdown";
import NotificationDropdown from "@/frontend/components/dropdowns/notification/NotificationDropdown";
import Heading from "@/frontend/components/Heading";
import Logo from "@/frontend/components/icons/Logo";

interface ExploreNavbarUser {
	email?: string | null;
	id?: string | null;
	image?: string | null;
	name?: string | null;
}

interface ExploreNavbarViewProps {
	avatarUrl?: string;
	user?: ExploreNavbarUser | null;
}

const ExploreNavbarView = ({ avatarUrl, user }: ExploreNavbarViewProps) => (
	<nav className="fixed top-5 left-1/2 z-20 flex h-14 w-[90%] -translate-x-1/2 items-center justify-between rounded-[48px] bg-white-200 text-black shadow-lg md:h-18 lg:w-[70%]">
		<div className="ml-2 flex flex-row items-center gap-1 lg:ml-6 lg:gap-4">
			<Logo size="s" />
			<Link className="hidden lg:block" href="/explore">
				<Heading size="s">Rensa</Heading>
			</Link>
		</div>
		<div className="mr-6 flex flex-row items-center justify-center gap-6">
			<span className="inline-flex items-center gap-2">
				{user ? (
					<>
						<SecondaryButton href="/upload">Create</SecondaryButton>
						<span className="flex">
							<NotificationDropdown />
							<BookmarkButton />
						</span>
						<ProfileButton
							alt={user.name ?? "Profile"}
							href={`/profile/${user.id}`}
							src={avatarUrl || user.image}
						/>
						<AccountDropdown src={avatarUrl || user.image} user={user} />
					</>
				) : (
					<>
						<PrimaryButton href="/login" type="button">
							Login
						</PrimaryButton>
						<TertiaryButton href="/register" type="button">
							Sign Up
						</TertiaryButton>
					</>
				)}
			</span>
		</div>
	</nav>
);

export type { ExploreNavbarUser };
export default ExploreNavbarView;
