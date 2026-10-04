// File: /client/src/components/motion/MotionProvider.tsx
"use client";
import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { jsx as _jsx } from "react/jsx-runtime";
export function MotionProvider({ children }) {
	return _jsx(LazyMotion, {
		features: domAnimation,
		strict: true,
		children: _jsx(MotionConfig, { reducedMotion: "user", children: children }),
	});
}
