// File: /client/src/components/form/ProjectForm.tsx
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/config/constants";
import { useCheckSlugAvailability } from "@/hooks/queries/use-admin-projects";
import { slugify } from "@/lib/slugify";
import { zodResolver } from "@/lib/zod-resolver";
import { ApiClientError } from "@/services/api-client";
import type { ProjectDTO } from "@/types/api";
import {
	createProjectSchema,
	PROJECT_CATEGORIES,
	PROJECT_STATUSES,
	updateProjectSchema,
} from "@/types/api";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { SelectField } from "../ui/Select";
import { Spinner } from "../ui/Spinner";
import { Textarea } from "../ui/Textarea";
import { GalleryUploadField } from "./GalleryUploadField";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditorField } from "./MarkdownEditorField";
import { TagInput } from "./TagInput";

const projectFormSchema = z.union([createProjectSchema, updateProjectSchema]);
export type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
	project?: ProjectDTO;
	onSubmit: (data: ProjectFormData) => Promise<void>;
	isLoading?: boolean;
	error?: string;
	onCancel?: () => void;
}

const categoryOptions = PROJECT_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));
const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }));

const SUMMARY_MAX = 280;

// Empty optional URL inputs must be sent as null (the schema rejects "")
const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

function FormSection({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<Card padding="lg" className="space-y-5">
			<div>
				<h2 className="text-base font-semibold text-fg">{title}</h2>
				{description && <p className="mt-1 text-sm text-muted">{description}</p>}
			</div>
			{children}
		</Card>
	);
}

