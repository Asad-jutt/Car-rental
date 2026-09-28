/**
 * Off-main-thread sampler for the hero particle field.
 *
 * Decoding the source image, scaling it to `MAX_SCAN_DIMENSION`, pulling the
 * RGBA buffer back off the GPU and walking that buffer twice (once to count
 * visible pixels, once to keep every `step`-th one) used to run inline during
 * first paint. On a 1600px source that is a ~6MB buffer and several million
 * iterations — a few hundred milliseconds of hard main-thread block, landing
 * exactly when the page is trying to reach first paint.
 *
 * Here it all happens in a worker, and only the small `Float32Array` payloads
 * the renderer actually needs come back — transferred, not copied.
 */

export interface ParticleSampleRequest {
  bitmap: ImageBitmap;
  maxDimension: number;
  targetCount: number;
  threshold: number;
}

export interface ParticleSampleResponse {
  baseCoords: Float32Array;
  brightness: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
  width: number;
  height: number;
  count: number;
}

export interface ParticleSampleFailure {
  error: string;
}

// `self` is typed as `Window` under the DOM lib this project compiles with, so
// the worker global is described structurally instead of pulling in the whole
// `webworker` lib (which collides with DOM's own global declarations).
const ctx = self as unknown as {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

function luminanceAt(data: Uint8ClampedArray, i: number): number {
  return data[i] * 0.21 + data[i + 1] * 0.71 + data[i + 2] * 0.07;
}

function isVisible(
  data: Uint8ClampedArray,
  i: number,
  threshold: number,
  hasAlpha: boolean,
): boolean {
  return hasAlpha ? data[i + 3] > threshold : luminanceAt(data, i) > threshold;
}

function brightnessAt(
  data: Uint8ClampedArray,
  i: number,
  hasAlpha: boolean,
): number {
  if (hasAlpha) return Math.max(data[i + 3] / 255, 0.5);
  const luminance = luminanceAt(data, i);
  return Math.min(Math.max(Math.sqrt(luminance / 255), 0.45), 1);
}

function sample(
  bitmap: ImageBitmap,
  maxDimension: number,
  targetCount: number,
  threshold: number,
): ParticleSampleResponse {
  const naturalWidth = bitmap.width;
  const naturalHeight = bitmap.height;
  const scale = Math.min(
    1,
    maxDimension / Math.max(naturalWidth, naturalHeight),
  );
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const scan = new OffscreenCanvas(width, height);
  const context = scan.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas context is unavailable.");

  context.clearRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const data = context.getImageData(0, 0, width, height).data;

  // Pass 1: detect transparency and count visible pixels in one sweep.
  let hasAlpha = false;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 250) hasAlpha = true;
    if (isVisible(data, i, threshold, hasAlpha)) total += 1;
  }

  if (total < 8) {
    throw new Error("No visible pixels were found in the particle source image.");
  }

  // Pass 2: walk the visible pixels in raster order and keep every `step`-th
  // one. Reading in source order (rather than indexing backwards afterwards)
  // keeps the trail in lockstep with the counting pass above.
  const step = total > targetCount ? total / targetCount : 1;
  const actual = total > targetCount ? targetCount : total;

  const pickedX = new Float32Array(actual);
  const pickedY = new Float32Array(actual);
  const pickedBrightness = new Float32Array(actual);

  let j = 0;
  let v = 0;
  let nextSource = 0;
  for (let y = 0; y < height && j < actual; y += 1) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width && j < actual; x += 1) {
      const i = rowOffset + x * 4;
      if (!isVisible(data, i, threshold, hasAlpha)) continue;
      if (v === nextSource) {
        pickedX[j] = x;
        pickedY[j] = y;
        pickedBrightness[j] = brightnessAt(data, i, hasAlpha);
        j += 1;
        nextSource =
          j < actual ? Math.min(Math.floor(j * step), total - 1) : -1;
      }
      v += 1;
    }
  }

  // Normalised to [-0.5, 0.5] on the longer edge; `applyFit` scales these into
  // world space once the viewport is known.
  const norm = 1 / Math.max(width, height);
  const baseCoords = new Float32Array(actual * 2);
  for (let k = 0; k < actual; k += 1) {
    baseCoords[k * 2] = (pickedX[k] - width / 2) * norm;
    baseCoords[k * 2 + 1] = -(pickedY[k] - height / 2) * norm;
  }

  const sizes = new Float32Array(actual);
  const seeds = new Float32Array(actual);
  for (let k = 0; k < actual; k += 1) {
    sizes[k] = 0.85 + Math.random() * 0.3;
    seeds[k] = Math.random();
  }

  return {
    baseCoords,
    brightness: pickedBrightness,
    sizes,
    seeds,
    width,
    height,
    count: actual,
  };
}

self.onmessage = (event: MessageEvent<ParticleSampleRequest>) => {
  const { bitmap, maxDimension, targetCount, threshold } = event.data;
  try {
    const result = sample(bitmap, maxDimension, targetCount, threshold);
    ctx.postMessage(result, [
      result.baseCoords.buffer,
      result.brightness.buffer,
      result.sizes.buffer,
      result.seeds.buffer,
    ]);
  } catch (error) {
    ctx.postMessage({
      error: error instanceof Error ? error.message : String(error),
    } satisfies ParticleSampleFailure);
  }
};
