import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/hooks/queries/use-auth";
import { zodResolver } from "@/lib/zod-resolver";
import { ApiClientError } from "@/services/api-client";
import type { LoginInput } from "@/types/api";
import { loginSchema } from "@/types/api";

function getLoginErrorMessage(error: unknown): string {
	if (error instanceof ApiClientError) {
		if (error.status === 401) return "Username atau password salah.";
		if (error.status === 429) return "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.";
		if (error.status === 400 || error.status === 422) {
			return error.message || "Data login tidak valid.";
		}
	}
	return "Tidak dapat terhubung ke server. Coba lagi nanti.";
}

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { mutate: login, isPending } = useLogin();
	const [loginError, setLoginError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
	});

	// ProtectedRoute passes the page the user tried to open
	const redirectTo = (location.state as { from?: string } | null)?.from ?? "/admin";

	const onSubmit = (data: LoginInput) => {
		setLoginError(null);
		login(data, {
			onSuccess: () => navigate(redirectTo, { replace: true }),
			onError: (error) => setLoginError(getLoginErrorMessage(error)),
		});
	};

	return (
		<main id="main" className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
			<div className="w-full max-w-md">
				<p className="mb-3 text-center font-mono text-sm text-accent">Portfolio Admin</p>
				<Card padding="lg">
					<h1 className="text-2xl font-bold text-fg">Login Admin</h1>
					<p className="mt-1 text-sm text-muted">Masuk untuk mengelola proyek.</p>

					{loginError && (
						<div
							role="alert"
							className="mt-6 rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-200"
						>
							{loginError}
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
						<Input
							id="username"
							label="Username"
							type="text"
							autoComplete="username"
							autoFocus
							placeholder="username"
							required
							{...register("username")}
							error={errors.username}
						/>

						<Input
							id="password"
							label="Password"
							type="password"
							autoComplete="current-password"
							placeholder="••••••••"
							required
							{...register("password")}
							error={errors.password}
						/>

						<Button type="submit" variant="primary" className="w-full" isLoading={isPending}>
							{isPending ? "Memproses…" : "Login"}
						</Button>
					</form>
				</Card>
				<p className="mt-6 text-center text-sm">
					<Link to="/" className="text-muted transition-colors hover:text-fg">
						← Kembali ke situs
					</Link>
				</p>
			</div>
		</main>
	);
}
