import Link from "next/link";
import { footerData } from "@/frontend/data/footerDatas";
import { cn } from "@/utils/cn";
import Logo from "../icons/Logo";
import Text from "../Text";

const Footer = () => {
	return (
		<footer className="z-20 w-full bg-primary p-10 text-white md:p-20">
			<div className="mx-auto flex max-w-7xl flex-col gap-10">
				<div className="flex flex-col gap-10 md:flex-row md:justify-between">
					{/* Left column */}
					<div className="flex flex-col justify-between md:w-1/2 lg:w-2/5 xl:w-1/3">
						<div className="flex flex-col gap-1">
							<Logo className="text-white-200" color="white" size={"m"} />
							<h1 className="font-forum text-[16px] lg:text-[18px]">
								Where Every Picture Tells Its Recipe.
							</h1>
						</div>
						<p className="mt-6 hidden font-figtree text-[10px] text-black-200 md:block md:text-[16px]">
							Rensa {new Date().getFullYear()}. All Rights Reserved
						</p>
					</div>

					<div className="flex flex-col justify-between md:w-1/2 lg:w-2/5 xl:w-1/3">
						{/* Navigation grid */}
						<div className="grid grid-cols-2 gap-y-4 text-[14px] lg:text-[18px]">
							{footerData.map((navigation, idx) => (
								<div
									className={cn(
										"flex flex-col",
										navigation.column !== 1 && "ml-[2vw]"
									)}
									key={idx}
								>
									<Link href={navigation.href}>
										<Text size="m">{navigation.label}</Text>
									</Link>
								</div>
							))}
						</div>

						<div className="mt-6 flex gap-8 font-figtree text-[10px] text-black-200 md:gap-12 md:text-[16px] lg:gap-28 xl:gap-41">
							<p className="block font-figtree text-[10px] text-black-200 md:hidden md:text-[16px]">
								Rensa 2025. All Rights Reserved
							</p>
							<Link href="">
								<p className="font-figtree">Privacy Policy</p>
							</Link>
							<Link href="">
								<p className="font-figtree">Terms</p>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
