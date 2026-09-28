/**
 * Hero particle field, rendered with raw WebGL.
 *
 * This used to run on three.js. The scene is a single `Points` object with two
 * custom shaders, one perspective camera and no lights, materials or loaders —
 * none of which three was doing any work for. Shipping the library for it cost
 * 522KB of parsed JavaScript (130KB gzipped) plus an abstraction layer over
 * every per-frame call, so the renderer below talks to the context directly and
 * keeps the maths identical: same projection, same view transform, same
 * blending, same shaders, same integration.
 *
 * `updatePointerWorld` also replaces the three.js raycast the interaction used
 * to go through. That raycast set the camera-space direction to NDC z = 0.5,
 * which unprojects to a point on the camera plane; the resulting direction had a
 * zero z component, so intersecting it with the z = 0 interaction plane always
 * returned null and the hover-to-disperse force never actually applied. The
 * closed-form plane intersection below is the same ray, computed correctly.
 */

const MAX_SCAN_DIMENSION = 1600;
const CAMERA_FOV = 45;
const CAMERA_NEAR = 1;
const CAMERA_FAR = 1000;
const CAMERA_Z = 140;
const DEFAULT_COLOR = "#e8e8e8";

/** Never thin the field below this share of the requested count, otherwise the
 *  silhouette stops reading as a car. */
const MIN_QUALITY = 0.25;

/** Squared speed below which a particle counts as settled. */
const REST_SPEED_SQ = 0.0004;

/** Frames to keep integrating after the last movement, so the tail of the
 *  settle is damped out rather than frozen mid-flight. */
const REST_FRAMES = 12;

const VERTEX_SHADER = `
// Stated explicitly rather than leaning on the ESSL 1.00 default. The vertex
// stage does world-space maths out to ~170 units, so this one genuinely needs
// the highp range rather than just permitting it.
precision highp float;

uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uIdle;
uniform float uEnergy;

// three.js used to prepend the matrix uniforms and the position attribute for
// every material it built. Now that the renderer talks to the context directly
// they have to be declared here, or the shader fails to compile on an
// undeclared identifier and the whole effect throws out to the static-image
// fallback. The position attribute in particular is the one the renderer binds
// a dynamic buffer to, so omitting it leaves the particles no source
// coordinates at all.
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 aHome;
attribute float aSize;
attribute float aSeed;
attribute float aBrightness;

varying float vEnergy;
varying float vSeed;
varying float vBrightness;

void main() {
  vec3 pos = position;

  float phase = aSeed * 6.28318530718;
  pos.x += (sin(uTime * 0.9 + phase) * 0.5) * uIdle;
  pos.y += (cos(uTime * 0.7 + phase * 1.7) * 0.5) * uIdle;
  pos.z += (sin(uTime * 1.3 + phase) * 0.5) * uIdle;

  float displacement = length(pos - aHome);
  vEnergy = clamp(displacement / max(uEnergy, 0.0001), 0.0, 1.0);
  vSeed = aSeed;
  vBrightness = aBrightness;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float sizeScale = 0.8 + 0.2 * aBrightness;
  gl_PointSize = uSize * aSize * uPixelRatio * sizeScale * (1.0 + vEnergy * 0.35);
}
`;

const FRAGMENT_SHADER = `
// ESSL 1.00 gives a fragment shader no default float precision, so unlike the
// vertex stage it has to be stated outright or every float below is a compile
// error. three.js prepended this line for free; raw WebGL does not.
precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;

varying float vEnergy;
varying float vSeed;
varying float vBrightness;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float dist2 = dot(coord, coord);
  if (dist2 > 0.25) discard;

  float alpha = smoothstep(0.25, 0.06, dist2);
  float tone = 0.6 + 0.4 * vBrightness;
  vec3 color = uColor * tone * (0.92 + 0.08 * vSeed + vEnergy * 0.1);

  gl_FragColor = vec4(color, alpha * uOpacity * (0.9 + 0.1 * vBrightness));
}
`;

export interface CarParticlesReadyInfo {
  count: number;
  width: number;
  height: number;
}

export interface CarParticlesOptions {
  canvas: HTMLCanvasElement;
  src: string;
  color?: string;
  particleSize?: number;
  targetCount?: number;
  threshold?: number;
  radius?: number;
  strength?: number;
  spring?: number;
  damping?: number;
  depth?: number;
  idle?: number;
  opacity?: number;
  padding?: number;
  maxDpr?: number;
  onReady?: (info: CarParticlesReadyInfo) => void;
  onError?: (error: unknown) => void;
}

