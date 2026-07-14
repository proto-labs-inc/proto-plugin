function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load screenshot image"));
    img.src = dataUrl;
  });
}

/** Crop and resize a viewport capture to match state-map preview (object-cover, top). */
export async function createStateScreenshotThumbnail(
  sourceDataUrl: string,
  targetWidth: number,
  targetHeight: number,
): Promise<string | null> {
  try {
    const img = await loadImage(sourceDataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const sourceAspect = img.width / img.height;
    const targetAspect = targetWidth / targetHeight;

    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (sourceAspect > targetAspect) {
      sw = img.height * targetAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetAspect;
      sy = 0;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
