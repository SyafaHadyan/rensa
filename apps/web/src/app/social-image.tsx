interface SocialImageProps {
	format: "openGraph" | "twitter";
}

const photoFrames = [
	{
		background:
			"linear-gradient(135deg, #f6dfb0 0%, #d97f3f 42%, #182818 100%)",
		left: 90,
		top: 76,
		rotate: "-7deg",
		width: 258,
		height: 344,
	},
	{
		background:
			"linear-gradient(140deg, #dff1ec 0%, #65987c 44%, #071107 100%)",
		left: 256,
		top: 154,
		rotate: "8deg",
		width: 246,
		height: 328,
	},
	{
		background:
			"linear-gradient(145deg, #ffe5ad 0%, #ff9000 38%, #3b1703 100%)",
		left: 166,
		top: 250,
		rotate: "2deg",
		width: 286,
		height: 278,
	},
];

const specs = ["Fujifilm X100V", "Classic Chrome", "1/250s", "f/2.8"];

function RecipeChip({ label }: { label: string }) {
	return (
		<div
			style={{
				alignItems: "center",
				background: "rgba(255, 255, 255, 0.13)",
				border: "1px solid rgba(255, 255, 255, 0.25)",
				borderRadius: 999,
				color: "#fff6e8",
				display: "flex",
				fontSize: 24,
				fontWeight: 700,
				height: 48,
				justifyContent: "center",
				padding: "0 22px",
			}}
		>
			{label}
		</div>
	);
}

function PhotoFrame({
	background,
	height,
	left,
	rotate,
	top,
	width,
}: (typeof photoFrames)[number]) {
	return (
		<div
			style={{
				background: "#fffaf0",
				borderRadius: 26,
				boxShadow: "0 28px 80px rgba(0, 0, 0, 0.42)",
				display: "flex",
				height,
				left,
				padding: 14,
				position: "absolute",
				top,
				transform: `rotate(${rotate})`,
				width,
			}}
		>
			<div
				style={{
					background,
					borderRadius: 18,
					display: "flex",
					height: "100%",
					overflow: "hidden",
					position: "relative",
					width: "100%",
				}}
			>
				<div
					style={{
						background:
							"linear-gradient(165deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 42%)",
						display: "flex",
						height: "100%",
						position: "absolute",
						width: "100%",
					}}
				/>
				<div
					style={{
						background: "rgba(255, 255, 255, 0.24)",
						borderRadius: 999,
						display: "flex",
						height: 94,
						left: 28,
						position: "absolute",
						top: 26,
						width: 94,
					}}
				/>
				<div
					style={{
						background: "rgba(3, 22, 2, 0.32)",
						bottom: 0,
						display: "flex",
						height: 112,
						position: "absolute",
						width: "100%",
					}}
				/>
			</div>
		</div>
	);
}

export function RensaSocialImage({ format }: SocialImageProps) {
	const isTwitter = format === "twitter";

	return (
		<div
			style={{
				background:
					"radial-gradient(circle at 82% 18%, rgba(255, 144, 0, 0.34) 0%, rgba(255, 144, 0, 0) 30%), radial-gradient(circle at 20% 92%, rgba(120, 166, 116, 0.34) 0%, rgba(120, 166, 116, 0) 34%), linear-gradient(135deg, #031602 0%, #10260f 46%, #1d1206 100%)",
				color: "#fffaf0",
				display: "flex",
				height: "100%",
				overflow: "hidden",
				position: "relative",
				width: "100%",
			}}
		>
			<div
				style={{
					background:
						"linear-gradient(90deg, rgba(255, 250, 240, 0.08) 1px, transparent 1px), linear-gradient(0deg, rgba(255, 250, 240, 0.08) 1px, transparent 1px)",
					backgroundSize: "56px 56px",
					display: "flex",
					height: "100%",
					opacity: 0.45,
					position: "absolute",
					width: "100%",
				}}
			/>
			<div
				style={{
					background: "#ff9000",
					borderRadius: 999,
					display: "flex",
					height: 220,
					left: -70,
					position: "absolute",
					top: -96,
					width: 220,
				}}
			/>
			<div
				style={{
					background: "rgba(255, 250, 240, 0.08)",
					border: "1px solid rgba(255, 250, 240, 0.16)",
					borderRadius: 999,
					display: "flex",
					height: 430,
					position: "absolute",
					right: -130,
					top: -116,
					width: 430,
				}}
			/>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					left: 76,
					position: "absolute",
					top: isTwitter ? 76 : 68,
					width: 620,
				}}
			>
				<div
					style={{
						alignItems: "center",
						color: "#ffb554",
						display: "flex",
						fontSize: 25,
						fontWeight: 800,
						height: 36,
						textTransform: "uppercase",
					}}
				>
					Photo recipes for real shoots
				</div>
				<div
					style={{
						color: "#fffaf0",
						display: "flex",
						fontFamily: "serif",
						fontSize: isTwitter ? 122 : 116,
						fontWeight: 400,
						lineHeight: 0.92,
						marginTop: 18,
					}}
				>
					Rensa
				</div>
				<div
					style={{
						color: "#f8ead6",
						display: "flex",
						fontSize: isTwitter ? 48 : 44,
						fontWeight: 700,
						lineHeight: 1.08,
						marginTop: 12,
						width: 600,
					}}
				>
					Where every picture tells its recipe.
				</div>
				<div
					style={{
						color: "rgba(255, 250, 240, 0.78)",
						display: "flex",
						fontSize: 27,
						fontWeight: 500,
						lineHeight: 1.28,
						marginTop: 22,
						width: 555,
					}}
				>
					Discover the camera settings, film simulations, and creative choices
					behind photographs worth recreating.
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						flexWrap: "wrap",
						marginTop: 32,
						width: 560,
					}}
				>
					{specs.map((spec, index) => (
						<div
							key={spec}
							style={{
								display: "flex",
								marginBottom: 14,
								marginRight: index === 1 ? 0 : 14,
							}}
						>
							<RecipeChip label={spec} />
						</div>
					))}
				</div>
			</div>

			<div
				style={{
					display: "flex",
					height: "100%",
					position: "absolute",
					right: 0,
					top: 0,
					width: 600,
				}}
			>
				{photoFrames.map((frame) => (
					<PhotoFrame key={`${frame.left}-${frame.top}`} {...frame} />
				))}
				<div
					style={{
						background: "#fffaf0",
						borderRadius: 999,
						display: "flex",
						height: 88,
						left: 322,
						position: "absolute",
						top: 88,
						width: 88,
					}}
				>
					<div
						style={{
							background: "#031602",
							borderRadius: 999,
							display: "flex",
							height: 54,
							left: 17,
							position: "absolute",
							top: 17,
							width: 54,
						}}
					/>
					<div
						style={{
							background: "#ff9000",
							borderRadius: 999,
							display: "flex",
							height: 24,
							left: 32,
							position: "absolute",
							top: 32,
							width: 24,
						}}
					/>
				</div>
			</div>

			<div
				style={{
					alignItems: "center",
					bottom: 42,
					color: "rgba(255, 250, 240, 0.72)",
					display: "flex",
					fontSize: 24,
					fontWeight: 700,
					right: 76,
					position: "absolute",
				}}
			>
				rensa.site
			</div>
		</div>
	);
}
