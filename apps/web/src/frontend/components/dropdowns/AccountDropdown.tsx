"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { accountDropdownDatas } from "@/frontend/data/accountDropdownDatas";
import { cn } from "@/utils/cn";
import ProfileAvatar from "../ProfileAvatar";
import Text from "../Text";
import DropdownItem from "./DropdownItem";
import IconDropdown from "./IconDropdown";

interface AccountDropdownProps {
	src?: string | null;
	user?: {
		id?: string | null | undefined;
		name?: string | null | undefined;
		email?: string | null | undefined;
		image?: string | null | undefined;
	} | null;
}

const AccountDropdown = ({ src, user }: AccountDropdownProps) => (
	<div className="relative z-50">
		<IconDropdown
			closeOnItemClick={false}
			iconSize={24}
			position="left"
			Tag={CaretDownIcon}
			weight="regular"
		>
			<DropdownItem
				className="flex flex-col items-start justify-start gap-2 rounded-t-2xl"
				href={`/profile/${user?.id}`}
			>
				<div className="flex flex-row items-center justify-center gap-3">
					<ProfileAvatar
						alt="Profile"
						className="h-10 w-10 md:h-12 md:w-12"
						sizes="48px"
						src={src}
					/>
					<div className="flex flex-col items-start justify-center">
						<Text size="s">{user?.name}</Text>
						<Text className="font-light text-gray-600" size="s">
							Free Plan
						</Text>
					</div>
				</div>
			</DropdownItem>
			<div className="my-2 w-[90%] border-white-700 border-t" />
			{accountDropdownDatas.map((item, idx) => (
				<DropdownItem
					className={cn(
						idx === accountDropdownDatas.length - 1 && "rounded-b-2xl"
					)}
					href={item.href}
					key={idx}
				>
					<item.icon className="mr-2 h-6 w-6" />
					<Text size="s">{item.title}</Text>
				</DropdownItem>
			))}
		</IconDropdown>
	</div>
);

export default AccountDropdown;
