// Produce a thumbnail image from an original (assumed to be larger) image,
// based off of the given width and height in pixels.
export const createThumbnail = (
  base64Image: string,
  width: number,
  height: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const thumbNailBase64 = canvas.toDataURL("image/png");
        resolve(thumbNailBase64);
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };

    img.onerror = (error) => {
      reject(new Error("Failed to load image"));
    };
  });
};
