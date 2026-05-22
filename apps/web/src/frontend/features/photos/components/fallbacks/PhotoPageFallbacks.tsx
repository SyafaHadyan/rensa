import Heading from "@/frontend/components/Heading";
import { cn } from "@/utils/cn";

const SKELETON_CARD_HEIGHTS = [
	300, 390, 250, 440, 330, 280, 410, 350, 270, 380,
];

interface SkeletonBlockProps {
	className?: string;
	style?: React.CSSProperties;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className, style }) => (
	<div
		className={cn("skeleton animate-pulse bg-[#D5D5D5]", className)}
		style={style}
	/>
);

export const PhotoPreviewFallback: React.FC = () => (
	<div className="relative flex w-full flex-col items-center justify-center gap-5">
		<SkeletonBlock className="h-10 w-10 self-start rounded-full" />
		<SkeletonBlock className="aspect-4/5 w-full max-w-2xl rounded-3xl" />
	</div>
);

export const ProfileBadgeFallback: React.FC<{ className?: string }> = ({
	className,
}) => (
	<span className={cn("inline-flex items-center gap-3", className)}>
		<SkeletonBlock className="h-8 w-8 rounded-full" />
		<SkeletonBlock className="h-4 w-28 rounded-full" />
	</span>
);

export const CommentsListFallback: React.FC = () => (
	<div className="space-y-4">
		{[0, 1, 2].map((item) => (
			<div className="flex items-start gap-3" key={item}>
				<SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
				<div className="w-full space-y-2">
					<SkeletonBlock className="h-3 w-24 rounded-full" />
					<SkeletonBlock className="h-3 w-full rounded-full" />
				</div>
			</div>
		))}
	</div>
);

export const CommentsFallback: React.FC = () => (
	<div>
		<SkeletonBlock className="mb-5 h-8 w-36 rounded-full" />
		<div className="mb-5 space-y-4">
			<CommentsListFallback />
		</div>
		<SkeletonBlock className="h-11 w-full rounded-2xl" />
	</div>
);

export const PhotoInfoCardFallback: React.FC = () => (
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

export const PhotoRecommendationsFallback: React.FC = () => (
	<div className="flex w-full flex-col items-start justify-start">
		<div className="my-masonry-grid w-full max-w-auto">
			{[0, 1, 2, 3, 4].map((column) => (
				<div className="my-masonry-grid_column" key={column}>
					{SKELETON_CARD_HEIGHTS.filter((_, index) => index % 5 === column).map(
						(height, index) => (
							<SkeletonBlock
								className="m-3 mb-5 max-w-[256px] rounded-3xl"
								key={`${column}-${height}-${index}`}
								style={{ height }}
							/>
						)
					)}
				</div>
			))}
		</div>
	</div>
);

const PhotoPageFallback: React.FC = () => (
	<div className="flex w-full flex-col items-center justify-center gap-10 bg-white-500 px-6.25 md:px-7.5 lg:px-17.5 xl:px-22.5 2xl:px-65">
		<div className="flex w-full flex-col items-start justify-center gap-16.75 pt-35 lg:flex-row">
			<div className="flex w-full flex-col items-center justify-center gap-2 md:items-start md:justify-start xl:w-auto">
				<PhotoPreviewFallback />
			</div>
			<PhotoInfoCardFallback />
		</div>
		<Heading className="text-primary" size="s">
			We thought you will like this
		</Heading>
		<PhotoRecommendationsFallback />
	</div>
);

export default PhotoPageFallback;
