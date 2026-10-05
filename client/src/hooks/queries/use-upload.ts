// File: /client/src/hooks/queries/use-upload.ts
import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "@/services/upload.service";

export function useUploadImage() {
	return useMutation({
		mutationFn: uploadImage,
		onError: (error) => {
			console.error("Image upload failed:", error);
		},
	});
}
