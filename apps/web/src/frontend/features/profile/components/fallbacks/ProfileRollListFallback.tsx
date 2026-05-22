import ProfileRollCardFallback from "./ProfileRollCardFallback";

const ProfileRollListFallback: React.FC = () => (
	<div className="flex flex-wrap items-start gap-x-4 gap-y-6">
		{[0, 1, 2, 3, 4, 5].map((item) => (
			<ProfileRollCardFallback key={item} />
		))}
	</div>
);

export default ProfileRollListFallback;
