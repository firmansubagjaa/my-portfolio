// File: /server/src/models/user.model.ts
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import type { UserRow } from "../db/schema";

export async function findUserByUsername(
	username: string,
): Promise<UserRow | undefined> {
	const result = await db
		.select()
		.from(users)
		.where(eq(users.username, username))
		.limit(1);

	return result[0];
}

export async function findUserById(id: string): Promise<UserRow | undefined> {
	const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

	return result[0];
}
