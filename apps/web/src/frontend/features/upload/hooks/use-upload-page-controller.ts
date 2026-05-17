"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoading } from "@/frontend/features/common/hooks/use-loading";
import {
  type CameraSettings,
  defaultCameraSettings,
} from "@/frontend/features/upload/configs/cameraDatas";
import { useExifDetection } from "@/frontend/features/upload/hooks/use-exif-detection";
import { useFileUpload } from "@/frontend/features/upload/hooks/use-file-upload";
import { uploadFormData } from "@/frontend/services/upload.service";
import { useAuthStore } from "@/frontend/stores/useAuthStore";

interface UploadFormState {
  camera: string;
  category: string;
  color: string;
  description: string;
  exif: CameraSettings;
  style: string;
  tags: string[];
  title: string;
}

const createInitialFormState = (): UploadFormState => ({
  title: "",
  description: "",
  tags: [],
  category: "",
  style: "",
  color: "",
  camera: "",
  exif: defaultCameraSettings.Fujifilm,
});

export function useUploadPageController() {
  const fileUpload = useFileUpload();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { setLoading } = useLoading();
  const [error, setError] = useState("");
  const [form, setForm] = useState<UploadFormState>(createInitialFormState());
  const lastDetectedFileKeyRef = useRef<string | null>(null);

  const handleExifChange = useCallback(
    (
      field: string,
      value: number | object | string | CameraSettings["Brand"],
    ) => {
      if (field === "Brand") {
        const nextExif =
          defaultCameraSettings[value as CameraSettings["Brand"]];
        setForm((prev) => ({ ...prev, exif: nextExif }));
        return;
      }

      setForm((prev) => ({ ...prev, exif: { ...prev.exif, [field]: value } }));
    },
    [],
  );

  const exifDetection = useExifDetection(
    fileUpload.uploadedFile,
    handleExifChange,
  );
  const { detectAndApplyExif } = exifDetection;

  useEffect(() => {
    if (!fileUpload.uploadedFile) {
      lastDetectedFileKeyRef.current = null;
      return;
    }

    const nextFileKey = `${fileUpload.uploadedFile.name}-${fileUpload.uploadedFile.size}-${fileUpload.uploadedFile.lastModified}`;
    if (lastDetectedFileKeyRef.current === nextFileKey) {
      return;
    }

    lastDetectedFileKeyRef.current = nextFileKey;
    detectAndApplyExif().catch(() => undefined);
  }, [detectAndApplyExif, fileUpload.uploadedFile]);

  const handleChange = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleTagsChange = (value: string | string[]) => {
    if (typeof value === "string") {
      const normalizedTag = value.trim();
      if (!normalizedTag || form.tags.includes(normalizedTag)) {
        return;
      }
      setForm((prev) => ({ ...prev, tags: [...prev.tags, normalizedTag] }));
      return;
    }
    setForm((prev) => ({ ...prev, tags: [...value] }));
  };

  const handleCancel = () => {
    fileUpload.handleCancel();
    setForm(createInitialFormState());
    setError("");
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      setError("Title is required!");
      return false;
    }
    if (!form.description.trim()) {
      setError("Description is required!");
      return false;
    }
    if (form.tags.length === 0) {
      setError("At least one tag is required!");
      return false;
    }
    if (!fileUpload.photo) {
      setError("No photo selected!");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    setError("");
    if (!user?.id) {
      setError("You must be logged in to upload.");
      return;
    }
    if (!validateForm()) {
      return;
    }

    const detectedExif = await exifDetection.detectAndApplyExif();
    const exifForUpload = detectedExif ?? form.exif;
    const tagsWithBrand = [...form.tags, exifForUpload.Brand.toLowerCase()];
    const formData = new FormData();

    if (fileUpload.uploadedFile) {
      formData.append("file", fileUpload.uploadedFile);
    }
    formData.append("userId", user.id);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category.toLowerCase());
    formData.append("style", form.style.toLowerCase());
    formData.append("color", form.color.toLowerCase());
    formData.append("camera", form.camera.toLowerCase());
    formData.append("tags", JSON.stringify(tagsWithBrand));
    formData.append("exif", JSON.stringify(exifForUpload));

    setLoading(true);
    try {
      const uploadedPhoto = await uploadFormData(formData);
      router.push(`/photo/${uploadedPhoto.photoId}`);
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onUpload = () => {
    handleUpload().catch(() => undefined);
  };

  return {
    error,
    fileUpload,
    form,
    exifDetection,
    handleExifChange,
    handleChange,
    handleTagsChange,
    handleCancel,
    onUpload,
    onBack: () => router.back(),
  };
}
