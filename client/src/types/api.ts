// Re-export all DTOs from shared
export type {
	ApiError,
	ApiErrorCategory,
	ApiSuccess,
	CreateProjectInput,
	LoginInput,
	PaginationMeta,
	ProjectCategory,
	ProjectDTO,
	ProjectListItemDTO,
	ProjectListQuery,
	ProjectListResponse,
	PublicProjectListQuery,
	UpdateProjectInput,
} from "@shared/dto";

export {
	createProjectSchema,
	loginSchema,
	PROJECT_CATEGORIES,
	projectListQuerySchema,
	publicProjectListQuerySchema,
	updateProjectSchema,
} from "@shared/dto";
