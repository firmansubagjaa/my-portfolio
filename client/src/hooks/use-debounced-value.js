// File: /client/src/hooks/use-debounced-value.ts
import { useEffect, useState } from "react";
/**
 * Hook to debounce a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebouncedValue(value, delay = 300) {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);
	return debouncedValue;
}
