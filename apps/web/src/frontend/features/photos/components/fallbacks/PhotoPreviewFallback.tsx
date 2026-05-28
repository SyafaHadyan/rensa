import SkeletonBlock from "./SkeletonBlock";

const PhotoPreviewFallback: React.FC = () => (
	<div className="relative flex w-full flex-col items-center justify-center gap-5">
		<SkeletonBlock className="h-10 w-10 self-start rounded-full" />
		<SkeletonBlock className="h-[34rem] w-full max-w-2xl rounded-3xl md:h-[42rem] lg:w-[42rem]" />
	</div>
);

export default PhotoPreviewFallback;
