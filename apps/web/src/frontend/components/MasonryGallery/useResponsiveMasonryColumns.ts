import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_COLUMN_WIDTH = 256;

interface UseResponsiveMasonryColumnsOptions {
	maxColumns: number;
	minColumnWidth?: number;
}

export const useResponsiveMasonryColumns = ({
	maxColumns,
	minColumnWidth = DEFAULT_COLUMN_WIDTH,
}: UseResponsiveMasonryColumnsOptions) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [columns, setColumns] = useState(() => Math.min(Math.max(maxColumns, 1), 5));

	const updateColumns = useCallback(() => {
		const container = containerRef.current;

		if (!container) {
			setColumns(Math.max(maxColumns, 1));
			return;
		}

		const width = container.getBoundingClientRect().width;
		const nextColumns = Math.max(
			1,
			Math.min(maxColumns, Math.floor(width / minColumnWidth))
		);

		setColumns(nextColumns);
	}, [maxColumns, minColumnWidth]);

	useEffect(() => {
		const container = containerRef.current;
		const resizeObserver = new ResizeObserver(updateColumns);
		const visualViewport = window.visualViewport;

		if (container) {
			resizeObserver.observe(container);
		}

		updateColumns();

		window.addEventListener("resize", updateColumns);
		visualViewport?.addEventListener("resize", updateColumns);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateColumns);
			visualViewport?.removeEventListener("resize", updateColumns);
		};
	}, [updateColumns]);

	return { columns, containerRef };
};