function ErrorBanner({ message }: { message: string }) {
	const ref = useRef<HTMLDivElement>(null);

	// Bring the banner into view: it renders at the top of a long form
	useEffect(() => {
		ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
		ref.current?.focus({ preventScroll: true });
	}, []);

	return (
		<div
			ref={ref}
			role="alert"
			tabIndex={-1}
			className="rounded-md border border-red-800 bg-red-900/20 p-4 text-sm text-red-200 focus:outline-none"
		>
			{message}
		</div>
	);
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
	const [slugConflictError, setSlugConflictError] = useState<string | null>(null);
	// Slug availability is checked for the value present when the slug/title field loses focus
	const [slugToCheck, setSlugToCheck] = useState("");

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		getValues,
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
			gallery_urls: [],
			thumbnail_url: null,
			repo_url: null,
			demo_url: null,
			notebook_url: null,
		},
	});

	const titleValue = watch("title");
	const slugValue = watch("slug") ?? "";
	const summaryLength = watch("summary")?.length ?? 0;

	// Auto-generate slug from title on create mode
	useEffect(() => {
		if (!isEditMode && titleValue) {
			setValue("slug", slugify(titleValue));
		}
	}, [titleValue, isEditMode, setValue]);

	const {
		data: slugCheckData,
		isLoading: isCheckingSlug,
		isFetched: slugCheckFetched,
		isError: slugCheckFailed,
	} = useCheckSlugAvailability(
		slugToCheck,
		slugToCheck.length >= 3 && slugToCheck !== project?.slug,
	);

	// Only show a result that belongs to the slug currently in the field
	const slugCheckCurrent = slugToCheck === slugValue && slugToCheck !== project?.slug;
	const showSlugChecking = slugCheckCurrent && isCheckingSlug;
	const showSlugAvailable =
		slugCheckCurrent && slugCheckFetched && slugCheckData?.available === true;
	const showSlugTaken = slugCheckCurrent && slugCheckFetched && slugCheckData?.available === false;
	const showSlugCheckFailed = slugCheckCurrent && !isCheckingSlug && slugCheckFailed;

	const triggerSlugCheck = () => setSlugToCheck(getValues("slug") ?? "");

	const titleField = register("title");
	const slugField = register("slug");

	const handleFormSubmit = handleSubmit(async (data) => {
		setSlugConflictError(null);

		try {
			await onSubmit(data);
		} catch (err) {
			// 409: slug was taken between the advisory check and submit
			if (err instanceof ApiClientError && err.status === 409) {
				setSlugConflictError(err.message || "Slug sudah digunakan. Gunakan slug lain.");
			}
		}
	});

	return (
		<form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
			{slugConflictError && <ErrorBanner key={slugConflictError} message={slugConflictError} />}
			{externalError && <ErrorBanner key={externalError} message={externalError} />}

			<FormSection
				title="Informasi Dasar"
				description="Judul, slug, dan ringkasan yang tampil di daftar proyek."
			>
				<Input
					label="Judul"
					required
					placeholder="Judul proyek"
					{...titleField}
					onBlur={(e) => {
						titleField.onBlur(e);
						if (!isEditMode) triggerSlugCheck();
					}}
					error={errors.title}
				/>

				<div className="flex flex-col gap-1.5">
					<Input
						label="Slug"
						required
						placeholder="judul-proyek"
						className="font-mono"
						hint={`URL publik: /projects/${slugValue || "…"}`}
						{...slugField}
						onBlur={(e) => {
							slugField.onBlur(e);
							triggerSlugCheck();
						}}
						error={errors.slug}
					/>
					<div aria-live="polite" className="min-h-5 text-sm">
						{showSlugChecking && (
							<span className="inline-flex items-center gap-2 text-muted">
								<Spinner label="Memeriksa slug" />
								Memeriksa ketersediaan slug…
							</span>
						)}
						{showSlugAvailable && (
							<span className="inline-flex items-center gap-2 text-green-400">
								<svg
									aria-hidden="true"
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M20 6 9 17l-5-5" />
								</svg>
								Slug tersedia
							</span>
						)}
						{showSlugTaken && (
							<span className="inline-flex items-center gap-2 text-yellow-400">
								<svg
									aria-hidden="true"
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M12 9v4" />
									<path d="M12 17h.01" />
									<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
								</svg>
								Slug sudah digunakan (advisory only)
							</span>
						)}
						{showSlugCheckFailed && (
							<span className="text-muted">
								Tidak dapat memeriksa ketersediaan slug. Konflik tetap dicek saat menyimpan.
							</span>
						)}
					</div>
				</div>

				<Textarea
					label="Ringkasan"
					required
					placeholder="Ringkasan singkat proyek"
					rows={3}
					hint={
						<span className="flex justify-between gap-3">
							<span>10–{SUMMARY_MAX} karakter.</span>
							<span className={summaryLength > SUMMARY_MAX ? "text-red-400" : undefined}>
								{summaryLength} / {SUMMARY_MAX}
							</span>
						</span>
					}
					{...register("summary")}
					error={errors.summary}
				/>

				<div className="grid gap-5 sm:grid-cols-2">
					<Controller
						name="category"
						control={control}
						render={({ field }) => (
							<SelectField
								label="Kategori"
								required
								options={categoryOptions}
								name={field.name}
								ref={field.ref}
								value={field.value ?? null}
								onValueChange={(value) => {
									if (value) field.onChange(value);
								}}
								onBlur={field.onBlur}
								error={errors.category}
							/>
						)}
					/>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<SelectField
								label="Status"
								required
								options={statusOptions}
								name={field.name}
								ref={field.ref}
								value={field.value ?? null}
								onValueChange={(value) => {
									if (value) field.onChange(value);
								}}
								onBlur={field.onBlur}
								error={errors.status}
							/>
						)}
					/>
				</div>

				<Controller
					name="is_featured"
					control={control}
					render={({ field }) => (
						<Checkbox
							ref={field.ref}
							name={field.name}
							label="Tampilkan di halaman utama (Featured)"
							description="Proyek featured diprioritaskan di beranda."
							checked={field.value ?? false}
							onChange={(e) => field.onChange(e.target.checked)}
							onBlur={field.onBlur}
						/>
					)}
				/>
			</FormSection>

			<FormSection title="Konten" description="Deskripsi lengkap proyek dalam format Markdown.">
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
			</FormSection>

			<FormSection
				title="Media"
				description="Thumbnail untuk kartu proyek dan galeri untuk halaman detail."
			>
				<Controller
					name="thumbnail_url"
					control={control}
					render={({ field }) => (
						<ImageUploadField
							label="Gambar Thumbnail"
							value={field.value || ""}
							onChange={(url) => field.onChange(url || null)}
							error={errors.thumbnail_url}
						/>
					)}
				/>

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
			</FormSection>

			<FormSection
				title="Tech Stack & Tautan"
				description="Teknologi yang dipakai dan tautan eksternal (opsional)."
			>
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

				<div className="grid gap-5 sm:grid-cols-2">
					<Input
						label="Repository"
						type="url"
						inputMode="url"
						placeholder="https://github.com/..."
						{...register("repo_url", { setValueAs: emptyToNull })}
						error={errors.repo_url}
					/>
					<Input
						label="Demo"
						type="url"
						inputMode="url"
						placeholder="https://..."
						{...register("demo_url", { setValueAs: emptyToNull })}
						error={errors.demo_url}
					/>
					<Input
						label="Notebook"
						type="url"
						inputMode="url"
						placeholder="https://..."
						{...register("notebook_url", { setValueAs: emptyToNull })}
						error={errors.notebook_url}
					/>
				</div>
			</FormSection>

			{/* Form actions stay reachable at the bottom of long forms */}
			<div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-lg border border-border bg-surface/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-end">
				{onCancel && (
					<Button variant="secondary" onClick={onCancel} disabled={isLoading}>
						Batal
					</Button>
				)}
				<Button type="submit" isLoading={isLoading}>
					{isEditMode ? "Simpan Perubahan" : "Buat Proyek"}
				</Button>
			</div>
		</form>
	);
}
