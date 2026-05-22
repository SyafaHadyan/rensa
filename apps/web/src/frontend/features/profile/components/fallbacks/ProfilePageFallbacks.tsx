import { cn } from "@/utils/cn";

const CREATED_PHOTO_HEIGHTS = [
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

export const ProfileHeaderFallback: React.FC = () => (
	<header className="flex flex-col items-center">
		<SkeletonBlock className="h-32.75 w-32.75 rounded-full" />
		<SkeletonBlock className="mt-4 h-14 w-72 max-w-full rounded-full" />
		<div className="mt-4 flex flex-row items-center justify-center gap-4">
			<SkeletonBlock className="h-11 w-11 rounded-full" />
			<SkeletonBlock className="h-11 w-28 rounded-full" />
		</div>
	</header>
);

export const ProfileControlsFallback: React.FC = () => (
	<div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between">
		<div className="flex gap-3">
			<SkeletonBlock className="h-11 w-24 rounded-full" />
			<SkeletonBlock className="h-11 w-28 rounded-full" />
		</div>
		<SkeletonBlock className="h-11 w-36 rounded-full" />
	</div>
);

export const ProfileRollListFallback: React.FC = () => (
	<div className="flex flex-wrap items-start gap-x-4 gap-y-6">
		{[0, 1, 2, 3, 4, 5].map((item) => (
			<div
				className="h-72.5 w-42.5 rounded-2xl border border-gray-300 bg-white p-3 shadow-md md:w-66.25"
				key={item}
			>
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
		))}
	</div>
);

export const ProfileCreatedPhotosFallback: React.FC = () => (
	<section
		aria-label="Loading created photos"
		className="flex w-full flex-col items-start justify-start"
	>
		<div className="my-masonry-grid w-full max-w-auto">
			{[0, 1, 2, 3, 4].map((column) => (
				<div className="my-masonry-grid_column" key={column}>
					{CREATED_PHOTO_HEIGHTS.filter((_, index) => index % 5 === column).map(
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
	</section>
);

const ProfilePageFallback: React.FC = () => (
	<div className="flex min-h-screen w-full flex-col items-center justify-start bg-white py-16">
		<ProfileHeaderFallback />
		<div className="mt-10 flex w-full flex-col gap-8 px-6 md:px-12 lg:px-30 xl:mt-0">
			<ProfileControlsFallback />
			<ProfileRollListFallback />
		</div>
	</div>
);

export default ProfilePageFallback;
