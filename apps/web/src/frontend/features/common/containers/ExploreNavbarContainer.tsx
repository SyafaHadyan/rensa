"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/frontend/services/profile.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";
import ExploreNavbarView from "../components/ExploreNavbarView";

const ExploreNavbarContainer = () => {
	const user = useAuthStore((state) => state.user);
	const { data: profile } = useQuery({
		queryKey: ["profile", user?.id],
		queryFn: () => fetchProfile(user?.id ?? ""),
		enabled: !!user?.id,
		staleTime: 1000 * 60 * 5,
	});

	return <ExploreNavbarView avatarUrl={profile?.avatarUrl} user={user} />;
};

export default ExploreNavbarContainer;
