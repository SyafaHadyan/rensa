import CommentsListFallback from "./CommentsListFallback";
import SkeletonBlock from "./SkeletonBlock";

const CommentsFallback: React.FC = () => (
	<div>
		<SkeletonBlock className="mb-5 h-8 w-36 rounded-full" />
		<div className="mb-5 space-y-4">
			<CommentsListFallback />
		</div>
		<SkeletonBlock className="h-11 w-full rounded-2xl" />
	</div>
);

export default CommentsFallback;
