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
	ProjectStatus,
	AdminProjectListQuery,
} from "@shared/dto";

export {
	createProjectSchema,
	loginSchema,
	PROJECT_CATEGORIES,
	PROJECT_STATUSES,
	projectListQuerySchema,
	publicProjectListQuerySchema,
	updateProjectSchema,
	adminProjectListQuerySchema,
} from "@shared/dto";
