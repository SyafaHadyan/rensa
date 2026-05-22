import SkeletonBlock from "./SkeletonBlock";

const ProfileHeaderFallback: React.FC = () => (
	<header className="flex flex-col items-center">
		<SkeletonBlock className="h-32.75 w-32.75 rounded-full" />
		<SkeletonBlock className="mt-4 h-14 w-72 max-w-full rounded-full" />
		<div className="mt-4 flex flex-row items-center justify-center gap-4">
			<SkeletonBlock className="h-11 w-11 rounded-full" />
			<SkeletonBlock className="h-11 w-28 rounded-full" />
		</div>
	</header>
);

export default ProfileHeaderFallback;
