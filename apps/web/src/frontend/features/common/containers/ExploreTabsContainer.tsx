"use client";

import { useState } from "react";
import ExploreTabsView, { type TabItem } from "../components/ExploreTabsView";

export interface ExploreTabsContainerProps {
	activeTabId?: string;
	className?: string;
	defaultActiveTabId?: string;
	name?: string;
	onTabChange?: (tab: string) => void;
	setActiveTab?: (tab: string) => void;
	tabs?: TabItem[];
}

const ExploreTabsContainer: React.FC<ExploreTabsContainerProps> = ({
	activeTabId,
	className,
	defaultActiveTabId = "tab1",
	name,
	onTabChange,
	setActiveTab,
	tabs,
}) => {
	const [internalActiveTabId, setInternalActiveTabId] =
		useState(defaultActiveTabId);
	const selectedTabId = activeTabId ?? internalActiveTabId;

	const handleTabChange = (tabId: string) => {
		if (activeTabId === undefined) {
			setInternalActiveTabId(tabId);
		}
		onTabChange?.(tabId);
		setActiveTab?.(tabId);
	};

	return (
		<ExploreTabsView
			activeTabId={selectedTabId}
			className={className}
			name={name}
			onTabChange={handleTabChange}
			tabs={tabs}
		/>
	);
};

export default ExploreTabsContainer;
