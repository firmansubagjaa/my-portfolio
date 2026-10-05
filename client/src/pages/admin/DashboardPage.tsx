import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAdminProjects, useDeleteProject } from "@/hooks/queries/use-admin-projects";
import { useLogout } from "@/hooks/queries/use-auth";

export default function DashboardPage() {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<{
		status?: string;
		category?: string;
		search?: string;
	}>({});
	const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(
		null,
	);

	const { data: projectsData, isLoading } = useAdminProjects(page, 10, filters);
	const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();

	// Get projects from response - assuming the API returns a paginated response
	const projects = (projectsData as any)?.data || projectsData || [];
	const pagination = (projectsData as any)?.pagination;

	const handleDelete = (id: string, title: string) => {
		setDeleteConfirm({ id, title });
	};

	const confirmDelete = () => {
		if (deleteConfirm) {
			deleteProject(deleteConfirm.id, {
				onSuccess: () => {
					setDeleteConfirm(null);
				},
			});
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner label="Memuat proyek" />
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-neutral-900">Manajemen Proyek</h1>
				<Button onClick={() => logout()} variant="secondary" disabled={isLoggingOut}>
					{isLoggingOut ? <Spinner /> : "Logout"}
				</Button>
			</div>

			{/* Filters */}
			<Card className="p-6 mb-6">
				<div className="grid grid-cols-3 gap-4">
					<input
						type="text"
						placeholder="Cari proyek..."
						value={filters.search || ""}
						onChange={(e) => {
							setFilters((prev) => ({ ...prev, search: e.target.value }));
							setPage(1);
						}}
						className="px-3 py-2 border border-neutral-300 rounded-md bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>

					<select
						value={filters.category || ""}
						onChange={(e) => {
							setFilters((prev) => ({
								...prev,
								category: e.target.value || undefined,
							}));
							setPage(1);
						}}
						className="px-3 py-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Semua Kategori</option>
						<option value="fullstack">Fullstack</option>
						<option value="frontend">Frontend</option>
						<option value="backend">Backend</option>
						<option value="ai_ml">AI/ML</option>
						<option value="experiment">Experiment</option>
					</select>

					<select
						value={filters.status || ""}
						onChange={(e) => {
							setFilters((prev) => ({
								...prev,
								status: e.target.value || undefined,
							}));
							setPage(1);
						}}
						className="px-3 py-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Semua Status</option>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
						<option value="archived">Archived</option>
					</select>
				</div>
			</Card>

			{/* Create Button */}
			<div className="mb-6">
				<Link to="/admin/projects/new">
					<Button>+ Buat Proyek Baru</Button>
				</Link>
			</div>

			{/* Projects Table */}
			<Card className="overflow-hidden">
				{projects.length === 0 ? (
					<div className="p-8 text-center text-neutral-500">
						<p>Tidak ada proyek</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-neutral-200 bg-neutral-50">
									<th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
										Judul
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
										Slug
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
										Kategori
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
										Status
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
										Diperbarui
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
										Aksi
									</th>
								</tr>
							</thead>
							<tbody>
								{projects.map((project: any) => (
									<tr key={project.id} className="border-b border-neutral-200 hover:bg-neutral-50">
										<td className="px-6 py-3 text-sm text-neutral-900">{project.title}</td>
										<td className="px-6 py-3 text-sm text-neutral-600">{project.slug}</td>
										<td className="px-6 py-3 text-sm text-neutral-600">{project.category}</td>
										<td className="px-6 py-3 text-sm">
											<span
												className={`px-2 py-1 rounded text-xs font-medium ${
													project.status === "published"
														? "bg-green-100 text-green-800"
														: project.status === "draft"
															? "bg-yellow-100 text-yellow-800"
															: "bg-gray-100 text-gray-800"
												}`}
											>
												{project.status}
											</span>
										</td>
										<td className="px-6 py-3 text-sm text-neutral-600">
											{new Date(project.updated_at).toLocaleDateString("id-ID")}
										</td>
										<td className="px-6 py-3 text-sm space-x-2 flex">
											<Link to={`/admin/projects/${project.id}/edit`}>
												<Button size="sm" variant="secondary">
													Edit
												</Button>
											</Link>
											<Button
												size="sm"
												variant="secondary"
												className="bg-red-600 hover:bg-red-700 text-white"
												onClick={() => handleDelete(project.id, project.title)}
											>
												Hapus
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{/* Pagination */}
			{pagination && pagination.total_pages > 1 && (
				<div className="mt-6 flex justify-between items-center">
					<p className="text-sm text-neutral-600">
						Halaman {pagination.current_page} dari {pagination.total_pages}
					</p>
					<div className="flex gap-2">
						<Button
							variant="secondary"
							disabled={!pagination.has_prev_page}
							onClick={() => setPage((p) => p - 1)}
						>
							← Sebelumnya
						</Button>
						<Button
							variant="secondary"
							disabled={!pagination.has_next_page}
							onClick={() => setPage((p) => p + 1)}
						>
							Berikutnya →
						</Button>
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			{deleteConfirm && (
				<ConfirmDialog
					title="Hapus Proyek?"
					description={`Proyek "${deleteConfirm.title}" akan dihapus secara permanen.`}
					confirmLabel="Hapus"
					cancelLabel="Batal"
					isDangerous
					onConfirm={confirmDelete}
					onCancel={() => setDeleteConfirm(null)}
					isLoading={isDeleting}
				/>
			)}
		</div>
	);
}
