import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLogin } from "@/hooks/queries/use-auth";
import type { LoginInput } from "@/types/api";
import { loginSchema } from "@/types/api";

export default function LoginPage() {
	const navigate = useNavigate();
	const { mutate: login, isPending } = useLogin();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = (data: LoginInput) => {
		login(data, {
			onSuccess: () => navigate("/admin"),
			onError: (error) => {
				console.error("Login failed:", error);
			},
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 bg-bg">
			<Card className="w-full max-w-md">
				<h1 className="text-2xl font-bold text-fg mb-6">Login Admin</h1>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<label htmlFor="username" className="block text-sm font-medium text-fg mb-1">
							Username
						</label>
						<input
							{...register("username")}
							type="text"
							className="w-full px-4 py-2 bg-bg border border-border rounded text-fg focus:outline-none focus:border-accent"
							placeholder="username"
						/>
						{errors.username && (
							<p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
						)}
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-fg mb-1">
							Password
						</label>
						<input
							{...register("password")}
							type="password"
							className="w-full px-4 py-2 bg-bg border border-border rounded text-fg focus:outline-none focus:border-accent"
							placeholder="password"
						/>
						{errors.password && (
							<p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
						)}
					</div>

					<Button type="submit" variant="primary" className="w-full" isLoading={isPending}>
						Login
					</Button>
				</form>
			</Card>
		</div>
	);
}
