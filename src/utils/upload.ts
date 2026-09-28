/**
 * Image upload and conversion helper
 * Supports ImgBB API hosting with automatic fallback to client-side compression
 */

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Resize and compress image on client-side before storing or uploading
 */
export async function processImageUpload(file: File, maxWidth = 1200): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
  });
}

/**
 * Upload image to ImgBB API using the provided API key
 * If API fails or network is offline, falls back seamlessly to processed base64
 */
export async function uploadToImgBB(file: File, apiKey: string): Promise<string> {
  const cleanKey = apiKey?.trim() || 'cbba7a8d9d2aae1860641bead99ef779';

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${cleanKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB returned status: ${response.status}`);
    }

    const json = await response.json();
    if (json && json.success && json.data) {
      return json.data.url || json.data.display_url;
    }
    throw new Error('ImgBB payload invalid');
  } catch (error) {
    console.warn('ImgBB API upload failed, using high-quality local fallback:', error);
    return await processImageUpload(file, 1200);
  }
}
