"use client";

import { useState } from "react";
import ExplorePageView from "../components/ExplorePageView";

const ExplorePageContainer: React.FC = () => {
	const [activeTabId, setActiveTabId] = useState("tab1");
	const [activeFilters, setActiveFilters] = useState<string[]>([]);

	const handleToggleFilter = (filterId: string) => {
		if (filterId === "all") {
			setActiveFilters([]);
			return;
		}

		setActiveFilters((previousFilters) =>
			previousFilters.includes(filterId)
				? previousFilters.filter((filter) => filter !== filterId)
				: [...previousFilters, filterId]
		);
	};

	return (
		<ExplorePageView
			controlsModel={{
				activeFilters,
				activeTabId,
				onClearFilters: () => setActiveFilters([]),
				onTabChange: setActiveTabId,
				onToggleFilter: handleToggleFilter,
			}}
		/>
	);
};

export default ExplorePageContainer;
