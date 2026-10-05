// File: /client/src/components/form/ProjectForm.tsx
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ProjectDTO } from "@/types/api";
import {
	createProjectSchema,
	updateProjectSchema,
	PROJECT_CATEGORIES,
	PROJECT_STATUSES,
} from "@/types/api";
import { useCheckSlugAvailability } from "@/hooks/queries/use-admin-projects";
import { slugify } from "@/lib/slugify";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { Checkbox } from "../ui/Checkbox";
import { FieldError } from "../ui/FieldError";
import { Spinner } from "../ui/Spinner";
import { ImageUploadField } from "./ImageUploadField";
import { GalleryUploadField } from "./GalleryUploadField";
import { TagInput } from "./TagInput";
import { MarkdownEditorField } from "./MarkdownEditorField";

const projectFormSchema = z.union([createProjectSchema, updateProjectSchema]);
type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
	project?: ProjectDTO;
	onSubmit: (data: ProjectFormData) => Promise<void>;
	isLoading?: boolean;
	error?: string;
	onCancel?: () => void;
}

export function ProjectForm({
	project,
	onSubmit,
	isLoading = false,
	error: externalError,
	onCancel,
}: ProjectFormProps) {
	const isEditMode = !!project;
	const schema = isEditMode ? updateProjectSchema : createProjectSchema;
	const [slugCheckError, setSlugCheckError] = useState<string | null>(null);

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<ProjectFormData>({
		resolver: zodResolver(schema),
		defaultValues: project || {
			title: "",
			slug: "",
			summary: "",
			content: "",
			category: "fullstack",
			status: "draft",
			is_featured: false,
			tech_stack: [],
		},
	});

	// Watch title and slug fields
	const titleValue = watch("title");
	const slugValue = watch("slug");

	// Auto-generate slug from title on create mode
	useEffect(() => {
		if (!isEditMode && titleValue) {
			const generatedSlug = slugify(titleValue);
			setValue("slug", generatedSlug);
		}
	}, [titleValue, isEditMode, setValue]);

	// Check slug availability on blur (HIGH-1 implementation)
	const {
		data: slugCheckData,
		isLoading: isCheckingSlug,
		isFetched: slugCheckFetched,
	} = useCheckSlugAvailability(slugValue || "", (slugValue?.length || 0) > 0);

	// Show slug availability feedback (HIGH-1)
	const showSlugCheckmark = slugCheckFetched && slugCheckData?.available;
	const showSlugWarning = slugCheckFetched && !slugCheckData?.available;

	const categoryOptions = PROJECT_CATEGORIES.map((c) => ({
		value: c,
		label: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, " "),
	}));

	const statusOptions = PROJECT_STATUSES.map((s) => ({
		value: s,
		label: s.charAt(0).toUpperCase() + s.slice(1),
	}));

	const handleFormSubmit = handleSubmit(async (data) => {
		setSlugCheckError(null);

		try {
			await onSubmit(data);
		} catch (err: any) {
			// Handle 409 conflict error
			if (err.status === 409 && err.category === "CONFLICT") {
				setSlugCheckError(err.message || "Slug sudah digunakan");
				// Invalidate the slug check query to clear stale UI state
			}
		}
	});

	return (
		<form onSubmit={handleFormSubmit} className="space-y-6">
			{/* Error banner for slug conflicts */}
			{slugCheckError && (
				<div className="p-4 bg-red-900/20 border border-red-700 rounded-md">
					<p className="text-sm text-red-200">{slugCheckError}</p>
				</div>
			)}

			{externalError && (
				<div className="p-4 bg-red-900/20 border border-red-700 rounded-md">
					<p className="text-sm text-red-200">{externalError}</p>
				</div>
			)}

			{/* Title */}
			<Input
				label="Judul"
				required
				placeholder="Judul proyek"
				{...register("title")}
				error={errors.title}
			/>

			{/* Slug with availability check (HIGH-1) */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium text-neutral-700">
					Slug <span className="text-red-500">*</span>
				</label>
				<div className="flex items-end gap-2">
					<div className="flex-1">
						<input
							type="text"
							placeholder="project-slug"
							className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
							{...register("slug")}
						/>
					</div>
					{isCheckingSlug && <Spinner />}
					{showSlugCheckmark && (
						<span className="text-green-500 text-xl">✓</span>
					)}
					{showSlugWarning && (
						<span className="text-yellow-500 text-xl" title="Slug sudah digunakan">
							⚠️
						</span>
					)}
				</div>
				{showSlugWarning && (
					<p className="text-xs text-yellow-600">
						Slug sudah digunakan (advisory only)
					</p>
				)}
				<FieldError error={errors.slug} />
			</div>

			{/* Summary */}
			<Textarea
				label="Ringkasan"
				required
				placeholder="Ringkasan singkat proyek"
				rows={3}
				{...register("summary")}
				error={errors.summary}
			/>

			{/* Thumbnail */}
			<Controller
				name="thumbnail_url"
				control={control}
				render={({ field }) => (
					<ImageUploadField
						label="Gambar Thumbnail"
						value={field.value || ""}
						onChange={field.onChange}
						error={errors.thumbnail_url}
					/>
				)}
			/>

			{/* Gallery */}
			<Controller
				name="gallery_urls"
				control={control}
				render={({ field }) => (
					<GalleryUploadField
						label="Galeri Gambar"
						value={field.value || []}
						onChange={field.onChange}
						error={errors.gallery_urls}
						maxImages={12}
					/>
				)}
			/>

			{/* Content (Markdown) */}
			<Controller
				name="content"
				control={control}
				render={({ field }) => (
					<MarkdownEditorField
						label="Konten"
						required
						value={field.value || ""}
						onChange={field.onChange}
						error={errors.content}
						placeholder="Tulis konten proyek dengan markdown..."
					/>
				)}
			/>

			{/* Tech Stack */}
			<Controller
				name="tech_stack"
				control={control}
				render={({ field }) => (
					<TagInput
						label="Tech Stack"
						value={field.value || []}
						onChange={field.onChange}
						error={errors.tech_stack}
						maxTags={20}
					/>
				)}
			/>

			{/* Category */}
			<Select
				label="Kategori"
				required
				options={categoryOptions}
				{...register("category")}
				error={errors.category}
			/>

			{/* Status */}
			<Select
				label="Status"
				required
				options={statusOptions}
				{...register("status")}
				error={errors.status}
			/>

			{/* URLs Section */}
			<div className="space-y-4 p-4 bg-neutral-50 rounded-md">
				<h3 className="font-medium text-neutral-900">URL Tautan</h3>

				<Input
					label="Repository"
					placeholder="https://github.com/..."
					{...register("repo_url")}
					error={errors.repo_url}
				/>

				<Input
					label="Demo"
					placeholder="https://..."
					{...register("demo_url")}
					error={errors.demo_url}
				/>

				<Input
					label="Notebook"
					placeholder="https://..."
					{...register("notebook_url")}
					error={errors.notebook_url}
				/>
			</div>

			{/* Featured checkbox */}
			<Controller
				name="is_featured"
				control={control}
				render={({ field }) => (
					<Checkbox
						label="Tampilkan di halaman utama (Featured)"
						checked={field.value}
						onChange={field.onChange}
					/>
				)}
			/>

			{/* Form actions */}
			<div className="flex gap-3 justify-end">
				{onCancel && (
					<Button
						type="button"
						variant="secondary"
						onClick={onCancel}
						disabled={isLoading}
					>
						Batal
					</Button>
				)}
				<Button type="submit" disabled={isLoading}>
					{isLoading ? <Spinner /> : isEditMode ? "Perbarui" : "Buat"}
				</Button>
			</div>
		</form>
	);
}
