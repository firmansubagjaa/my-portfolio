import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, loginUser, logoutUser } from "@/services/auth.service";
export function useMe() {
    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: getCurrentUser,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}
export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input) => loginUser(input.username, input.password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });
}
export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.setQueryData(["auth", "me"], null);
        },
    });
}
