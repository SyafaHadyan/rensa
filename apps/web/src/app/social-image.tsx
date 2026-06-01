interface SocialImageProps {
	format: "openGraph" | "twitter";
}

const colors = {
	background: "#ffffff",
	foreground: "#031602",
	muted: "#566355",
	rule: "#d0ddd1",
	secondary: "#ff9000",
	softOrange: "#fff4e6",
	softGreen: "#f0f4f1",
};

const specs = ["camera recipes", "metadata", "community"];

const logoPetals = Array.from({ length: 15 }, (_, index) => ({
	id: `petal-${index}`,
	rotation: index * 32.72,
}));

function RensaMark({ size = 200 }: { size?: number }) {
	const petalWidth = size * 0.16;
	const petalHeight = size * 0.44;

	return (
		<div
			aria-hidden="true"
			style={{
				display: "flex",
				height: size,
				position: "relative",
				width: size,
			}}
		>
			{logoPetals.map((petal) => (
				<div
					key={petal.id}
					style={{
						background: colors.foreground,
						borderRadius: 999,
						display: "flex",
						height: petalHeight,
						left: (size - petalWidth) / 2,
						position: "absolute",
						top: size * 0.04,
						transform: `rotate(${petal.rotation}deg)`,
						transformOrigin: `${petalWidth / 2}px ${size * 0.46}px`,
						width: petalWidth,
					}}
				/>
			))}
			<div
				style={{
					background: colors.background,
					borderRadius: 999,
					display: "flex",
					height: size * 0.24,
					left: size * 0.38,
					position: "absolute",
					top: size * 0.38,
					width: size * 0.24,
				}}
			/>
		</div>
	);
}

function SpecLabel({ label }: { label: string }) {
	return (
		<div
			style={{
				alignItems: "center",
				border: `2px solid ${colors.rule}`,
				borderRadius: 999,
				color: colors.foreground,
				display: "flex",
				fontFamily: "Figtree, sans-serif",
				fontSize: 24,
				fontWeight: 700,
				height: 52,
				justifyContent: "center",
				padding: "0 24px",
			}}
		>
			{label}
		</div>
	);
}

export function RensaSocialImage({ format }: SocialImageProps) {
	const isTwitter = format === "twitter";

	return (
		<div
			style={{
				background: colors.background,
				color: colors.foreground,
				display: "flex",
				height: "100%",
				overflow: "hidden",
				position: "relative",
				width: "100%",
			}}
		>
			<div
				style={{
					background: colors.softGreen,
					display: "flex",
					height: 630,
					position: "absolute",
					right: -330,
					top: -250,
					transform: "rotate(-18deg)",
					width: 520,
				}}
			/>
			<div
				style={{
					background: colors.softOrange,
					bottom: -210,
					display: "flex",
					height: 390,
					left: -120,
					position: "absolute",
					transform: "rotate(-10deg)",
					width: 760,
				}}
			/>
			<div
				style={{
					background: colors.secondary,
					display: "flex",
					height: 10,
					left: 80,
					position: "absolute",
					top: 80,
					width: 84,
				}}
			/>
			<div
				style={{
					background: colors.rule,
					display: "flex",
					height: 2,
					left: 80,
					position: "absolute",
					right: 80,
					top: isTwitter ? 574 : 530,
				}}
			/>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					left: 80,
					position: "absolute",
					top: isTwitter ? 118 : 104,
					width: 720,
				}}
			>
				<div
					style={{
						color: colors.secondary,
						display: "flex",
						fontFamily: "Figtree, sans-serif",
						fontSize: 24,
						fontWeight: 800,
						letterSpacing: 0,
						lineHeight: 1,
						textTransform: "uppercase",
					}}
				>
					Photography community
				</div>
				<div
					style={{
						color: colors.foreground,
						display: "flex",
						fontFamily: "Forum, serif",
						fontSize: isTwitter ? 154 : 146,
						fontWeight: 400,
						lineHeight: 0.92,
						marginTop: 34,
					}}
				>
					Rensa
				</div>
				<div
					style={{
						color: colors.foreground,
						display: "flex",
						fontFamily: "Figtree, sans-serif",
						fontSize: isTwitter ? 48 : 44,
						fontStyle: "italic",
						fontWeight: 600,
						lineHeight: 1.1,
						marginTop: 18,
						width: 690,
					}}
				>
					Where every picture tells its recipe.
				</div>
				<div
					style={{
						color: colors.muted,
						display: "flex",
						fontFamily: "Figtree, sans-serif",
						fontSize: 27,
						fontWeight: 500,
						lineHeight: 1.32,
						marginTop: 26,
						width: 600,
					}}
				>
					Share photographs with the camera settings and creative choices behind
					them.
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						gap: 14,
						marginTop: 36,
					}}
				>
					{specs.map((spec) => (
						<SpecLabel key={spec} label={spec} />
					))}
				</div>
			</div>

			<div
				style={{
					alignItems: "center",
					display: "flex",
					height: 340,
					justifyContent: "center",
					position: "absolute",
					right: 108,
					top: isTwitter ? 166 : 144,
					width: 340,
				}}
			>
				<RensaMark size={250} />
			</div>

			<div
				style={{
					alignItems: "center",
					bottom: isTwitter ? 52 : 44,
					color: colors.muted,
					display: "flex",
					fontFamily: "Figtree, sans-serif",
					fontSize: 24,
					fontWeight: 700,
					position: "absolute",
					right: 80,
				}}
			>
				rensa.site
			</div>
		</div>
	);
}
