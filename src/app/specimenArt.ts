const PIXELS = 48;
const loaded = new Map<string, Promise<HTMLCanvasElement | null>>();

/** Draw a licensed collection view at the same pixel scale as in-game artwork. */
export function specimenArt(asset: string): Promise<HTMLCanvasElement | null> {
  const previous = loaded.get(asset);
  if (previous) return previous;
  const drawing = new Promise<HTMLCanvasElement | null>((resolve) => {
    const image = new Image();
    image.onerror = () => resolve(null);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = PIXELS;
      canvas.height = PIXELS;
      const g = canvas.getContext('2d');
      if (!g) { resolve(null); return; }
      const scale = Math.min(PIXELS / image.naturalWidth, PIXELS / image.naturalHeight);
      const wide = Math.max(1, Math.round(image.naturalWidth * scale));
      const tall = Math.max(1, Math.round(image.naturalHeight * scale));
      g.drawImage(image, Math.floor((PIXELS - wide) / 2), Math.floor((PIXELS - tall) / 2), wide, tall);
      resolve(canvas);
    };
    image.src = `${import.meta.env.BASE_URL}assets/${asset}`;
  });
  loaded.set(asset, drawing);
  return drawing;
}
