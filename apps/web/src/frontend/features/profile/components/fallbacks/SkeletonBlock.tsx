import { cn } from "@/utils/cn";

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

export default SkeletonBlock;
