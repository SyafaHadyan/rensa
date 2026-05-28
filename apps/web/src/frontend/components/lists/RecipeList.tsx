import { CameraIcon } from "@phosphor-icons/react";
import type React from "react";
import type { PhotoMetadata } from "@/frontend/types/photo";

interface RecipeListProps {
	metadata?: PhotoMetadata;
}

const RecipeList: React.FC<RecipeListProps> = ({ metadata }) => (
	<div>
		<span className="inline-flex items-center justify-center gap-4 text-[13px]">
			<CameraIcon size={32} />
			{`${metadata?.exif?.Brand} ${metadata?.exif?.Model || "Camera Model"}`}
		</span>

		<div className="no-scrollbar mt-4 grid h-50 grid-cols-2 overflow-y-scroll font-figtree">
			{metadata?.exif &&
				Object.entries(metadata.exif).map(([key, value]) => {
					if (Array.isArray(value)) {
						return (
							<div key={key}>
								<h1 className="text-[13px] text-white-700">{key}</h1>
								<p className="text-[13px]">
									{value.map((item, index) => (
										<span className="mr-2" key={index}>
											{String(item)}
										</span>
									))}
								</p>
							</div>
						);
					}
					if (typeof value === "object") {
						return (
							<div key={key}>
								<h1 className="text-[13px] text-white-700">{key}</h1>
								<div className="text-[13px]">
									{Object.entries(value).map(([subKey, subValue]) => (
										<div key={subKey}>
											<p className="text-[13px]">{subKey}</p>
											<p className="text-[13px]">{String(subValue)}</p>
										</div>
									))}
								</div>
							</div>
						);
					}
					return (
						<div key={key}>
							<h1 className="text-[13px] text-white-700">{key}</h1>
							<p className="text-[13px]">{String(value)}</p>
						</div>
					);
				})}
		</div>
	</div>
);

export default RecipeList;
