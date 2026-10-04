// Re-export all DTOs from shared
export type {
	ApiError,
	ApiErrorCategory,
	ApiSuccess,
	CreateProjectInput,
	LoginInput,
	PaginationMeta,
	ProjectDTO,
	ProjectListQuery,
	UpdateProjectInput,
} from "@shared/dto";

export {
	createProjectSchema,
	loginSchema,
	projectListQuerySchema,
	updateProjectSchema,
} from "@shared/dto";