export interface CarParticlesHandle {
  setPointer(ndcX: number, ndcY: number): void;
  clearPointer(): void;
  resize(width: number, height: number): void;
  update(delta: number): void;
  render(): void;
  /**
   * Drops a chunk of the particle draw range so a device that cannot hold frame
   * rate stays interactive. Returns the number of particles now being drawn.
   */
  degrade(): number;
  dispose(): void;
}

interface ParticleSample {
  baseCoords: Float32Array;
  brightness: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
  width: number;
  height: number;
  count: number;
}

function parseHexColor(input: string): [number, number, number] {
  const hex = input.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value) || full.length !== 6) {
    return [0.91, 0.91, 0.91];
  }
  return [
    ((value >> 16) & 0xff) / 255,
    ((value >> 8) & 0xff) / 255,
    (value & 0xff) / 255,
  ];
}

/** Perspective frustum for a symmetric camera, as a column-major mat4. */
function perspectiveMatrix(fov: number, aspect: number, near: number, far: number) {
  const top = near * Math.tan((fov * Math.PI) / 360);
  const height = 2 * top;
  const width = aspect * height;
  const left = -0.5 * width;
  const right = 0.5 * width;
  const bottom = -top;

  return new Float32Array([
    (2 * near) / (right - left), 0, 0, 0,
    0, (2 * near) / (top - bottom), 0, 0,
    0, 0, -(far + near) / (far - near), -1,
    0, 0, (-2 * far * near) / (far - near), 0,
  ]);
}

/** View matrix for an unrotated camera at (0, 0, CAMERA_Z) looking down -Z. */
const VIEW_MATRIX = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, -CAMERA_Z, 1,
]);

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate a WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown error";
    gl.deleteShader(shader);
    throw new Error(`Particle shader failed to compile: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to allocate a WebGL program.");

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  // Shaders are attached to the program, which owns them from here on.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "unknown error";
    gl.deleteProgram(program);
    throw new Error(`Particle program failed to link: ${log}`);
  }
  return program;
}

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

function canUseWorker(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof createImageBitmap !== "undefined" &&
    typeof fetch === "function"
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Unable to load particle source "${src}".`));
    image.src = src;
  });
}

