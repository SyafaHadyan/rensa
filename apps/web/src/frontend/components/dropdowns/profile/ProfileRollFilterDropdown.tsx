"use client";

import type React from "react";
import type { SortOption } from "@/frontend/services/roll.service";
import TertiaryDropdown from "../TertiaryDropdown";

interface ProfileRollFilterDropdownProps {
	setFilter?: (filter: SortOption) => void;
}

const filterValues = ["Latest", "Oldest"];

function toSortOption(value: string): SortOption {
	return value === "Oldest" ? "oldest" : "latest";
}

const ProfileRollFilterDropdown: React.FC<ProfileRollFilterDropdownProps> = ({
	setFilter,
}) => (
	<TertiaryDropdown
		className="w-35"
		initialValue={"Latest"}
		onChange={(value) => setFilter?.(toSortOption(value))}
		values={filterValues}
	/>
);

export default ProfileRollFilterDropdown;
