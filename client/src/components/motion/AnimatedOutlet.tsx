// File: /client/src/components/motion/AnimatedOutlet.tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { Outlet, useLocation } from "react-router";

/**
 * Outlet wrapper with route transition animations
 * Animates opacity and Y position when changing routes
 * Key is based on pathname only (not query string) so filter changes don't trigger route animation
 */
export function AnimatedOutlet() {
	const location = useLocation();
	const key = location.pathname; // Key by pathname only, not query string

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={key}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.2 }}
			>
				<Outlet />
			</motion.div>
		</AnimatePresence>
	);
}