export function createCarParticles(
  options: CarParticlesOptions,
): CarParticlesHandle {
  const {
    canvas,
    src,
    color = DEFAULT_COLOR,
    particleSize = 1.5,
    targetCount = 40000,
    threshold = 22,
    radius = 0.2,
    strength = 300,
    spring = 3.6,
    damping = 0.94,
    depth = 0.25,
    idle = 0.12,
    opacity = 0.95,
    padding = 0.82,
    maxDpr = 1.5,
    onReady,
    onError,
  } = options;

  const pixelRatio = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    maxDpr,
  );

  const contextAttributes: WebGLContextAttributes = {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  };

  let gl =
    (canvas.getContext("webgl", contextAttributes) as
      | WebGLRenderingContext
      | null) ??
    (canvas.getContext("experimental-webgl", contextAttributes) as
      | WebGLRenderingContext
      | null);

  if (!gl) {
    // Reported through onError like every other failure path, so the caller can
    // fall back to a plain image instead of throwing out of the effect.
    queueMicrotask(() =>
      onError?.(new Error("WebGL is unavailable in this browser.")),
    );
    const noop = () => 0;
    return {
      setPointer: noop,
      clearPointer: noop,
      resize: noop,
      update: noop,
      render: noop,
      degrade: noop,
      dispose: noop,
    };
  }

  const ctx: WebGLRenderingContext = gl;

  const projection = perspectiveMatrix(
    CAMERA_FOV,
    1,
    CAMERA_NEAR,
    CAMERA_FAR,
  );
  let program: WebGLProgram | null = null;
  let projectionLoc: WebGLUniformLocation | null = null;

  let positionBuffer: WebGLBuffer | null = null;
  let homeBuffer: WebGLBuffer | null = null;
  let sizeBuffer: WebGLBuffer | null = null;
  let seedBuffer: WebGLBuffer | null = null;
  let brightnessBuffer: WebGLBuffer | null = null;

  let uTime: WebGLUniformLocation | null = null;
  let uSize: WebGLUniformLocation | null = null;
  let uEnergy: WebGLUniformLocation | null = null;

  let baseCoords: Float32Array | null = null;
  let homePositions: Float32Array | null = null;
  let positions: Float32Array | null = null;
  let velocities: Float32Array | null = null;
  let sizes: Float32Array = new Float32Array(0);
  let seeds: Float32Array = new Float32Array(0);
  let brightness: Float32Array = new Float32Array(0);

  let count = 0;
  let drawnCount = 0;
  let imageWidth = 1;
  let imageHeight = 1;
  let aspect = 1;
  let worldWidth = 1;
  let worldHeight = 1;
  let fit = 0;
  let radiusWorld = 1;
  let initialized = false;
  let ready = false;
  let disposed = false;
  let pointerActive = false;
  let restFrames = 0;
  let time = 0;

  let pointerNdcX = 0;
  let pointerNdcY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let hasMouse = false;

  function handleContextLost(event: Event) {
    event.preventDefault();
    ready = false;
  }

  /** A lost context drops every handle, so the renderer is rebuilt from the
   *  arrays we still hold rather than left pointing at dead objects. */
  function handleContextRestored() {
    if (disposed || count === 0) return;
    releaseGL();
    buildGL();
    ready = true;
    applyFit();
    render();
  }

  canvas.addEventListener("webglcontextlost", handleContextLost, false);
  canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

  function releaseGL() {
    if (!ctx) return;
    if (positionBuffer) ctx.deleteBuffer(positionBuffer);
    if (homeBuffer) ctx.deleteBuffer(homeBuffer);
    if (sizeBuffer) ctx.deleteBuffer(sizeBuffer);
    if (seedBuffer) ctx.deleteBuffer(seedBuffer);
    if (brightnessBuffer) ctx.deleteBuffer(brightnessBuffer);
    if (program) ctx.deleteProgram(program);
    program = null;
    projectionLoc = null;
    positionBuffer = null;
    homeBuffer = null;
    sizeBuffer = null;
    seedBuffer = null;
    brightnessBuffer = null;
  }

  function buildGL() {
    program = createProgram(ctx);
    ctx.useProgram(program);

    const [r, g, b] = parseHexColor(color);
    uTime = ctx.getUniformLocation(program, "uTime");
    uSize = ctx.getUniformLocation(program, "uSize");
    uEnergy = ctx.getUniformLocation(program, "uEnergy");
    projectionLoc = ctx.getUniformLocation(program, "projectionMatrix");

    ctx.uniform1f(uSize, particleSize);
    ctx.uniform1f(uTime, 0);
    // gl_PointSize is scaled by this. Left unset it defaults to 0, which makes
    // every sprite zero-sized and draws nothing.
    ctx.uniform1f(ctx.getUniformLocation(program, "uPixelRatio"), pixelRatio);
    ctx.uniform1f(ctx.getUniformLocation(program, "uIdle"), idle);
    ctx.uniform1f(uEnergy, 0.0001);
    ctx.uniform3f(ctx.getUniformLocation(program, "uColor"), r, g, b);
    ctx.uniform1f(ctx.getUniformLocation(program, "uOpacity"), opacity);

    ctx.uniformMatrix4fv(projectionLoc, false, projection);
    ctx.uniformMatrix4fv(
      ctx.getUniformLocation(program, "modelViewMatrix"),
      false,
      VIEW_MATRIX,
    );

    positionBuffer = ctx.createBuffer();
    homeBuffer = ctx.createBuffer();
    sizeBuffer = ctx.createBuffer();
    seedBuffer = ctx.createBuffer();
    brightnessBuffer = ctx.createBuffer();

    // Each sprite is masked in the fragment shader, so the pass needs no depth
    // or stencil work at all - and no MSAA.
    ctx.disable(ctx.DEPTH_TEST);
    ctx.disable(ctx.CULL_FACE);
    ctx.depthMask(false);
    ctx.enable(ctx.BLEND);
    ctx.blendEquationSeparate(ctx.FUNC_ADD, ctx.FUNC_ADD);
    ctx.blendFuncSeparate(
      ctx.SRC_ALPHA,
      ctx.ONE_MINUS_SRC_ALPHA,
      ctx.ONE,
      ctx.ONE_MINUS_SRC_ALPHA,
    );
    ctx.clearColor(0, 0, 0, 0);
  }

  function bindAttribute(
    name: string,
    size: number,
    target: WebGLBuffer | null,
    data: Float32Array | null,
  ) {
    if (!program || !target || data === null) return;
    const location = ctx.getAttribLocation(program, name);
    if (location < 0) return;
    ctx.bindBuffer(ctx.ARRAY_BUFFER, target);
    ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW);
    ctx.enableVertexAttribArray(location);
    ctx.vertexAttribPointer(
      location,
      size,
      ctx.FLOAT,
      false,
      0,
      0,
    );
  }

  function uploadAttributes() {
    if (!positions || !homePositions) return;
    if (positionBuffer) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, positions, ctx.DYNAMIC_DRAW);
    }
    if (homeBuffer) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, homeBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, homePositions, ctx.DYNAMIC_DRAW);
    }

    const stride = 3 * 4;
    const aPosition = program ? ctx.getAttribLocation(program, "position") : -1;
    const aHome = program ? ctx.getAttribLocation(program, "aHome") : -1;
    if (aPosition >= 0 && positionBuffer) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
      ctx.enableVertexAttribArray(aPosition);
      ctx.vertexAttribPointer(aPosition, 3, ctx.FLOAT, false, stride, 0);
    }
    if (aHome >= 0 && homeBuffer) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, homeBuffer);
      ctx.enableVertexAttribArray(aHome);
      ctx.vertexAttribPointer(aHome, 3, ctx.FLOAT, false, stride, 0);
    }

    bindAttribute("aSize", 1, sizeBuffer, sizes);
    bindAttribute("aSeed", 1, seedBuffer, seeds);
    bindAttribute("aBrightness", 1, brightnessBuffer, brightness);
  }

  function applyFit() {
    if (!ready || !baseCoords || !positions || !velocities || !homePositions) {
      return;
    }

    const normW = imageWidth >= imageHeight ? 1 : imageWidth / imageHeight;
    const normH = imageHeight >= imageWidth ? 1 : imageHeight / imageWidth;
    const nextFit = Math.min(
      (worldWidth * padding) / normW,
      (worldHeight * padding) / normH,
    );
    const factor = fit > 0 ? nextFit / fit : 1;
    fit = nextFit;
    radiusWorld = radius * Math.min(worldWidth, worldHeight);

    for (let i = 0; i < count; i += 1) {
      const i2 = i * 2;
      const i3 = i * 3;

      homePositions[i3] = baseCoords[i2] * fit;
      homePositions[i3 + 1] = baseCoords[i2 + 1] * fit;
      homePositions[i3 + 2] = 0;

      if (initialized) {
        positions[i3] *= factor;
        positions[i3 + 1] *= factor;
        positions[i3 + 2] *= factor;
        velocities[i3] *= factor;
        velocities[i3 + 1] *= factor;
        velocities[i3 + 2] *= factor;
      }
    }

    if (!initialized) {
      positions.set(homePositions);
      initialized = true;
    }

    if (homeBuffer) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, homeBuffer);
      ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, homePositions);
    }
    if (positionBuffer) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
      ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, positions);
    }

    if (uEnergy) ctx.uniform1f(uEnergy, Math.max(fit * 0.15, 0.0001));
  }

  /**
   * Where a normalised device pointer lands on the z = 0 interaction plane.
   *
   * The camera sits at z = CAMERA_Z looking down -Z, so the ray through
   * (ndcX, ndcY) has world direction
   * (ndcX * worldWidth / 2, ndcY * worldHeight / 2, -CAMERA_Z) and reaches the
   * plane at t = 1 once divided through by its own z component.
   */
  function updatePointerWorld() {
    if (!pointerActive) {
      hasMouse = false;
      return;
    }
    mouseX = pointerNdcX * worldWidth * 0.5;
    mouseY = pointerNdcY * worldHeight * 0.5;
    hasMouse = true;
  }

  function allocate(sample: ParticleSample) {
    if (disposed) return;

    imageWidth = sample.width;
    imageHeight = sample.height;
    count = sample.count;
    baseCoords = sample.baseCoords;
    brightness = sample.brightness;
    sizes = sample.sizes;
    seeds = sample.seeds;

    homePositions = new Float32Array(count * 3);
    positions = new Float32Array(count * 3);
    velocities = new Float32Array(count * 3);

    if (!program) buildGL();
    uploadAttributes();

    drawnCount = count;
    restFrames = 0;
    ready = true;
    applyFit();
    render();

    onReady?.({ count, width: imageWidth, height: imageHeight });
  }

  /** Same two-pass walk as the worker, for browsers without one. */
  function sampleOnMainThread(image: HTMLImageElement): ParticleSample {
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    const scale = Math.min(
      1,
      MAX_SCAN_DIMENSION / Math.max(naturalWidth, naturalHeight),
    );
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    const scan = document.createElement("canvas");
    scan.width = width;
    scan.height = height;
    const context = scan.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("2D canvas context is unavailable.");
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const data = context.getImageData(0, 0, width, height).data;

    let hasAlpha = false;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 250) hasAlpha = true;
      if (isVisible(data, i, threshold, hasAlpha)) total += 1;
    }
    if (total < 8) {
      throw new Error(
        "No visible pixels were found in the particle source image.",
      );
    }

    const step = total > targetCount ? total / targetCount : 1;
    const actual = total > targetCount ? targetCount : total;

    const out: ParticleSample = {
      baseCoords: new Float32Array(actual * 2),
      brightness: new Float32Array(actual),
      sizes: new Float32Array(actual),
      seeds: new Float32Array(actual),
      width,
      height,
      count: actual,
    };
    const norm = 1 / Math.max(width, height);

    let j = 0;
    let v = 0;
    let nextSource = 0;
    for (let y = 0; y < height && j < actual; y += 1) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width && j < actual; x += 1) {
        const i = rowOffset + x * 4;
        if (!isVisible(data, i, threshold, hasAlpha)) continue;
        if (v === nextSource) {
          out.baseCoords[j * 2] = (x - width / 2) * norm;
          out.baseCoords[j * 2 + 1] = -(y - height / 2) * norm;
          out.brightness[j] = brightnessAt(data, i, hasAlpha);
          out.sizes[j] = 0.85 + Math.random() * 0.3;
          out.seeds[j] = Math.random();
          j += 1;
          nextSource =
            j < actual ? Math.min(Math.floor(j * step), total - 1) : -1;
        }
        v += 1;
      }
    }

    return out;
  }

  function buildInWorker(): Promise<void> {
    return (async () => {
      const response = await fetch(src, { mode: "cors" });
      if (!response.ok) {
        throw new Error(
          `Unable to load particle source "${src}" (${response.status}).`,
        );
      }
      const bitmap = await createImageBitmap(await response.blob());

      return new Promise<void>((resolve, reject) => {
        const worker = new Worker(
          new URL("./car-particles.worker.ts", import.meta.url),
          { type: "module" },
        );

        let settled = false;
        const finish = (fn: () => void) => {
          if (settled) return;
          settled = true;
          worker.terminate();
          fn();
        };

        worker.onmessage = (event: MessageEvent) => {
          const payload = event.data as ParticleSample | { error: string };
          if ("error" in payload) {
            finish(() => reject(new Error(payload.error)));
            return;
          }
          finish(() => {
            try {
              allocate(payload);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        };
        worker.onerror = (event) =>
          finish(() =>
            reject(new Error(event.message || "Particle worker failed.")),
          );

        worker.postMessage(
          {
            bitmap,
            maxDimension: MAX_SCAN_DIMENSION,
            targetCount,
            threshold,
          },
          [bitmap],
        );
      });
    })();
  }

  async function build() {
    if (canUseWorker()) return buildInWorker();
    const image = await loadImage(src);
    allocate(sampleOnMainThread(image));
  }

  function setPointer(ndcX: number, ndcY: number) {
    pointerNdcX = ndcX;
    pointerNdcY = ndcY;
    if (!pointerActive) {
      pointerActive = true;
      restFrames = REST_FRAMES;
    }
  }

  function clearPointer() {
    pointerActive = false;
  }

  function resize(width: number, height: number) {
    if (disposed) return;

    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));

    const bufferWidth = Math.floor(safeWidth * pixelRatio);
    const bufferHeight = Math.floor(safeHeight * pixelRatio);
    if (canvas.width !== bufferWidth) canvas.width = bufferWidth;
    if (canvas.height !== bufferHeight) canvas.height = bufferHeight;
    ctx.viewport(0, 0, bufferWidth, bufferHeight);

    aspect = safeWidth / safeHeight;
    worldHeight = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_Z;
    worldWidth = worldHeight * aspect;
    projection[0] = 1 / (aspect * Math.tan((CAMERA_FOV * Math.PI) / 360));

    if (program) {
      ctx.useProgram(program);
      ctx.uniformMatrix4fv(projectionLoc, false, projection);
    }

    applyFit();
  }

  function update(delta: number) {
    if (!ready || disposed || !positions || !velocities || !homePositions) {
      return;
    }

    const dt = Math.min(Math.max(delta, 0), 1 / 30);
    if (dt <= 0) return;

    time += dt;
    if (program) ctx.useProgram(program);
    if (uTime) ctx.uniform1f(uTime, time);

    // The idle shimmer runs off `uTime` in the vertex shader alone, so a settled
    // field with no pointer under it has nothing left to integrate. Skipping the
    // loop is what keeps an idle hero off the CPU entirely.
    if (!pointerActive && restFrames <= 0) return;
    if (restFrames > 0) restFrames -= 1;

    updatePointerWorld();

    const r2 = radiusWorld * radiusWorld;
    const damp = Math.pow(damping, dt * 60);
    const positionArray = positions;
    const velocityArray = velocities;
    const homeArray = homePositions;
    const active = drawnCount > 0 ? Math.min(drawnCount, count) : count;

    let maxSpeedSq = 0;

    for (let i = 0; i < active; i += 1) {
      const i3 = i * 3;

      const px = positionArray[i3];
      const py = positionArray[i3 + 1];
      const pz = positionArray[i3 + 2];

      let vx = velocityArray[i3];
      let vy = velocityArray[i3 + 1];
      let vz = velocityArray[i3 + 2];

      let ax = (homeArray[i3] - px) * spring;
      let ay = (homeArray[i3 + 1] - py) * spring;
      let az = (homeArray[i3 + 2] - pz) * spring;

      if (hasMouse) {
        const dx = px - mouseX;
        const dy = py - mouseY;
        const dz = pz;
        const dist2 = dx * dx + dy * dy + dz * dz;

        if (dist2 < r2) {
          const dist = Math.sqrt(dist2) + 1e-4;
          const falloff = 1 - dist / radiusWorld;
          const force = falloff * falloff * strength;
          const inverse = 1 / dist;

          ax += dx * inverse * force;
          ay += dy * inverse * force;
          az += dz * inverse * force + force * depth;
        }
      }

      vx = (vx + ax * dt) * damp;
      vy = (vy + ay * dt) * damp;
      vz = (vz + az * dt) * damp;

      const speedSq = vx * vx + vy * vy + vz * vz;
      if (speedSq > maxSpeedSq) maxSpeedSq = speedSq;

      positionArray[i3] = px + vx * dt;
      positionArray[i3 + 1] = py + vy * dt;
      positionArray[i3 + 2] = pz + vz * dt;

      velocityArray[i3] = vx;
      velocityArray[i3 + 1] = vy;
      velocityArray[i3 + 2] = vz;
    }

    // Keep integrating until the tail of the settle has damped out.
    if (maxSpeedSq > REST_SPEED_SQ) restFrames = REST_FRAMES;

    if (positionBuffer) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
      ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, positions);
    }
  }

  function render() {
    if (disposed || !program || count === 0) return;
    ctx.useProgram(program);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
    ctx.drawArrays(ctx.POINTS, 0, drawnCount);
  }

  function degrade(): number {
    if (!ready || count === 0 || drawnCount === 0) return drawnCount;
    drawnCount = Math.max(
      Math.floor(count * MIN_QUALITY),
      Math.floor(drawnCount * 0.7),
    );
    if (uSize) {
      ctx.useProgram(program);
      ctx.uniform1f(uSize, particleSize * (count / drawnCount) * 0.75);
    }
    return drawnCount;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    ready = false;

    canvas.removeEventListener("webglcontextlost", handleContextLost, false);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored, false);

    releaseGL();
    // Release the context outright. Browsers only keep a small pool of live
    // contexts, and this one is rebuilt on every client-side navigation.
    ctx.getExtension("WEBGL_lose_context")?.loseContext();

    baseCoords = null;
    homePositions = null;
    positions = null;
    velocities = null;
    sizes = new Float32Array(0);
    seeds = new Float32Array(0);
    brightness = new Float32Array(0);
  }

  void build()
    .then(() => {
      // The canvas may only have been laid out after the field finished
      // building, so take one measurement here as a floor.
      if (disposed) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width > 0 && height > 0) resize(width, height);
    })
    .catch((error: unknown) => {
      if (!disposed) onError?.(error);
    });

  return {
    setPointer,
    clearPointer,
    resize,
    update,
    render,
    degrade,
    dispose,
  };
}
