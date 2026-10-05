import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ProjectForm, type ProjectFormData } from "@/components/form/ProjectForm";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
	useAdminProject,
	useCreateProject,
	useUpdateProject,
} from "@/hooks/queries/use-admin-projects";
import { ApiClientError } from "@/services/api-client";
import type { CreateProjectInput } from "@/types/api";

function BackLink() {
	return (
		<Link
			to="/admin"
			className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
		>
			<span aria-hidden="true">←</span> Kembali ke daftar proyek
		</Link>
	);
}

export default function ProjectEditorPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!id;

	// Fetch project if editing (query is disabled on /admin/projects/new)
	const {
		data: project,
		isLoading: projectLoading,
		error: projectError,
		refetch: refetchProject,
		isFetching: projectFetching,
	} = useAdminProject(id ?? "");
	// Only a 404 means "not found"; anything else (server/DB down) is retryable
	const projectNotFound = projectError instanceof ApiClientError && projectError.status === 404;

	const { mutateAsync: createProject, isPending: isCreating } = useCreateProject();
	const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject();

	const handleSubmit = async (data: ProjectFormData) => {
		setError(null);

		try {
			if (id) {
				await updateProject({ id, data });
				toast.success("Perubahan disimpan");
			} else {
				// Create mode validates with createProjectSchema, so every required field is present
				await createProject(data as CreateProjectInput);
				toast.success("Proyek berhasil dibuat");
			}
			navigate("/admin");
		} catch (err) {
			// 409 slug conflict is shown by ProjectForm itself
			if (!(err instanceof ApiClientError && err.status === 409)) {
				setError(
					(err instanceof Error && err.message) ||
						(isEditMode ? "Gagal memperbarui proyek" : "Gagal membuat proyek"),
				);
			}
			throw err;
		}
	};

	const heading = isEditMode ? "Edit Proyek" : "Buat Proyek Baru";

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="space-y-3">
				<BackLink />
				<div>
					<h1 className="text-2xl font-bold text-fg sm:text-3xl">{heading}</h1>
					<p className="mt-1 text-sm text-muted">
						{isEditMode
							? project
								? `Memperbarui "${project.title}"`
								: "Memuat data proyek…"
							: "Isi detail proyek baru untuk ditampilkan di portfolio."}
					</p>
				</div>
			</div>

			{isEditMode && projectLoading ? (
				<div className="space-y-6" aria-busy="true">
					<span className="sr-only">Memuat proyek…</span>
					{[0, 1, 2].map((block) => (
						<Card key={block} padding="lg" className="space-y-4">
							<Skeleton tone="border" className="h-5 w-40" />
							<Skeleton tone="border" className="h-10 w-full" />
							<Skeleton tone="border" className="h-10 w-full" />
							<Skeleton tone="border" className="h-20 w-full" />
						</Card>
					))}
				</div>
			) : isEditMode && (projectError || !project) ? (
				<Card padding="lg" className="text-center">
					{projectNotFound ? (
						<>
							<p className="font-medium text-fg">Proyek tidak ditemukan.</p>
							<p className="mt-1 text-sm text-muted">Proyek mungkin sudah dihapus.</p>
						</>
					) : (
						<>
							<p className="font-medium text-fg">Gagal memuat proyek.</p>
							<p className="mt-1 text-sm text-muted">Periksa koneksi ke server lalu coba lagi.</p>
						</>
					)}
					<div className="mt-4 flex flex-wrap justify-center gap-3">
						{!projectNotFound && (
							<Button
								variant="primary"
								onClick={() => refetchProject()}
								isLoading={projectFetching}
							>
								Coba lagi
							</Button>
						)}
						<Link to="/admin" className={buttonClasses({ variant: "secondary" })}>
							Kembali ke daftar proyek
						</Link>
					</div>
				</Card>
			) : (
				<ProjectForm
					project={project}
					onSubmit={handleSubmit}
					isLoading={isCreating || isUpdating}
					error={error ?? undefined}
					onCancel={() => navigate("/admin")}
				/>
			)}
		</div>
	);
}
