import SkeletonBlock from "./SkeletonBlock";

const ProfileRollCardFallback: React.FC = () => (
	<div className="h-72.5 w-42.5 rounded-2xl border border-gray-300 bg-white p-3 shadow-md md:w-66.25">
		<div className="grid grid-cols-2 grid-rows-2 gap-2.5">
			{[0, 1, 2, 3].map((preview) => (
				<SkeletonBlock
					className="aspect-square max-h-10 rounded-lg md:max-h-22.5"
					key={preview}
				/>
			))}
		</div>
		<SkeletonBlock className="mt-3 h-8 w-4/5 rounded-full" />
		<SkeletonBlock className="mt-2 h-4 w-24 rounded-full" />
	</div>
);

export default ProfileRollCardFallback;
