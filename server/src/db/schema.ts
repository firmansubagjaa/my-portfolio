// File: /server/src/db/schema.ts
import {
	pgTable,
	pgEnum,
	uuid,
	text,
	boolean,
	timestamp,
	index,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { PROJECT_STATUSES, PROJECT_CATEGORIES } from "../shared/dto";

export const projectStatusEnum = pgEnum("project_status", PROJECT_STATUSES);
export const projectCategoryEnum = pgEnum(
	"project_category",
	PROJECT_CATEGORIES,
);

export const projects = pgTable(
	"projects",
	{
		id: uuid().primaryKey().defaultRandom(),
		title: text().notNull(),
		slug: text().notNull(),
		summary: text().notNull(),
		content: text().notNull(),
		thumbnail_url: text(),
		gallery_urls: text().array().notNull().default([]),
		tech_stack: text().array().notNull().default([]),
		category: projectCategoryEnum().notNull(),
		repo_url: text(),
		demo_url: text(),
		notebook_url: text(),
		is_featured: boolean().notNull().default(false),
		status: projectStatusEnum().notNull().default("draft"),
		created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
		updated_at: timestamp({ withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		uniqueIndex("projects_slug_unique").on(table.slug),
		index("projects_status_idx").on(table.status),
		index("projects_category_idx").on(table.category),
		index("projects_featured_idx").on(table.is_featured),
		index("projects_created_at_idx").on(table.created_at),
	],
);

export const users = pgTable(
	"users",
	{
		id: uuid().primaryKey().defaultRandom(),
		username: text().notNull(),
		password_hash: text().notNull(),
		created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [uniqueIndex("users_username_unique").on(table.username)],
);

// Enable RLS on both tables
projects.enableRLS();
users.enableRLS();

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

// Re-export DTO from shared layer
export * from "../shared/dto";
