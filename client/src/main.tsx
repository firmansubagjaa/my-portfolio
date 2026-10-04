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

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<HelmetProvider>
			<QueryClientProvider client={queryClient}>
				<Toaster />
				<RouterProvider router={router} />
			</QueryClientProvider>
		</HelmetProvider>
	</React.StrictMode>,
);
