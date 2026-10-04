import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLogin } from "@/hooks/queries/use-auth";
import { loginSchema } from "@/types/api";
export default function LoginPage() {
    const navigate = useNavigate();
    const { mutate: login, isPending } = useLogin();
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = (data) => {
        login(data, {
            onSuccess: () => navigate("/admin"),
            onError: (error) => {
                console.error("Login failed:", error);
            },
        });
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center px-4 bg-[--color-bg]", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsx("h1", { className: "text-2xl font-bold text-[--color-fg] mb-6", children: "Login Admin" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-[--color-fg] mb-1", children: "Username" }), _jsx("input", { ...register("username"), type: "text", className: "w-full px-4 py-2 bg-[--color-bg] border border-[--color-border] rounded text-[--color-fg] focus:outline-none focus:border-[--color-accent]", placeholder: "username" }), errors.username && (_jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.username.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-[--color-fg] mb-1", children: "Password" }), _jsx("input", { ...register("password"), type: "password", className: "w-full px-4 py-2 bg-[--color-bg] border border-[--color-border] rounded text-[--color-fg] focus:outline-none focus:border-[--color-accent]", placeholder: "password" }), errors.password && (_jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.password.message }))] }), _jsx(Button, { type: "submit", variant: "primary", className: "w-full", isLoading: isPending, children: "Login" })] })] }) }));
}
