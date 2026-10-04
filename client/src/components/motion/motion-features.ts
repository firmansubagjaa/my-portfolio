// File: /client/src/components/motion/motion-features.ts
import type { FeatureBundle } from "motion/react";

/**
 * Dynamically load motion features to keep bundle size small
 * Returns the domMax feature which is needed for layout animations
 */
export async function loadMotionFeatures(): Promise<FeatureBundle> {
	const { domMax } = await import("motion/react");
	return domMax;
}
