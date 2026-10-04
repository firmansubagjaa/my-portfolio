import { Link, NavLink, type NavLinkRenderProps } from "react-router";

export function Header() {
	return (
		<header className="bg-[--color-surface] border-b border-[--color-border]">
			<nav
				className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between"
				aria-label="Navigasi utama"
			>
				<Link to="/" className="font-bold text-lg hover:text-[--color-accent]">
					Portfolio
				</Link>
				<div className="flex gap-6">
					<NavLink
						to="/"
						className={({ isActive }: NavLinkRenderProps) =>
							`hover:text-[--color-accent] transition-colors ${isActive ? "text-[--color-fg]" : "text-[--color-muted]"}`
						}
					>
						{({ isActive }: NavLinkRenderProps) => (
							<span aria-current={isActive ? "page" : undefined}>Beranda</span>
						)}
					</NavLink>
					<NavLink
						to="/projects"
						className={({ isActive }: NavLinkRenderProps) =>
							`hover:text-[--color-accent] transition-colors ${isActive ? "text-[--color-fg]" : "text-[--color-muted]"}`
						}
					>
						{({ isActive }: NavLinkRenderProps) => (
							<span aria-current={isActive ? "page" : undefined}>Proyek</span>
						)}
					</NavLink>
				</div>
			</nav>
		</header>
	);
}
