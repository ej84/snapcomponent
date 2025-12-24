"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/firebase/storage";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) {
        toast.error("Please sign in to upload images");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Maximum file size is 5MB",
        });
        return;
      }

      setIsUploading(true);

      try {
        // Upload to Firebase Storage
        const result = await uploadImage(file, user.uid);

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.url) {
          throw new Error("Failed to get download URL");
        }

        // Set preview
        setPreviewUrl(result.url);

        // Notify parent
        onImageUploaded(result.url);

        toast.success("Image uploaded successfully! 🎉");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error("Upload failed", {
          description: error.message || "Failed to upload image",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [user, onImageUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  // Remove image
  function handleRemove() {
    setPreviewUrl(null);
    onImageUploaded("");
  }

  return (
    <div>
      {!previewUrl ? (
        <div
          {...getRootProps()}
          className={`
            flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed
            transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }
            ${
              isUploading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-primary hover:bg-primary/5"
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              {isUploading ? (
                <Upload className="h-8 w-8 animate-pulse text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-primary" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium">
                {isUploading
                  ? "Uploading..."
                  : isDragActive
                  ? "Drop your screenshot here"
                  : "Drag & drop your screenshot here"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to select a file
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                PNG, JPG, or WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg border bg-card p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 cursor-pointer"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="relative h-32 w-32 overflow-hidden rounded-md border">
              <Image
                src={previewUrl}
                alt="Uploaded screenshot"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <p className="font-medium">Screenshot uploaded successfully</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ready to convert to code
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
