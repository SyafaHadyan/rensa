import Text from "@/frontend/components/Text";
import { FilterLists } from "@/frontend/data/filterDatas";
import { cn } from "@/utils/cn";

interface ExploreFilterControlsViewProps {
	activeFilters: string[];
	onClearFilters: () => void;
	onToggleFilter: (label: string) => void;
}

const ExploreFilterControlsView: React.FC<ExploreFilterControlsViewProps> = ({
	activeFilters,
	onClearFilters,
	onToggleFilter,
}) => (
	<section aria-labelledby="explore-filter-heading" className="px-3">
		<h2 className="sr-only" id="explore-filter-heading">
			Filter photos
		</h2>
		<div className="mb-11 grid w-full grid-cols-2 grid-rows-2 pt-50 text-black md:justify-between lg:flex lg:flex-row">
			{FilterLists.map((list) => (
				<fieldset key={list.title}>
					<legend>
						<Text className="font-light text-white-700" size="s">
							{list.title}
						</Text>
					</legend>
					<div
						className={cn(
							"grid",
							list.column === 1 ? "grid-cols-1" : "grid-cols-2 gap-x-10"
						)}
					>
						{list.items.map((item) => {
							const isActive =
								item.id === "all"
									? activeFilters.length === 0
									: activeFilters.includes(item.id);

							return (
								<div
									className="font-forum text-[14px] sm:text-[20px] lg:text-2xl 2xl:text-3xl"
									key={item.label}
								>
									<button
										className="relative mr-5 cursor-pointer pb-1 transition-colors duration-300 hover:text-gray-700"
										onClick={() => onToggleFilter(item.id)}
										type="button"
									>
										<span>{item.label.trim()}</span>
										<span
											className={cn(
												"absolute bottom-0 left-0 h-0.5 w-full origin-left transform bg-orange-500 transition-transform duration-300",
												isActive ? "scale-x-100" : "scale-x-0"
											)}
										/>
									</button>
								</div>
							);
						})}
					</div>
				</fieldset>
			))}
		</div>

		{activeFilters.length > 0 && (
			<button
				className="cursor-pointer rounded-full border-0 bg-[#BC0E0E] px-4 py-2 font-semibold text-white-500 outline-0 ring-0 transition-colors duration-300 hover:bg-red-500 hover:text-white-100"
				onClick={onClearFilters}
				type="button"
			>
				Clear
			</button>
		)}
	</section>
);

export default ExploreFilterControlsView;
