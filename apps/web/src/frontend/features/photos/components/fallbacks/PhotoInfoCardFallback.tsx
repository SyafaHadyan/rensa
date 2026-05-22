import CommentsFallback from "./CommentsFallback";
import ProfileBadgeFallback from "./ProfileBadgeFallback";
import SkeletonBlock from "./SkeletonBlock";

const PhotoInfoCardFallback: React.FC = () => (
	<div className="flex w-full flex-col gap-7 rounded-3xl bg-white-200 p-10 text-primary shadow-lg lg:max-w-3xl xl:w-[40%]">
		<div className="inline-flex w-full items-center justify-between">
			<SkeletonBlock className="h-10 w-24 rounded-full" />
			<div className="inline-flex gap-3">
				<SkeletonBlock className="h-10 w-10 rounded-full" />
				<SkeletonBlock className="h-10 w-20 rounded-full" />
				<SkeletonBlock className="h-10 w-10 rounded-full" />
			</div>
		</div>
		<div>
			<SkeletonBlock className="mb-3 h-4 w-28 rounded-full" />
			<SkeletonBlock className="mb-7 h-12 w-72 max-w-full rounded-full" />
			<ProfileBadgeFallback className="mb-5" />
			<div className="space-y-2">
				<SkeletonBlock className="h-4 w-full rounded-full" />
				<SkeletonBlock className="h-4 w-4/5 rounded-full" />
			</div>
		</div>
		<div className="space-y-3">
			{[0, 1, 2, 3].map((item) => (
				<div className="flex justify-between gap-6" key={item}>
					<SkeletonBlock className="h-4 w-24 rounded-full" />
					<SkeletonBlock className="h-4 w-32 rounded-full" />
				</div>
			))}
		</div>
		<CommentsFallback />
	</div>
);

export default PhotoInfoCardFallback;
