// File: /client/src/lib/utils.ts
// shadcn/ui helper, used only by admin (shadcn) components. Public code keeps `@/lib/cn`
// so clsx + tailwind-merge stay out of the public entry chunk.
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
