// File: /client/src/lib/zod-resolver.ts
// react-hook-form resolver for zod 4. @hookform/resolvers 3.x only understands zod 3 errors and
// re-throws zod 4 errors, so invalid forms silently failed to submit and showed no messages.
import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

export function zodResolver<TValues extends FieldValues>(schema: z.ZodType): Resolver<TValues> {
	return async (values) => {
		const result = await schema.safeParseAsync(values);
		if (result.success) {
			return { values: result.data as TValues, errors: {} };
		}

		// Nest issues by path; keep the first message per field
		const errors: Record<string, unknown> = {};
		for (const issue of result.error.issues) {
			const path = issue.path.map(String);
			if (path.length === 0) continue;
			let node = errors;
			for (const key of path.slice(0, -1)) {
				node[key] ??= {};
				node = node[key] as Record<string, unknown>;
			}
			const leaf = path[path.length - 1] as string;
			node[leaf] ??= { type: issue.code, message: issue.message };
		}
		return { values: {}, errors: errors as FieldErrors<TValues> };
	};
}
