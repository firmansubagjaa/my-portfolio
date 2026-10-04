// File: /client/src/components/motion/MotionProvider.tsx
import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { TRANSITION } from "@/config/constants";

interface MotionProviderProps {
	children: ReactNode;
}

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

// strict: any `motion.*` component inside this tree throws; always use `m.*` from "motion/react-m"
export function MotionProvider({ children }: MotionProviderProps) {
	return (
		<LazyMotion features={loadFeatures} strict>
			<MotionConfig reducedMotion="user" transition={TRANSITION}>
				{children}
			</MotionConfig>
		</LazyMotion>
	);
}
