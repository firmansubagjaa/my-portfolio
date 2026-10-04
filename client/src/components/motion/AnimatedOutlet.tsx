// File: /client/src/components/motion/AnimatedOutlet.tsx
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { useLocation, useOutlet } from "react-router";

// Freezes the outlet so the old page keeps rendering during its exit animation
function FrozenOutlet() {
	const outlet = useOutlet();
	const [frozen] = useState(outlet);
	return frozen;
}

/**
 * Route transition keyed by pathname only, so query-string changes
 * (filters, pagination) don't trigger a full-page animation.
 */
export function AnimatedOutlet() {
	const location = useLocation();

	return (
		<AnimatePresence mode="wait" initial={false}>
			<m.div
				key={location.pathname}
				initial={{ opacity: 0, y: 4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -4 }}
			>
				<FrozenOutlet />
			</m.div>
		</AnimatePresence>
	);
}
