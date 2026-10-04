import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router";
import { Spinner } from "@/components/ui/Spinner";
import { useMe } from "@/hooks/queries/use-auth";
export function ProtectedRoute({ children }) {
    const { data, isLoading, error } = useMe();
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx(Spinner, {}) }));
    }
    if (error || !data) {
        return _jsx(Navigate, { to: "/admin/login", replace: true });
    }
    return children;
}
