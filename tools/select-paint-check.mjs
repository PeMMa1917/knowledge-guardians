import assert from 'node:assert/strict';

/** Measure the painted control interior, including the browser widget underneath CSS text. */
export async function checkSelectPaint(page, control) {
  await control.scrollIntoViewIfNeeded();
  const ink = await control.evaluate((el) => getComputedStyle(el).color);
  const raw = (await control.screenshot()).toString('base64');
  const result = await page.evaluate(
    async ({ ink, raw }) => {
      const im = new Image();
      im.src = 'data:image/png;base64,' + raw;
      await im.decode();
      const cv = document.createElement('canvas');
      cv.width = im.width;
      cv.height = im.height;
      const ctx = cv.getContext('2d');
      ctx.drawImage(im, 0, 0);
      const inset = Math.max(4, Math.round(cv.height * 0.18));
      const width = Math.max(1, Math.floor(cv.width * 0.8) - inset);
      const rgba = ctx.getImageData(inset, inset, width, Math.max(1, cv.height - 2 * inset)).data;
      const pixels = new Map();
      for (let i = 0; i < rgba.length; i += 4) {
        const key = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
        pixels.set(key, (pixels.get(key) || 0) + 1);
      }
      const split = (k) => [(k >>> 16) & 255, (k >>> 8) & 255, k & 255];
      const surface = split([...pixels.entries()].sort((a, b) => b[1] - a[1])[0][0]);
      const lum = (rgb) =>
        rgb
          .map((c) => {
            const v = c / 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          })
          .reduce((n, c, i) => n + c * [0.2126, 0.7152, 0.0722][i], 0);
      const label = ink
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
      const light = [lum(label), lum(surface)].sort((a, b) => b - a);
      return { surface, ink, label, contrast: (light[0] + 0.05) / (light[1] + 0.05) };
    },
    { ink, raw },
  );
  assert.ok(result.contrast >= 4.5, 'Selected text against its painted surface: ' + JSON.stringify(result));
  return result;
}
