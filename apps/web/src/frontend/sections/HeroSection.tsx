"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { heroImagesData } from "@/frontend/data/homeDatas";
import { cn } from "@/utils/cn";

export default function HeroSection() {
	return (
		<section
			aria-label="Hero section - Where Every Picture Tells Its Recipe"
			className="relative h-screen w-full overflow-hidden"
			id="hero-section"
		>
			{/* Top green text (color-dodge effect) */}
			<motion.h1
				animate={{ opacity: 1, y: 0 }}
				className="absolute top-1/2 left-1/2 z-20 w-full -translate-x-1/2 -translate-y-1/2 text-center font-figtree text-[#56AD3B] text-[32px] italic mix-blend-color-dodge md:text-4xl lg:text-7xl xl:text-8xl"
				initial={{ opacity: 0, y: 40 }}
				transition={{ duration: 1, ease: "easeOut" }}
			>
				Where Every{" "}
				<span className="inline font-forum text-[32px] not-italic md:text-4xl lg:text-7xl xl:text-8xl">
					Picture
				</span>
				<br />
				Tells Its{" "}
				<span className="font-forum text-[32px] not-italic md:text-4xl lg:text-7xl xl:text-8xl">
					Recipe
				</span>
			</motion.h1>

			{/* White overlay text (exclusion effect) */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				aria-hidden="true"
				className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center font-figtree text-[32px] text-white italic mix-blend-exclusion md:text-4xl lg:text-7xl xl:text-8xl"
				initial={{ opacity: 0, y: -40 }}
				transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
			>
				Where Every{" "}
				<span className="font-forum text-[32px] not-italic md:text-4xl lg:text-7xl xl:text-8xl">
					Picture
				</span>
				<br />
				Tells Its{" "}
				<span className="font-forum text-[32px] not-italic md:text-4xl lg:text-7xl xl:text-8xl">
					Recipe
				</span>
			</motion.div>

			{/* Background images */}
			<div className="relative z-10 h-screen w-screen">
				{heroImagesData.map((data, i) => (
					<motion.div
						animate={{ opacity: 1, scale: 1, y: 0 }}
						className={cn("absolute bg-gray-100", data.className)}
						initial={{ opacity: 0, scale: 0.9, y: 30 }}
						key={data.id}
						transition={{
							duration: 0.8,
							delay: 0.5 + i * 0.2, // staggered by index
							ease: "easeOut",
						}}
					>
						<Image
							alt={`Rensa photo inspiration ${i + 1}`}
							className="h-full w-full rounded-lg object-cover"
							fill
							loading={i < 3 ? "eager" : "lazy"}
							priority={i < 3}
							quality={20}
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							src={data.src}
						/>
					</motion.div>
				))}
			</div>
		</section>
	);
}
