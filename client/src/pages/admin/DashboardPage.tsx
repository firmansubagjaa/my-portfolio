import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Pagination } from "@/components/projects/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/config/constants";
import {
	useAdminProjectStats,
	useAdminProjects,
	useDeleteProject,
} from "@/hooks/queries/use-admin-projects";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/cn";
import type { AdminProjectFilters } from "@/services/admin-projects.service";
import type { ProjectCategory, ProjectListItemDTO, ProjectStatus } from "@/types/api";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/types/api";

const PAGE_SIZE = 10;

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

const categoryOptions = PROJECT_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));
const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }));

const STATUS_BADGE: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
	published: "success",
	draft: "warning",
	archived: "neutral",
};

const STATUS_DOT: Record<ProjectStatus | "all", string> = {
	all: "bg-accent",
	published: "bg-green-400",
	draft: "bg-yellow-400",
	archived: "bg-muted",
};

function formatDate(iso: string): string {
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function ProjectThumbnail({
	project,
	className,
}: {
	project: ProjectListItemDTO;
	className?: string;
}) {
	if (project.thumbnail_url) {
		return (
			<img
				src={project.thumbnail_url}
				alt=""
				loading="lazy"
				className={cn("shrink-0 rounded border border-border bg-bg object-cover", className)}
			/>
		);
	}
	return (
		<div
			aria-hidden="true"
			className={cn(
				"flex shrink-0 items-center justify-center rounded border border-border bg-bg font-mono text-sm text-muted",
				className,
			)}
		>
			{project.title.charAt(0).toUpperCase()}
		</div>
	);
}

function StatusBadge({ status }: { status: ProjectStatus }) {
	return <Badge variant={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</Badge>;
}

function ProjectActions({
	project,
	onDelete,
}: {
	project: ProjectListItemDTO;
	onDelete: (project: ProjectListItemDTO) => void;
}) {
	return (
		<>
			{project.status === "published" && (
				<a
					href={`/projects/${project.slug}`}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`Lihat ${project.title} di situs (tab baru)`}
					className={buttonClasses({ variant: "ghost", size: "sm" })}
				>
					Lihat
				</a>
			)}
			<Link
				to={`/admin/projects/${project.id}/edit`}
				aria-label={`Edit ${project.title}`}
				className={buttonClasses({ variant: "secondary", size: "sm" })}
			>
				Edit
			</Link>
			<Button
				variant="danger"
				size="sm"
				aria-label={`Hapus ${project.title}`}
				onClick={() => onDelete(project)}
			>
				Hapus
			</Button>
		</>
	);
}

function StatCard({
	label,
	value,
	dot,
	isLoading,
}: {
	label: string;
	value: number | undefined;
	dot: string;
	isLoading: boolean;
}) {
	return (
		<Card padding="sm" className="flex flex-col gap-1">
			<p className="flex items-center gap-2 text-sm text-muted">
				<span aria-hidden="true" className={cn("h-2 w-2 rounded-full", dot)} />
				{label}
			</p>
			{isLoading ? (
				<Skeleton tone="border" className="h-8 w-12" />
			) : (
				<p className="text-2xl font-bold text-fg">{value ?? "-"}</p>
			)}
		</Card>
	);
}

export default function DashboardPage() {
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [category, setCategory] = useState<ProjectCategory | "">("");
	const [status, setStatus] = useState<ProjectStatus | "">("");
	const [deleteTarget, setDeleteTarget] = useState<ProjectListItemDTO | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

	const filters: AdminProjectFilters = {
		...(category && { category }),
		...(status && { status }),
		...(debouncedSearch && { search: debouncedSearch }),
	};
	const hasFilters = Boolean(category || status || searchInput.trim());

	const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useAdminProjects(
		page,
		PAGE_SIZE,
		filters,
	);
	const stats = useAdminProjectStats();
	const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

	const projects = data?.items ?? [];
	const pagination = data?.pagination;

	// Reset to page 1 whenever the (debounced) search changes
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch]);

	// Deleting the last row of the last page leaves us past the end: step back
	useEffect(() => {
		if (!pagination || isPlaceholderData) return;
		if (pagination.total_pages > 0 && page > pagination.total_pages) {
			setPage(pagination.total_pages);
		}
	}, [pagination, isPlaceholderData, page]);

	const resetFilters = () => {
		setSearchInput("");
		setCategory("");
		setStatus("");
		setPage(1);
	};

	const openDelete = (project: ProjectListItemDTO) => {
		setDeleteError(null);
		setDeleteTarget(project);
	};

	const closeDelete = () => {
		setDeleteTarget(null);
		setDeleteError(null);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteProject(deleteTarget.id, {
			onSuccess: () => {
				toast.success(`Proyek "${deleteTarget.title}" dihapus`);
				closeDelete();
			},
			onError: (err) => {
				const message = err.message || "Gagal menghapus proyek. Coba lagi.";
				setDeleteError(message);
				toast.error(message);
			},
		});
	};

	const from = pagination ? (pagination.current_page - 1) * pagination.limit + 1 : 0;
	const to = pagination ? from + projects.length - 1 : 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-fg sm:text-3xl">Manajemen Proyek</h1>
					<p className="mt-1 text-sm text-muted">Kelola semua proyek portfolio Anda.</p>
				</div>
				<Link to="/admin/projects/new" className={buttonClasses({ variant: "primary" })}>
					+ Buat Proyek Baru
				</Link>
			</div>

			{/* Stats */}
			<section aria-label="Ringkasan proyek" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard
					label="Total Proyek"
					value={stats.data?.total}
					dot={STATUS_DOT.all}
					isLoading={stats.isLoading}
				/>
				<StatCard
					label={STATUS_LABELS.published}
					value={stats.data?.published}
					dot={STATUS_DOT.published}
					isLoading={stats.isLoading}
				/>
				<StatCard
					label={STATUS_LABELS.draft}
					value={stats.data?.draft}
					dot={STATUS_DOT.draft}
					isLoading={stats.isLoading}
				/>
				<StatCard
					label={STATUS_LABELS.archived}
					value={stats.data?.archived}
					dot={STATUS_DOT.archived}
					isLoading={stats.isLoading}
				/>
			</section>

			{/* Filters */}
			<Card padding="sm">
				<search aria-label="Filter proyek">
					<div className="grid gap-4 sm:grid-cols-3">
						<Input
							type="search"
							label="Cari"
							placeholder="Judul, ringkasan, atau teknologi…"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
						<SelectField
							label="Kategori"
							placeholder="Semua Kategori"
							options={categoryOptions}
							value={category || null}
							onValueChange={(value) => {
								setCategory(value ?? "");
								setPage(1);
							}}
						/>
						<SelectField
							label="Status"
							placeholder="Semua Status"
							options={statusOptions}
							value={status || null}
							onValueChange={(value) => {
								setStatus(value ?? "");
								setPage(1);
							}}
						/>
					</div>
					{(hasFilters || (isFetching && !isLoading)) && (
						<div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
							<span className="flex items-center gap-2">
								{isFetching && !isLoading && <Spinner label="Memperbarui daftar" />}
							</span>
							{hasFilters && (
								<Button variant="ghost" size="sm" onClick={resetFilters}>
									Reset filter
								</Button>
							)}
						</div>
					)}
				</search>
			</Card>

			{/* List */}
			<section aria-label="Daftar proyek">
				{isLoading ? (
					<Card padding="none" className="divide-y divide-border">
						{Array.from({ length: 5 }, (_, i) => (
							<div key={i} className="flex items-center gap-4 px-4 py-4">
								<Skeleton className="h-9 w-12" tone="border" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-1/3" tone="border" />
									<Skeleton className="h-3 w-1/5" tone="border" />
								</div>
								<Skeleton tone="border" className="hidden h-8 w-32 md:block" />
							</div>
						))}
						<span className="sr-only">Memuat proyek…</span>
					</Card>
				) : isError ? (
					<Card padding="lg" className="text-center">
						<p className="font-medium text-fg">Gagal memuat proyek.</p>
						<p className="mt-1 text-sm text-muted">Periksa koneksi ke server lalu coba lagi.</p>
						<Button variant="secondary" className="mt-4" onClick={() => refetch()}>
							Coba lagi
						</Button>
					</Card>
				) : projects.length === 0 ? (
					<Card padding="lg" className="flex flex-col items-center text-center">
						<div
							aria-hidden="true"
							className="mb-4 mt-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg text-muted"
						>
							<svg
								aria-hidden="true"
								className="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								{hasFilters ? (
									<>
										<circle cx="11" cy="11" r="8" />
										<path d="m21 21-4.3-4.3" />
									</>
								) : (
									<>
										<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
										<path d="M12 11v4" />
										<path d="M10 13h4" />
									</>
								)}
							</svg>
						</div>
						{hasFilters ? (
							<>
								<p className="font-medium text-fg">Tidak ada proyek yang cocok dengan filter.</p>
								<p className="mt-1 text-sm text-muted">Coba kata kunci atau filter lain.</p>
								<Button variant="secondary" className="mt-4" onClick={resetFilters}>
									Reset filter
								</Button>
							</>
						) : (
							<>
								<p className="font-medium text-fg">Belum ada proyek</p>
								<p className="mt-1 text-sm text-muted">Mulai dengan membuat proyek pertama Anda.</p>
								<Link
									to="/admin/projects/new"
									className={buttonClasses({ variant: "primary", className: "mt-4" })}
								>
									+ Buat Proyek Baru
								</Link>
							</>
						)}
					</Card>
				) : (
					<Card padding="none" className={cn("overflow-hidden", isPlaceholderData && "opacity-70")}>
						{/* Desktop: table */}
						<div className="hidden overflow-x-auto md:block">
							<table className="w-full text-left text-sm">
								<caption className="sr-only">Daftar proyek</caption>
								<thead className="border-b border-border bg-bg/60 text-xs uppercase tracking-wide text-muted">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											Proyek
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											Kategori
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											Status
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											Diperbarui
										</th>
										<th scope="col" className="px-4 py-3 text-right font-medium">
											<span className="sr-only">Aksi</span>
										</th>
									</tr>
								</thead>
								<tbody>
									{projects.map((project) => (
										<tr
											key={project.id}
											className="border-b border-border transition-colors last:border-0 hover:bg-bg/40"
										>
											<td className="px-4 py-3">
												<div className="flex items-center gap-3">
													<ProjectThumbnail project={project} className="h-9 w-12" />
													<div className="min-w-0">
														<p className="flex flex-wrap items-center gap-2 font-medium text-fg">
															<span className="truncate">{project.title}</span>
															{project.is_featured && <Badge variant="accent">Featured</Badge>}
														</p>
														<p className="truncate font-mono text-xs text-muted">{project.slug}</p>
													</div>
												</div>
											</td>
											<td className="whitespace-nowrap px-4 py-3 text-muted">
												{CATEGORY_LABELS[project.category] ?? project.category}
											</td>
											<td className="px-4 py-3">
												<StatusBadge status={project.status} />
											</td>
											<td className="whitespace-nowrap px-4 py-3 text-muted">
												<time dateTime={project.updated_at}>{formatDate(project.updated_at)}</time>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center justify-end gap-2">
													<ProjectActions project={project} onDelete={openDelete} />
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile: cards */}
						<ul className="divide-y divide-border md:hidden">
							{projects.map((project) => (
								<li key={project.id} className="space-y-3 p-4">
									<div className="flex items-start gap-3">
										<ProjectThumbnail project={project} className="h-12 w-16" />
										<div className="min-w-0 flex-1">
											<p className="font-medium break-words text-fg">{project.title}</p>
											<p className="truncate font-mono text-xs text-muted">{project.slug}</p>
										</div>
									</div>
									<div className="flex flex-wrap items-center gap-2 text-xs text-muted">
										<StatusBadge status={project.status} />
										{project.is_featured && <Badge variant="accent">Featured</Badge>}
										<span>{CATEGORY_LABELS[project.category] ?? project.category}</span>
										<span aria-hidden="true">·</span>
										<time dateTime={project.updated_at}>{formatDate(project.updated_at)}</time>
									</div>
									<div className="flex flex-wrap gap-2">
										<ProjectActions project={project} onDelete={openDelete} />
									</div>
								</li>
							))}
						</ul>
					</Card>
				)}

				{pagination && pagination.total_items > 0 && (
					<p className="mt-4 text-sm text-muted">
						Menampilkan {from}–{to} dari {pagination.total_items} proyek
					</p>
				)}
				{pagination && pagination.total_pages > 1 && (
					<Pagination current={page} total={pagination.total_pages} onChange={setPage} />
				)}
			</section>

			{deleteTarget && (
				<ConfirmDialog
					title="Hapus Proyek?"
					description={`Proyek "${deleteTarget.title}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`}
					confirmLabel="Hapus"
					cancelLabel="Batal"
					isDangerous
					onConfirm={confirmDelete}
					onCancel={closeDelete}
					isLoading={isDeleting}
					error={deleteError}
				/>
			)}
		</div>
	);
}
