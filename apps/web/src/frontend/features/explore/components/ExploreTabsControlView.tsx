"use client";

import type React from "react";
import ExploreTabs from "@/frontend/components/tabs/ExploreTabs";

interface ExploreTabsControlViewProps {
	activeTabId: string;
	className?: string;
	onTabChange: (tabId: string) => void;
}

const ExploreTabsControlView: React.FC<ExploreTabsControlViewProps> = ({
	activeTabId,
	className,
	onTabChange,
}) => (
	<ExploreTabs
		activeTabId={activeTabId}
		className={className}
		name="explore_tabs"
		onTabChange={onTabChange}
	/>
);

export default ExploreTabsControlView;
