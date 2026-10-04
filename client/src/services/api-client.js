export class ApiClientError extends Error {
    status;
    category;
    errors;
    constructor(status, category, errors) {
        super();
        this.status = status;
        this.category = category;
        this.errors = errors;
        this.name = "ApiClientError";
    }
}
export async function apiFetch(url, options) {
    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });
    const data = (await response.json());
    if (!response.ok) {
        const error = data;
        throw new ApiClientError(response.status, error.category, error.errors);
    }
    const success = data;
    return success.data;
}
export function apiGet(url, options) {
    return apiFetch(url, { ...options, method: "GET" });
}
export function apiPost(url, data, options) {
    return apiFetch(url, {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
    });
}
export function apiPut(url, data, options) {
    return apiFetch(url, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
    });
}
export function apiDelete(url, options) {
    return apiFetch(url, { ...options, method: "DELETE" });
}
