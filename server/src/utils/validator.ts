// File: /server/src/utils/validator.ts
import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { ValidationError } from "./errors";

// biome-ignore lint/complexity/noUselessTypeConstraint: Matches @hono/zod-validator expectations
// biome-ignore lint/suspicious/noExplicitAny: Required for @hono/zod-validator compatibility
export function validate<T extends any, Target extends keyof ValidationTargets>(
	target: Target,
	schema: T,
) {
	// biome-ignore lint/suspicious/noExplicitAny: Required for result validation
	return zValidator(target, schema as any, (result: any) => {
		if (!result.success) {
			throw ValidationError.fromZod(result.error);
		}
	});
}
