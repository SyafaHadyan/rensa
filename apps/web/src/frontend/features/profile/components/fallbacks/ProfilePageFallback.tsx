import ProfileControlsFallback from "./ProfileControlsFallback";
import ProfileHeaderFallback from "./ProfileHeaderFallback";
import ProfileRollListFallback from "./ProfileRollListFallback";

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
