import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { queryClient } from "@/config/query-client";
import { router } from "@/router";
import "@/styles/globals.css";
const root = document.getElementById("root");
if (!root) {
    throw new Error("Root element not found");
}
ReactDOM.createRoot(root).render(_jsx(React.StrictMode, { children: _jsx(HelmetProvider, { children: _jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(Toaster, {}), _jsx(RouterProvider, { router: router })] }) }) }));
