// File: /server/src/models/project.model.ts
import { and, eq, inArray, ilike, or, count, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";
import { escapeLike } from "../utils/sql";
import type {
	PublicProjectListQuery,
	ProjectListItemDTO,
	ProjectDTO,
	AdminProjectListQuery,
	CreateProjectOutput,
	UpdateProjectOutput,
	ProjectStatus,
	ProjectCategory,
} from "../shared/dto";

interface PaginationParams {
	page: number;
	limit: number;
}

interface ProjectRow {
	id: string;
	title: string;
	slug: string;
	summary: string;
	content: string;
	thumbnail_url: string | null;
	gallery_urls: string[];
	tech_stack: string[];
	category: string;
	repo_url: string | null;
	demo_url: string | null;
	notebook_url: string | null;
	is_featured: boolean;
	status: string;
	created_at: Date;
	updated_at: Date;
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

	// Featured filter
	if (filters.featured === true) {
		conditions.push(eq(projects.is_featured, true));
	}

	// Search filter - search title, summary, or tech_stack
	if (filters.search && filters.search.trim()) {
		const escapedSearch = escapeLike(filters.search.trim());
		const searchPattern = `%${escapedSearch}%`;

		conditions.push(
			or(
				ilike(projects.title, searchPattern),
				ilike(projects.summary, searchPattern),
				// Parameterized: pattern is bound, not interpolated into SQL text
				sql`array_to_string(${projects.tech_stack}, ' ') ILIKE ${searchPattern}`,
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

/**
 * Find project by ID (admin - no status filtering)
 */
export async function findProjectById(id: string): Promise<ProjectRow | undefined> {
	const result = await db
		.select()
		.from(projects)
		.where(eq(projects.id, id))
		.limit(1);

	return result[0];
}

/**
 * List admin projects with filtering and pagination
 */
export async function listAdminProjects(
	filters: Partial<AdminProjectListQuery>,
	pagination: PaginationParams,
) {
	const conditions = [];

	// Status filter (optional; admin can filter by single status, multiple statuses, or see all)
	if (filters.status !== undefined && filters.status !== null) {
		if (Array.isArray(filters.status)) {
			// Multiple statuses: status=[draft,published]
			conditions.push(inArray(projects.status, filters.status));
		} else {
			// Single status
			conditions.push(eq(projects.status, filters.status));
		}
	}
	// If status not provided, show all statuses (unlike public which defaults to "published")

	// Category filter (optional enum)
	if (filters.category) {
		conditions.push(eq(projects.category, filters.category));
	}

	// Search filter (optional string, max 100 chars enforced by schema)
	if (filters.search && filters.search.trim()) {
		const escapedSearch = escapeLike(filters.search.trim());
		const searchPattern = `%${escapedSearch}%`;
		conditions.push(
			or(
				ilike(projects.title, searchPattern),
				ilike(projects.summary, searchPattern),
				sql`array_to_string(${projects.tech_stack}, ' ') ILIKE ${searchPattern}`,
			),
		);
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const offset = (pagination.page - 1) * pagination.limit;

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
	const convertedItems = items.map((item) => ({
		...item,
		created_at: item.created_at.toISOString(),
		updated_at: item.updated_at.toISOString(),
	})) as ProjectListItemDTO[];

	return { items: convertedItems, total };
}

/**
 * Create a new project
 */
export async function createProject(
	input: CreateProjectOutput,
): Promise<ProjectDTO> {
	const result = await db
		.insert(projects)
		.values({
			title: input.title,
			slug: input.slug,
			summary: input.summary,
			content: input.content,
			thumbnail_url: input.thumbnail_url || null,
			gallery_urls: input.gallery_urls || [],
			tech_stack: input.tech_stack || [],
			category: input.category,
			repo_url: input.repo_url || null,
			demo_url: input.demo_url || null,
			notebook_url: input.notebook_url || null,
			is_featured: input.is_featured || false,
			status: input.status || "draft",
		})
		.returning();

	const row = result[0]!;
	return projectRowToDTO(row);
}

/**
 * Update an existing project
 */
export async function updateProject(
	id: string,
	input: Partial<UpdateProjectOutput>,
): Promise<ProjectDTO | undefined> {
	// Check existence first (returns undefined if not found)
	const existing = await db
		.select({ id: projects.id })
		.from(projects)
		.where(eq(projects.id, id))
		.limit(1);

	if (!existing.length) {
		return undefined; // Controller must catch and throw NotFoundError
	}

	// Update only provided fields (omit undefined values)
	const updateData = Object.entries(input).reduce(
		(acc, [key, value]) => {
			if (value !== undefined) {
				(acc as Record<string, any>)[key] = value;
			}
			return acc;
		},
		{} as Partial<UpdateProjectOutput>,
	);

	const result = await db
		.update(projects)
		.set(updateData)
		.where(eq(projects.id, id))
		.returning();

	const row = result[0]!;
	return projectRowToDTO(row);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
	const result = await db
		.delete(projects)
		.where(eq(projects.id, id))
		.returning({ id: projects.id });

	if (!result.length) {
		return undefined; // Model returns undefined; controller throws NotFoundError
	}
}

/**
 * Convert ProjectRow to ProjectDTO
 */
function projectRowToDTO(row: ProjectRow): ProjectDTO {
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		summary: row.summary,
		content: row.content,
		thumbnail_url: row.thumbnail_url,
		gallery_urls: row.gallery_urls,
		tech_stack: row.tech_stack,
		category: row.category as ProjectCategory,
		repo_url: row.repo_url,
		demo_url: row.demo_url,
		notebook_url: row.notebook_url,
		is_featured: row.is_featured,
		status: row.status as ProjectStatus,
		created_at: row.created_at.toISOString(),
		updated_at: row.updated_at.toISOString(),
	};
}
