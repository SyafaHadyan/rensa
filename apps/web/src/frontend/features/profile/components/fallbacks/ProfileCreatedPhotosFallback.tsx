import SkeletonBlock from "./SkeletonBlock";

const CREATED_PHOTO_HEIGHTS = [
	300, 390, 250, 440, 330, 280, 410, 350, 270, 380,
];

const ProfileCreatedPhotosFallback: React.FC = () => (
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

export default ProfileCreatedPhotosFallback;
