"use client";

import type React from "react";
import ExploreTabsContainer, {
	type ExploreTabsContainerProps,
} from "@/frontend/features/common/containers/ExploreTabsContainer";

type ExploreTabsProps = ExploreTabsContainerProps;

const ExploreTabs: React.FC<ExploreTabsProps> = ({
	activeTabId,
	className,
	defaultActiveTabId,
	name,
	onTabChange,
	setActiveTab,
	tabs,
}) => (
	<ExploreTabsContainer
		activeTabId={activeTabId}
		className={className}
		defaultActiveTabId={defaultActiveTabId}
		name={name}
		onTabChange={onTabChange}
		setActiveTab={setActiveTab}
		tabs={tabs}
	/>
);

export default ExploreTabs;
