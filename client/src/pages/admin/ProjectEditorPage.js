import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiGet, apiPut } from "@/services/api-client";
import { updateProjectSchema } from "@/types/api";
export default function ProjectEditorPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { data: project, isLoading: projectLoading } = useQuery({
		queryKey: ["project", id],
		queryFn: () => apiGet(`/api/v1/admin/projects/${id}`),
		enabled: !!id,
	});
	const { mutate: updateProject, isPending } = useMutation({
		mutationFn: (data) => apiPut(`/api/v1/admin/projects/${id}`, data),
		onSuccess: () => navigate("/admin"),
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(updateProjectSchema),
		values: project || {},
	});
	const onSubmit = (data) => {
		updateProject(data);
	};
	if (projectLoading) {
		return _jsx(Skeleton, { className: "h-96" });
	}
	return _jsxs("div", {
		className: "max-w-4xl mx-auto px-4 py-16",
		children: [
			_jsx("h1", {
				className: "text-4xl font-bold text-[--color-fg] mb-8",
				children: "Edit Proyek",
			}),
			_jsxs("form", {
				onSubmit: handleSubmit(onSubmit),
				className: "space-y-6",
				children: [
					_jsxs("div", {
						children: [
							_jsx("label", {
								htmlFor: "title",
								className: "block text-sm font-medium text-[--color-fg] mb-1",
								children: "Judul",
							}),
							_jsx("input", {
								...register("title"),
								type: "text",
								className:
									"w-full px-4 py-2 bg-[--color-bg] border border-[--color-border] rounded text-[--color-fg] focus:outline-none focus:border-[--color-accent]",
							}),
							errors.title &&
								_jsx("p", {
									className: "text-red-400 text-sm mt-1",
									children: errors.title.message,
								}),
						],
					}),
					_jsxs("div", {
						children: [
							_jsx("label", {
								htmlFor: "slug",
								className: "block text-sm font-medium text-[--color-fg] mb-1",
								children: "Slug",
							}),
							_jsx("input", {
								...register("slug"),
								type: "text",
								className:
									"w-full px-4 py-2 bg-[--color-bg] border border-[--color-border] rounded text-[--color-fg] focus:outline-none focus:border-[--color-accent]",
							}),
							errors.slug &&
								_jsx("p", {
									className: "text-red-400 text-sm mt-1",
									children: errors.slug.message,
								}),
						],
					}),
					_jsxs("div", {
						children: [
							_jsx("label", {
								htmlFor: "summary",
								className: "block text-sm font-medium text-[--color-fg] mb-1",
								children: "Summary",
							}),
							_jsx("textarea", {
								...register("summary"),
								className:
									"w-full px-4 py-2 bg-[--color-bg] border border-[--color-border] rounded text-[--color-fg] focus:outline-none focus:border-[--color-accent]",
								rows: 3,
							}),
							errors.summary &&
								_jsx("p", {
									className: "text-red-400 text-sm mt-1",
									children: errors.summary.message,
								}),
						],
					}),
					_jsxs("div", {
						className: "flex gap-4",
						children: [
							_jsx(Button, {
								type: "submit",
								variant: "primary",
								isLoading: isPending,
								children: "Simpan",
							}),
							_jsx(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => navigate("/admin"),
								children: "Batal",
							}),
						],
					}),
				],
			}),
		],
	});
}
