import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Spinner } from "@/components/ui/Spinner";
import { ProjectForm } from "@/components/form/ProjectForm";
import {
	useAdminProject,
	useCreateProject,
	useUpdateProject,
} from "@/hooks/queries/use-admin-projects";
import type { ProjectDTO } from "@/types/api";

export default function ProjectEditorPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!id;

	// Fetch project if editing
	const { data: project, isLoading: projectLoading } = useAdminProject(id || "");

	// Mutations
	const { mutate: createProject, isPending: isCreating } = useCreateProject();
	const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject();

	const handleSubmit = async (data: any) => {
		setError(null);

		if (isEditMode) {
			try {
				await updateProject({ id: id!, data });
				navigate("/admin");
			} catch (err: any) {
				if (err.status === 409) {
					throw err; // Let ProjectForm handle this
				}
				setError(err.message || "Gagal memperbarui proyek");
				throw err;
			}
		} else {
			return new Promise<void>((resolve, reject) => {
				createProject(data, {
					onSuccess: () => {
						navigate("/admin");
						resolve();
					},
					onError: (err: any) => {
						if (err.status === 409) {
							reject(err); // Let ProjectForm handle this
						} else {
							setError(err.message || "Gagal membuat proyek");
							reject(err);
						}
					},
				});
			});
		}
	};

	if (projectLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner label="Memuat proyek" />
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-neutral-900 mb-8">
				{isEditMode ? "Edit Proyek" : "Buat Proyek Baru"}
			</h1>

			<ProjectForm
				project={project as ProjectDTO | undefined}
				onSubmit={handleSubmit}
				isLoading={isCreating || isUpdating}
				error={error || undefined}
				onCancel={() => navigate("/admin")}
			/>
		</div>
	);
}
