import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, loginUser, logoutUser } from "@/services/auth.service";
import type { LoginInput } from "@/types/api";

const meKey = ["auth", "me"] as const;

export function useMe() {
	return useQuery({
		queryKey: meKey,
		queryFn: getCurrentUser,
		staleTime: 5 * 60 * 1000,
		retry: false,
	});
}

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: LoginInput) => loginUser(input.username, input.password),
		onSuccess: (user) => {
			// Seed the session cache directly: the inactive /me query would otherwise keep its
			// cached 401 and ProtectedRoute would bounce straight back to the login page.
			queryClient.setQueryData(meKey, user);
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logoutUser,
		onSuccess: () => {
			queryClient.setQueryData(meKey, null);
			queryClient.removeQueries({ queryKey: ["admin"] });
		},
	});
}
