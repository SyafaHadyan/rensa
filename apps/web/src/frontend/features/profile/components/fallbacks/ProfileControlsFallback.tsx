import SkeletonBlock from "./SkeletonBlock";

const ProfileControlsFallback: React.FC = () => (
	<div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between">
		<div className="flex gap-3">
			<SkeletonBlock className="h-11 w-24 rounded-full" />
			<SkeletonBlock className="h-11 w-28 rounded-full" />
		</div>
		<SkeletonBlock className="h-11 w-36 rounded-full" />
	</div>
);

export default ProfileControlsFallback;
