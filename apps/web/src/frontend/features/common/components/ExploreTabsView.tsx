"use client";

import type React from "react";
import { tabDatas } from "@/frontend/data/exploreDatas";
import { cn } from "@/utils/cn";
import "@/frontend/components/tabs/ExploreTabs.css";

export interface TabItem {
	id: string;
	label: string;
}

interface ExploreTabsViewProps {
	activeTabId: string;
	className?: string;
	name?: string;
	onTabChange: (tabId: string) => void;
	tabs?: TabItem[];
}

const ExploreTabsView: React.FC<ExploreTabsViewProps> = ({
	className,
	activeTabId,
	name = "tabs",
	onTabChange,
	tabs = tabDatas,
}) => (
	<div className={cn("tabs tabs-border gap-5", className)} role="tablist">
		{tabs.map((tab) => (
			<input
				aria-label={tab.label}
				checked={activeTabId === tab.id}
				className="tab text-[14px] text-primary transition-all duration-300 hover:text-black-300 md:text-[20px]"
				key={tab.id}
				name={name}
				onChange={() => onTabChange(tab.id)}
				type="radio"
			/>
		))}
	</div>
);

export default ExploreTabsView;
