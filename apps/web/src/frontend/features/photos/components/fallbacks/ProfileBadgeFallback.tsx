import { cn } from "@/utils/cn";
import SkeletonBlock from "./SkeletonBlock";

interface ProfileBadgeFallbackProps {
	className?: string;
}

const ProfileBadgeFallback: React.FC<ProfileBadgeFallbackProps> = ({
	className,
}) => (
	<span className={cn("inline-flex items-center gap-3", className)}>
		<SkeletonBlock className="h-8 w-8 rounded-full" />
		<SkeletonBlock className="h-4 w-28 rounded-full" />
	</span>
);

export default ProfileBadgeFallback;
