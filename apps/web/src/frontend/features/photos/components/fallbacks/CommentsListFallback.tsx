import SkeletonBlock from "./SkeletonBlock";

const CommentsListFallback: React.FC = () => (
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

export default CommentsListFallback;
