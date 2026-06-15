/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Recibe un DataURL en base64 de una imagen, la carga en un canvas virtual,
 * la redimensiona si excede cierto tamaño para optimizar costos de ancho de banda y almacenamiento de Firestore,
 * y la devuelve comprimida en formato JPEG.
 */
export function compressImage(dataUrl: string, maxWidth = 800, maxHeight = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calcular nuevas proporciones respetando límites
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      // Renderizar en canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl); // Fallback
        return;
      }

      ctx.fillStyle = "#FFFFFF"; // Fondo blanco para evitar transparencias rotas en JPEG
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}
