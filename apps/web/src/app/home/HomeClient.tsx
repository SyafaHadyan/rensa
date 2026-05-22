"use client";

import { ArrowArcRightIcon } from "@phosphor-icons/react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import IconButton from "@/frontend/components/buttons/IconButton";
import Carousel from "@/frontend/components/carousel/Carousel";
import Footer from "@/frontend/components/footer/Footer";
import HomeNavbar from "@/frontend/components/navbar/HomeNavbar";
import { cardData } from "@/frontend/data/homeDatas";
import HeroSection from "@/frontend/sections/HeroSection";
import { cn } from "@/utils/cn";

export default function HomeClient() {
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start end", "end start"],
	});

	const motions = [
		useSpring(useTransform(scrollYProgress, [0, 0.4], ["100vh", "0vh"]), {
			stiffness: 100,
			damping: 20,
		}),
		useSpring(useTransform(scrollYProgress, [0, 0.62], ["120vh", "-20vh"]), {
			stiffness: 100,
			damping: 20,
		}),
		useSpring(useTransform(scrollYProgress, [0, 0.75], ["80vh", "-40vh"]), {
			stiffness: 100,
			damping: 20,
		}),
		useSpring(useTransform(scrollYProgress, [0, 0.9], ["140vh", "-60vh"]), {
			stiffness: 100,
			damping: 20,
		}),
	];

	const textY = useTransform(scrollYProgress, [0, 1], ["0vh", "0vh"]);
	const textOpacity = useTransform(scrollYProgress, [0.75, 0.8], [0, 1]);
	const smoothTextY = useSpring(textY, { stiffness: 100, damping: 20 });
	const smoothTextOpacity = useSpring(textOpacity, {
		stiffness: 100,
		damping: 20,
	});

	return (
		<main className="w-full bg-white-100">
			<HomeNavbar />
			<HeroSection />

			<section
				aria-labelledby="home-idea-title"
				className="relative flex h-[50%] w-full flex-col items-center justify-center p-10 lg:justify-between xl:h-screen xl:flex-row xl:p-40"
				id="idea-content"
			>
				<header className="flex flex-col pr-10 pb-8 xl:pb-[28vh]">
					<h2
						className="pb-[4vh] text-center font-figtree font-medium text-[32px] text-black-500 md:text-4xl lg:text-5xl xl:text-left xl:text-7xl"
						id="home-idea-title"
					>
						Get an <span className="font-forum">Idea</span>
						<br />
						<span className="ml-4 lg:text-right">of What You Should </span>
						<br />
						<span className="font-forum">Shoot </span>
						Tomorrow
					</h2>
					<div className="mx-4 text-center font-figtree font-light text-[10px] text-black-300 md:text-[1rem] xl:text-left">
						<p>
							Stuck on what to capture next? Explore fresh perspectives from the
							community - each photo comes with a detailed recipe, so you can
							recreate the vibe or twist it your own way.
						</p>
					</div>
				</header>
				<Carousel />
			</section>

			<section aria-labelledby="home-story-title" className="h-[50vh] pt-30">
				<section
					aria-label="Photo story showcase"
					className="relative z-0 h-[400vh] bg-white text-center text-black"
					ref={sectionRef}
					style={{ height: "calc(400vh + 200vh)" }}
				>
					<div className="sticky top-0 left-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
						{cardData.map((card, index) => (
							<motion.div
								className={cn(
									"overflow-hidden rounded-lg bg-gray-100",
									card.position
								)}
								key={card.id}
								style={{ y: motions[index] }}
							>
								<Image
									alt="photo"
									className="h-full w-full object-cover"
									fill
									sizes="(max-width: 1024px) 40vw, 32vw"
									src={card.src}
								/>
							</motion.div>
						))}

						<motion.div
							className="absolute top-[35vh] left-1/2 z-20 w-[75%] -translate-x-1/2 px-6 text-center"
							style={{ y: smoothTextY, opacity: smoothTextOpacity }}
						>
							<h2
								className="mx-auto mb-4 w-fit font-figtree font-medium text-[40px] text-black-500 lg:text-6xl"
								id="home-story-title"
							>
								Every <span className="font-forum">Picture</span> Holds a
								<span className="font-forum"> Secret</span>.
							</h2>
							<p className="font-figtree font-light text-[12px] text-black-300x leading-relaxed md:text-xl">
								Behind every frame lies a quiet formula - the shutter&apos;s
								breath, the lens&apos;s sigh, the light&apos;s gentle fall.{" "}
								<span className="font-semibold">Rensa</span> lets you see it
								all, so tomorrow, your own story can be told the same way.
							</p>
							<div className="mt-4 flex items-center justify-center">
								<Link href="/explore">
									<IconButton
										color="primary"
										Icon={ArrowArcRightIcon}
										iconPosition="left"
										paddingX={16}
										type="button"
									>
										Explore Now
									</IconButton>
								</Link>
							</div>
						</motion.div>
					</div>
				</section>
				<Footer />
			</section>
		</main>
	);
}
