import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiGet, apiPut } from "@/services/api-client";
import type { ProjectDTO, UpdateProjectInput } from "@/types/api";
import { updateProjectSchema } from "@/types/api";

export default function ProjectEditorPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: project, isLoading: projectLoading } = useQuery({
		queryKey: ["project", id],
		queryFn: () => apiGet<ProjectDTO>(`/api/v1/admin/projects/${id}`),
		enabled: !!id,
	});

	const { mutate: updateProject, isPending } = useMutation({
		mutationFn: (data: UpdateProjectInput) => apiPut(`/api/v1/admin/projects/${id}`, data),
		onSuccess: () => navigate("/admin"),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdateProjectInput>({
		resolver: zodResolver(updateProjectSchema),
		values: project || {},
	});

	const onSubmit = (data: UpdateProjectInput) => {
		updateProject(data);
	};

	if (projectLoading) {
		return <Skeleton className="h-96" />;
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-16">
			<h1 className="text-4xl font-bold text-[--color-fg] mb-8">Edit Proyek</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div>
					<label htmlFor="title" className="block text-sm font-medium text-[--color-fg] mb-1">
						Judul
					</label>
					<input
						{...register("title")}
						type="text"
						className="w-full px-4 py-2 bg-[--color-bg] border border-[--color-border] rounded text-[--color-fg] focus:outline-none focus:border-[--color-accent]"
					/>
					{errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
				</div>

				<div>
					<label htmlFor="slug" className="block text-sm font-medium text-[--color-fg] mb-1">
						Slug
					</label>
					<input
						{...register("slug")}
						type="text"
						className="w-full px-4 py-2 bg-[--color-bg] border border-[--color-border] rounded text-[--color-fg] focus:outline-none focus:border-[--color-accent]"
					/>
					{errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>}
				</div>

				<div>
					<label htmlFor="summary" className="block text-sm font-medium text-[--color-fg] mb-1">
						Summary
					</label>
					<textarea
						{...register("summary")}
						className="w-full px-4 py-2 bg-[--color-bg] border border-[--color-border] rounded text-[--color-fg] focus:outline-none focus:border-[--color-accent]"
						rows={3}
					/>
					{errors.summary && <p className="text-red-400 text-sm mt-1">{errors.summary.message}</p>}
				</div>

				<div className="flex gap-4">
					<Button type="submit" variant="primary" isLoading={isPending}>
						Simpan
					</Button>
					<Button type="button" variant="secondary" onClick={() => navigate("/admin")}>
						Batal
					</Button>
				</div>
			</form>
		</div>
	);
}
