import { useEffect, useRef, useState } from "react";

interface UseScrollInViewOptions {
	threshold?: number | number[];
	triggerOnce?: boolean;
}

export function useScrollInView({
	threshold = 0.2,
	triggerOnce = true,
}: UseScrollInViewOptions = {}) {
	const ref = useRef<HTMLElement | null>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		if (!ref.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry) {
					if (entry.isIntersecting) {
						setInView(true);
						if (triggerOnce) {
							observer.unobserve(entry.target);
						}
					} else if (!triggerOnce) {
						setInView(false);
					}
				}
			},
			{ threshold },
		);

		observer.observe(ref.current);

		return () => {
			observer.disconnect();
		};
	}, [threshold, triggerOnce]);

	return { ref, inView };
}
