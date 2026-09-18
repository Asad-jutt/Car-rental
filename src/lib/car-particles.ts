import * as THREE from "three";

const MAX_SCAN_DIMENSION = 1600;
const CAMERA_FOV = 45;
const CAMERA_Z = 140;
const DEFAULT_COLOR = "#e8e8e8";

const VERTEX_SHADER = `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uIdle;
uniform float uEnergy;

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
  dispose(): void;
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

interface SampledPixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

function samplePixels(image: HTMLImageElement): SampledPixels {
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const scale = Math.min(
    1,
    MAX_SCAN_DIMENSION / Math.max(naturalWidth, naturalHeight),
  );
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const scanCanvas = document.createElement("canvas");
  scanCanvas.width = width;
  scanCanvas.height = height;

  const context = scanCanvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas context is unavailable.");

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return {
    data: context.getImageData(0, 0, width, height).data,
    width,
    height,
  };
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
    radius = 0.12,
    strength = 180,
    spring = 5,
    damping = 0.93,
    depth = 0.25,
    idle = 0.12,
    opacity = 0.95,
    padding = 0.82,
    maxDpr = 2,
    onReady,
    onError,
  } = options;

  const pixelRatio = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    maxDpr,
  );

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 1, 1000);
  camera.position.set(0, 0, CAMERA_Z);

  const raycaster = new THREE.Raycaster();
  const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const pointer = new THREE.Vector2(0, 0);
  const pointerWorld = new THREE.Vector3();

  let points: THREE.Points | null = null;
  let geometry: THREE.BufferGeometry | null = null;
  let material: THREE.ShaderMaterial | null = null;
  let positionAttribute: THREE.BufferAttribute | null = null;
  let homeAttribute: THREE.BufferAttribute | null = null;

  let baseCoords: Float32Array | null = null;
  let homePositions: Float32Array | null = null;
  let positions: Float32Array | null = null;
  let velocities: Float32Array | null = null;

  let count = 0;
  let imageWidth = 1;
  let imageHeight = 1;
  let fit = 0;
  let radiusWorld = 1;
  let initialized = false;
  let ready = false;
  let disposed = false;
  let pointerActive = false;
  let time = 0;

  function handleContextLost(event: Event) {
    event.preventDefault();
    ready = false;
  }

  function handleContextRestored() {
    ready = Boolean(points);
  }

  canvas.addEventListener("webglcontextlost", handleContextLost, false);
  canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

  function applyFit() {
    if (!ready || !material || !baseCoords || !positions || !velocities || !homePositions) {
      return;
    }

    const worldHeight =
      2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const worldWidth = worldHeight * camera.aspect;

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

    if (homeAttribute) homeAttribute.needsUpdate = true;
    if (positionAttribute) positionAttribute.needsUpdate = true;

    material.uniforms.uEnergy.value = Math.max(fit * 0.15, 0.0001);
  }

  async function build() {
    const image = await loadImage(src);
    if (disposed) return;

    const sampled = samplePixels(image);
    const { data, width, height } = sampled;
    imageWidth = width;
    imageHeight = height;

    let hasAlpha = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) {
        hasAlpha = true;
        break;
      }
    }

    const coords: number[] = [];
    for (let y = 0; y < height; y += 1) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x += 1) {
        const i = rowOffset + x * 4;
        const alpha = data[i + 3];
        const luminance =
          data[i] * 0.21 + data[i + 1] * 0.71 + data[i + 2] * 0.07;
        const visible = hasAlpha ? alpha > threshold : luminance > threshold;
        if (visible) {
          const brightness = hasAlpha
            ? Math.max(alpha / 255, 0.5)
            : Math.min(Math.max(Math.sqrt(luminance / 255), 0.45), 1);
          coords.push(x, y, brightness);
        }
      }
    }

    const total = coords.length / 3;
    if (total < 8) {
      throw new Error(
        "No visible pixels were found in the particle source image.",
      );
    }

    const step = total > targetCount ? total / targetCount : 1;
    const actual = total > targetCount ? targetCount : total;
    const norm = 1 / Math.max(width, height);

    baseCoords = new Float32Array(actual * 2);
    homePositions = new Float32Array(actual * 3);
    positions = new Float32Array(actual * 3);
    velocities = new Float32Array(actual * 3);
    count = actual;

    const sizes = new Float32Array(actual);
    const seeds = new Float32Array(actual);
    const brightness = new Float32Array(actual);

    for (let j = 0; j < actual; j += 1) {
      const source = Math.min(Math.floor(j * step), total - 1);
      const px = coords[source * 3];
      const py = coords[source * 3 + 1];

      baseCoords[j * 2] = (px - width / 2) * norm;
      baseCoords[j * 2 + 1] = -(py - height / 2) * norm;

      brightness[j] = coords[source * 3 + 2];
      sizes[j] = 0.85 + Math.random() * 0.3;
      seeds[j] = Math.random();
    }

    geometry = new THREE.BufferGeometry();
    positionAttribute = new THREE.BufferAttribute(positions, 3).setUsage(
      THREE.DynamicDrawUsage,
    );
    homeAttribute = new THREE.BufferAttribute(homePositions, 3).setUsage(
      THREE.DynamicDrawUsage,
    );

    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("aHome", homeAttribute);
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute(
      "aBrightness",
      new THREE.BufferAttribute(brightness, 1),
    );

    material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: particleSize },
        uPixelRatio: { value: pixelRatio },
        uIdle: { value: idle },
        uEnergy: { value: 0.0001 },
        uColor: { value: new THREE.Vector3(...parseHexColor(color)) },
        uOpacity: { value: opacity },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 1;
    scene.add(points);

    ready = true;
    applyFit();
    render();

    onReady?.({ count, width, height });
  }

  function setPointer(ndcX: number, ndcY: number) {
    pointer.set(ndcX, ndcY);
    pointerActive = true;
  }

  function clearPointer() {
    pointerActive = false;
  }

  function resize(width: number, height: number) {
    if (disposed) return;

    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));

    renderer.setSize(safeWidth, safeHeight, false);
    camera.aspect = safeWidth / safeHeight;
    camera.updateProjectionMatrix();
    applyFit();
  }

  function update(delta: number) {
    if (!ready || disposed || !material || !positions || !velocities || !homePositions) {
      return;
    }

    const dt = Math.min(Math.max(delta, 0), 1 / 30);
    if (dt <= 0) return;

    time += dt;
    material.uniforms.uTime.value = time;

    let mouseX = 0;
    let mouseY = 0;
    let hasMouse = false;

    if (pointerActive) {
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(interactionPlane, pointerWorld)) {
        mouseX = pointerWorld.x;
        mouseY = pointerWorld.y;
        hasMouse = true;
      }
    }

    const r2 = radiusWorld * radiusWorld;
    const damp = Math.pow(damping, dt * 60);
    const positionArray = positions;
    const velocityArray = velocities;
    const homeArray = homePositions;

    for (let i = 0; i < count; i += 1) {
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

      positionArray[i3] = px + vx * dt;
      positionArray[i3 + 1] = py + vy * dt;
      positionArray[i3 + 2] = pz + vz * dt;

      velocityArray[i3] = vx;
      velocityArray[i3 + 1] = vy;
      velocityArray[i3 + 2] = vz;
    }

    if (positionAttribute) positionAttribute.needsUpdate = true;
  }

  function render() {
    if (disposed) return;
    renderer.render(scene, camera);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    ready = false;

    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);

    if (geometry) geometry.dispose();
    if (material) material.dispose();
    renderer.dispose();

    scene.clear();
    points = null;
    geometry = null;
    material = null;
    positionAttribute = null;
    homeAttribute = null;
    baseCoords = null;
    homePositions = null;
    positions = null;
    velocities = null;
  }

  void build().catch((error) => {
    if (!disposed) onError?.(error);
  });

  return {
    setPointer,
    clearPointer,
    resize,
    update,
    render,
    dispose,
  };
}
