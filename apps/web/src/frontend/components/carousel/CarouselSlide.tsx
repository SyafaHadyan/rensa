import Image from "next/image";
import { cn } from "@/utils/cn";

interface CarouselSlideProps {
	children: React.ReactNode;
	className?: string;
	id: string;
	src: string;
}

const CarouselSlide: React.FC<CarouselSlideProps> = ({
	id,
	children,
	src,
	className,
}) => {
	const handleNext = (targetId: string) => {
		const el = document.getElementById(targetId);
		el?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "center",
		});
	};

	return (
		<div
			className={cn(
				"carousel-item relative h-[20vh] w-full lg:h-full",
				className
			)}
			id={id}
		>
			<div className="absolute inset-0 overflow-hidden">
				<Image
					alt="photo"
					className="h-full w-full object-cover"
					fill
					sizes="100vw"
					src={src}
				/>
			</div>

			<div className="absolute right-30 -bottom-10 z-10 h-fit w-[20vw] overflow-visible rounded-3xl bg-[#fafafa] shadow-lg">
				{children}
			</div>
			<div className="absolute top-1/2 right-5 left-5 z-30 flex -translate-y-1/2 justify-between">
				<button
					className="btn btn-circle"
					onClick={() => handleNext(`slide${Number(id.slice(-1)) - 1}`)}
					type="button"
				>
					{"<"}
				</button>
				<button
					className="btn btn-circle"
					onClick={() => handleNext(`slide${Number(id.slice(-1)) + 1}`)}
					type="button"
				>
					{">"}
				</button>
			</div>
		</div>
	);
};

export default CarouselSlide;
