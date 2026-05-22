import Image from "next/image";
import { carouselData } from "@/frontend/data/carouselDatas";

export default function Carousel() {
	const handleScroll = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			});
		}
	};

	return (
		<div className="carousel relative h-[76vh] w-full">
			{carouselData.map((slide, index) => {
				const prevId =
					carouselData[(index - 1 + carouselData.length) % carouselData.length]
						.id;
				const nextId = carouselData[(index + 1) % carouselData.length].id;

				return (
					<div
						className="carousel-item relative h-[40vh] w-full md:h-[52vh]"
						id={slide.id}
						key={slide.id}
					>
						<div className="absolute inset-0 overflow-hidden rounded-lg">
							<Image
								alt={slide.title}
								className="object-cover"
								fill
								priority={index === 0}
								sizes="100vw"
								src={slide.src}
							/>
						</div>

						<div className="absolute top-[25vh] right-[5vw] z-20 w-[40vw] overflow-visible rounded-3xl bg-[#fafafa] shadow-lg md:top-[30vh] md:w-[25vw] xl:right-[5vw] xl:w-[15vw]">
							<div className="flex flex-col p-6 font-figtree font-semibold text-[12px] text-primary md:text-[18px]">
								{slide.title}
								<div className="text-[8px] md:text-[10px] lg:text-[12px]">
									{slide.specs.map((spec) => (
										<div
											className="mt-2 font-light text-black-200"
											key={spec.label}
										>
											{spec.label}
											<div className="font-thin text-black lg:mt-1">
												{spec.value}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className="absolute top-1/2 right-5 left-5 flex -translate-y-1/2 justify-between">
							<button
								className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/70 text-black/70 transition hover:bg-white/90 hover:text-black/90"
								onClick={() => handleScroll(prevId)}
								type="button"
							>
								{"<"}
							</button>
							<button
								className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/70 text-black/70 transition hover:bg-white/90 hover:text-black/90"
								onClick={() => handleScroll(nextId)}
								type="button"
							>
								{">"}
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}
