"use client";

import type { MockUploadImage } from "../_components/mock-image-dropzone";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error(`Failed to read ${file.name}`));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error(`Failed to read ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}

export async function buildImagePayload(images: MockUploadImage[]) {
  return Promise.all(
    images.map(async (image, index) => ({
      imageUrl: await readFileAsDataUrl(image.file),
      altText: image.name,
      isPrimary: index === 0,
      sortOrder: index,
    })),
  );
}
