// File: /server/src/models/project.model.ts
import { and, eq, inArray, ilike, or, count, desc } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";
import { escapeLike } from "../utils/sql";
import type {
	PublicProjectListQuery,
	ProjectListItemDTO,
	ProjectDTO,
} from "../shared/dto";

interface PaginationParams {
	page: number;
	limit: number;
}

/**
 * Build WHERE clause for project filtering
 */
export function buildProjectWhere(filters: Partial<PublicProjectListQuery>) {
	const conditions = [];

	// Status filter - always restricted to published or archived for public
	if (filters.status) {
		if (Array.isArray(filters.status)) {
			conditions.push(inArray(projects.status, filters.status));
		} else {
			conditions.push(eq(projects.status, filters.status));
		}
	} else {
		// Default to published if not specified
		conditions.push(eq(projects.status, "published"));
	}

	// Category filter
	if (filters.category) {
		conditions.push(eq(projects.category, filters.category));
	}

	// Search filter - search title, summary, or tech_stack
	if (filters.search && filters.search.trim()) {
		const escapedSearch = escapeLike(filters.search.trim());
		const searchPattern = `%${escapedSearch}%`;

		conditions.push(
			or(
				ilike(projects.title, searchPattern),
				ilike(projects.summary, searchPattern),
			),
		);
	}

	return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * List public projects with pagination
 */
export async function listProjects(
	filters: Partial<PublicProjectListQuery>,
	pagination: PaginationParams,
) {
	const whereClause = buildProjectWhere(filters);
	const offset = (pagination.page - 1) * pagination.limit;

	// Run query and count in parallel
	const [items, countResult] = await Promise.all([
		db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				summary: projects.summary,
				thumbnail_url: projects.thumbnail_url,
				gallery_urls: projects.gallery_urls,
				tech_stack: projects.tech_stack,
				category: projects.category,
				repo_url: projects.repo_url,
				demo_url: projects.demo_url,
				notebook_url: projects.notebook_url,
				is_featured: projects.is_featured,
				status: projects.status,
				created_at: projects.created_at,
				updated_at: projects.updated_at,
			})
			.from(projects)
			.where(whereClause)
			.orderBy(desc(projects.is_featured), desc(projects.created_at))
			.limit(pagination.limit)
			.offset(offset),
		db.select({ count: count() }).from(projects).where(whereClause),
	]);

	const total = countResult[0]?.count || 0;

	// Convert Date objects to ISO strings for API response
	const convertedItems = items.map((item) => ({
		...item,
		created_at: item.created_at.toISOString(),
		updated_at: item.updated_at.toISOString(),
	})) as ProjectListItemDTO[];

	return {
		items: convertedItems,
		total,
	};
}

/**
 * Find a public project by slug (published or archived)
 */
export async function findPublicProjectBySlug(
	slug: string,
): Promise<ProjectDTO | undefined> {
	const result = await db
		.select()
		.from(projects)
		.where(
			and(
				eq(projects.slug, slug),
				inArray(projects.status, ["published", "archived"]),
			),
		)
		.limit(1);

	if (result.length === 0) {
		return undefined;
	}

	const row = result[0]!;
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		summary: row.summary,
		content: row.content,
		thumbnail_url: row.thumbnail_url,
		gallery_urls: row.gallery_urls,
		tech_stack: row.tech_stack,
		category: row.category,
		repo_url: row.repo_url,
		demo_url: row.demo_url,
		notebook_url: row.notebook_url,
		is_featured: row.is_featured,
		status: row.status,
		created_at: row.created_at.toISOString(),
		updated_at: row.updated_at.toISOString(),
	};
}
