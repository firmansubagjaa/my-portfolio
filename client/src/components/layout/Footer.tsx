export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-[--color-surface] border-t border-[--color-border] mt-16 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<address className="text-center text-[--color-muted] not-italic">
					<p>&copy; {currentYear} Portfolio. All rights reserved.</p>
					<div className="mt-4 space-x-4">
						<a
							href="https://github.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-[--color-accent]"
						>
							GitHub
						</a>
						<a href="mailto:contact@example.com" className="hover:text-[--color-accent]">
							Email
						</a>
					</div>
				</address>
			</div>
		</footer>
	);
}
