const maxDimension = 1600;
const quality = 0.82;

export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Image compression failed.'));
        }
      },
      'image/webp',
      quality,
    );
  });

  return new File([blob], replaceExtension(file.name), {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

function replaceExtension(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return `${baseName || 'photo'}.webp`;
}
