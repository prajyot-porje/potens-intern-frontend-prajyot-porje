/**
 * Compresses an image file using HTML5 Canvas.
 * Resizes the image to a maximum width of 800px and converts it to a JPEG format at 0.7 quality.
 * Returns a Promise that resolves to the compressed Base64 data URL.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale down if width exceeds 800px
          const MAX_WIDTH = 800;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get 2D canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Get high-compression JPEG data URL
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        reject(new Error("Failed to load image element"));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

export default compressImage;
