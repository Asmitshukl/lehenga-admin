"use client";

import { ChangeEvent, DragEvent, useEffect, useId, useMemo, useState } from "react";

export type MockUploadImage = {
  id: string;
  name: string;
  sizeLabel: string;
  previewUrl: string;
  file: File;
};

function getImageId(file: File, index: number) {
  return `${file.name}-${file.lastModified}-${file.size}-${index}`;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

type MockImageDropzoneProps = {
  label: string;
  hint?: string;
  value: MockUploadImage[];
  onChange: (images: MockUploadImage[]) => void;
};

export function MockImageDropzone({ label, hint, value, onChange }: MockImageDropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const summary = useMemo(() => {
    if (value.length === 0) {
      return "No image selected";
    }

    return `${value.length} image${value.length > 1 ? "s" : ""} selected`;
  }, [value]);

  useEffect(() => {
    return () => {
      value.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [value]);

  function createImages(files: FileList) {
    const incomingImages = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file, index) => ({
        id: getImageId(file, index),
        name: file.name,
        sizeLabel: formatFileSize(file.size),
        previewUrl: URL.createObjectURL(file),
        file,
      }));
    const existingIds = new Set(value.map((image) => image.id));
    const dedupedImages = incomingImages.filter((image) => !existingIds.has(image.id));

    onChange([...value, ...dedupedImages]);
  }

  function handleRemove(id: string) {
    const imageToRemove = value.find((image) => image.id === id);

    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    onChange(value.filter((image) => image.id !== id));
  }

  function handleClear() {
    value.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    onChange([]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) {
      return;
    }

    createImages(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (!event.dataTransfer.files.length) {
      return;
    }

    createImages(event.dataTransfer.files);
  }

  return (
    <div className="admin-field admin-field-full">
      <span>{label}</span>
      <label
        htmlFor={inputId}
        className={`admin-upload-dropzone${isDragging ? " is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input id={inputId} type="file" accept="image/*" multiple onChange={handleInputChange} />
        <div className="admin-upload-dropzone-inner">
          <div className="admin-upload-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                d="M7 18.5A4.5 4.5 0 0 1 7 9.5a5.5 5.5 0 0 1 10.74 1.65A3.75 3.75 0 1 1 18 18.5h-3.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
              <path
                d="M12 20V10m0 0-3 3m3-3 3 3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </div>
          <strong>Click or drag images here</strong>
          <p>PNG, JPG, JPEG, WebP</p>
          <span>{hint ?? "Selected images will upload when you save this item."}</span>
        </div>
      </label>

      <div className="admin-upload-meta">
        <strong>{summary}</strong>
        <span>Selected images appear below first, then they are uploaded when you save.</span>
        {value.length > 0 ? (
          <button type="button" className="admin-ghost-button" onClick={handleClear}>
            Clear all
          </button>
        ) : null}
      </div>

      {value.length > 0 ? (
        <div className="admin-upload-preview-grid">
          {value.map((image, index) => (
            <article key={image.id} className="admin-upload-preview-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.previewUrl} alt={image.name} />
              <div>
                <strong>{index === 0 ? "Primary preview" : `Preview ${index + 1}`}</strong>
                <p>{image.name}</p>
                <span>{image.sizeLabel}</span>
              </div>
              <button type="button" className="admin-danger-button" onClick={() => handleRemove(image.id)}>
                Remove
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
