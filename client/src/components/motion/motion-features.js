/**
 * Dynamically load motion features to keep bundle size small
 * Returns the domMax feature which is needed for layout animations
 */
export async function loadMotionFeatures() {
	const { domMax } = await import("motion/react");
	return domMax;
}
