/**
 * Typed builders for json-render three specs.
 *
 * The catalog schemas use `.nullable()` rather than `.optional()`, so every
 * prop key must be present on every element. These helpers fill in the full
 * prop set so scene definitions stay readable.
 */

export type Vec3 = [number, number, number]

export type Element = {
  type: string
  props: Record<string, unknown>
  children: string[]
}

export type Elements = Record<string, Element>

const TRANSFORM = { position: null, rotation: null, scale: null }
const SHADOWS = { castShadow: null, receiveShadow: null }

type Transform = { position?: Vec3; rotation?: Vec3; scale?: Vec3 | number }

function transform(t: Transform) {
  return {
    position: t.position ?? null,
    rotation: t.rotation ?? null,
    scale: typeof t.scale === "number" ? ([t.scale, t.scale, t.scale] as Vec3) : (t.scale ?? null),
  }
}

export type Material = {
  color?: string
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
  transparent?: boolean
  wireframe?: boolean
}

export function mat(m: Material) {
  return {
    color: m.color ?? null,
    metalness: m.metalness ?? null,
    roughness: m.roughness ?? null,
    emissive: m.emissive ?? null,
    emissiveIntensity: m.emissiveIntensity ?? null,
    opacity: m.opacity ?? null,
    transparent: m.transparent ?? null,
    wireframe: m.wireframe ?? null,
  }
}

function el(type: string, props: Record<string, unknown>, children: string[] = []): Element {
  return { type, props, children }
}

/* ------------------------------------------------------------------ layout */

export function group(t: Transform, children: string[] = []) {
  return el("Group", transform(t), children)
}

export function float(
  t: Transform & { speed?: number; rotationIntensity?: number; floatIntensity?: number },
  children: string[] = [],
) {
  return el(
    "Float",
    {
      ...transform(t),
      speed: t.speed ?? null,
      rotationIntensity: t.rotationIntensity ?? null,
      floatIntensity: t.floatIntensity ?? null,
      enabled: true,
    },
    children,
  )
}

export function spin(t: Transform & { speed?: number; axis?: "x" | "y" | "z" }, children: string[] = []) {
  return el("Spin", { ...transform(t), speed: t.speed ?? null, axis: t.axis ?? null }, children)
}

export function orbit(
  t: Transform & { speed?: number; radius?: number; tilt?: number },
  children: string[] = [],
) {
  return el(
    "Orbit",
    { ...transform(t), speed: t.speed ?? null, radius: t.radius ?? null, tilt: t.tilt ?? null },
    children,
  )
}

export function pulse(t: Transform & { speed?: number; min?: number; max?: number }, children: string[] = []) {
  return el(
    "Pulse",
    { ...transform(t), speed: t.speed ?? null, min: t.min ?? null, max: t.max ?? null },
    children,
  )
}

/* ------------------------------------------------------------------ lights */

export function ambient(color: string, intensity: number) {
  return el("AmbientLight", { color, intensity })
}

export function directional(
  t: Transform & { color?: string; intensity?: number; castShadow?: boolean },
) {
  return el("DirectionalLight", {
    ...transform(t),
    color: t.color ?? null,
    intensity: t.intensity ?? null,
    castShadow: t.castShadow ?? false,
  })
}

export function pointLight(
  t: Transform & { color?: string; intensity?: number; distance?: number; decay?: number },
) {
  return el("PointLight", {
    ...transform(t),
    color: t.color ?? null,
    intensity: t.intensity ?? null,
    distance: t.distance ?? null,
    decay: t.decay ?? null,
    castShadow: false,
  })
}

/* ------------------------------------------------------------------- solids */

type Solid = Transform & { material?: Material; castShadow?: boolean; receiveShadow?: boolean }

function solidBase(s: Solid) {
  return {
    ...transform(s),
    material: s.material ? mat(s.material) : null,
    castShadow: s.castShadow ?? null,
    receiveShadow: s.receiveShadow ?? null,
  }
}

export function plane(s: Solid & { width?: number; height?: number }, children: string[] = []) {
  return el("Plane", { ...solidBase(s), width: s.width ?? null, height: s.height ?? null }, children)
}

export function sphere(s: Solid & { radius?: number; widthSegments?: number; heightSegments?: number }) {
  return el("Sphere", {
    ...solidBase(s),
    radius: s.radius ?? null,
    widthSegments: s.widthSegments ?? null,
    heightSegments: s.heightSegments ?? null,
  })
}

export function box(s: Solid & { width?: number; height?: number; depth?: number }) {
  return el("Box", {
    ...solidBase(s),
    width: s.width ?? null,
    height: s.height ?? null,
    depth: s.depth ?? null,
  })
}

export function roundedBox(
  s: Solid & { width?: number; height?: number; depth?: number; radius?: number; smoothness?: number },
) {
  return el("RoundedBox", {
    ...solidBase(s),
    width: s.width ?? null,
    height: s.height ?? null,
    depth: s.depth ?? null,
    radius: s.radius ?? null,
    smoothness: s.smoothness ?? null,
  })
}

export function cylinder(
  s: Solid & { radiusTop?: number; radiusBottom?: number; height?: number; radialSegments?: number },
) {
  return el("Cylinder", {
    ...solidBase(s),
    radiusTop: s.radiusTop ?? null,
    radiusBottom: s.radiusBottom ?? null,
    height: s.height ?? null,
    radialSegments: s.radialSegments ?? null,
  })
}

export function cone(s: Solid & { radius?: number; height?: number; radialSegments?: number }) {
  return el("Cone", {
    ...solidBase(s),
    radius: s.radius ?? null,
    height: s.height ?? null,
    radialSegments: s.radialSegments ?? null,
  })
}

export function torus(
  s: Solid & { radius?: number; tube?: number; radialSegments?: number; tubularSegments?: number },
) {
  return el("Torus", {
    ...solidBase(s),
    radius: s.radius ?? null,
    tube: s.tube ?? null,
    radialSegments: s.radialSegments ?? null,
    tubularSegments: s.tubularSegments ?? null,
  })
}

export function torusKnot(
  s: Solid & {
    radius?: number
    tube?: number
    tubularSegments?: number
    radialSegments?: number
    p?: number
    q?: number
  },
) {
  return el("TorusKnot", {
    ...solidBase(s),
    radius: s.radius ?? null,
    tube: s.tube ?? null,
    tubularSegments: s.tubularSegments ?? null,
    radialSegments: s.radialSegments ?? null,
    p: s.p ?? null,
    q: s.q ?? null,
  })
}

export function glassSphere(
  t: Transform & {
    radius?: number
    color?: string
    transmission?: number
    thickness?: number
    roughness?: number
    chromaticAberration?: number
    ior?: number
    distortion?: number
  },
) {
  return el("GlassSphere", {
    ...transform(t),
    ...SHADOWS,
    radius: t.radius ?? null,
    widthSegments: null,
    heightSegments: null,
    color: t.color ?? null,
    transmission: t.transmission ?? null,
    thickness: t.thickness ?? null,
    roughness: t.roughness ?? null,
    chromaticAberration: t.chromaticAberration ?? null,
    ior: t.ior ?? null,
    distortion: t.distortion ?? null,
    distortionScale: null,
    temporalDistortion: null,
    samples: null,
    resolution: null,
  })
}

export function distortSphere(
  t: Transform & {
    radius?: number
    color?: string
    speed?: number
    distort?: number
    metalness?: number
    roughness?: number
  },
) {
  return el("DistortSphere", {
    ...transform(t),
    ...SHADOWS,
    radius: t.radius ?? null,
    widthSegments: null,
    heightSegments: null,
    color: t.color ?? null,
    speed: t.speed ?? null,
    distort: t.distort ?? null,
    metalness: t.metalness ?? null,
    roughness: t.roughness ?? null,
  })
}

/* ---------------------------------------------------------------- ambience */

export function sky(o: {
  sunPosition?: Vec3
  rayleigh?: number
  turbidity?: number
  mieCoefficient?: number
  mieDirectionalG?: number
}) {
  return el("Sky", {
    distance: null,
    sunPosition: o.sunPosition ?? null,
    inclination: null,
    azimuth: null,
    mieCoefficient: o.mieCoefficient ?? null,
    mieDirectionalG: o.mieDirectionalG ?? null,
    rayleigh: o.rayleigh ?? null,
    turbidity: o.turbidity ?? null,
  })
}

export function stars(o: {
  radius?: number
  depth?: number
  count?: number
  factor?: number
  saturation?: number
  fade?: boolean
  speed?: number
}) {
  return el("Stars", {
    radius: o.radius ?? null,
    depth: o.depth ?? null,
    count: o.count ?? null,
    factor: o.factor ?? null,
    saturation: o.saturation ?? null,
    fade: o.fade ?? true,
    speed: o.speed ?? null,
  })
}

export function cloud(
  t: Transform & {
    seed?: number
    segments?: number
    bounds?: Vec3
    volume?: number
    speed?: number
    opacity?: number
    color?: string
    growth?: number
    fade?: number
  },
) {
  return el("Cloud", {
    ...transform(t),
    seed: t.seed ?? null,
    segments: t.segments ?? null,
    bounds: t.bounds ?? null,
    volume: t.volume ?? null,
    speed: t.speed ?? null,
    fade: t.fade ?? null,
    opacity: t.opacity ?? null,
    color: t.color ?? null,
    growth: t.growth ?? null,
  })
}

export function sparkles(
  t: Transform & {
    count?: number
    speed?: number
    opacity?: number
    color?: string
    size?: number
    noise?: number
  },
) {
  return el("Sparkles", {
    ...transform(t),
    count: t.count ?? null,
    speed: t.speed ?? null,
    opacity: t.opacity ?? null,
    color: t.color ?? null,
    size: t.size ?? null,
    noise: t.noise ?? null,
  })
}

export function environment(o: {
  preset?: string
  background?: boolean
  blur?: number
  intensity?: number
}) {
  return el("Environment", {
    preset: o.preset ?? null,
    background: o.background ?? false,
    blur: o.blur ?? null,
    intensity: o.intensity ?? null,
  })
}

export function fog(color: string, near: number, far: number) {
  return el("Fog", { color, near, far })
}

export function reflectorPlane(
  t: Transform & {
    width?: number
    height?: number
    color?: string
    resolution?: number
    blur?: number
    mirror?: number
    mixBlur?: number
    mixStrength?: number
    metalness?: number
    roughness?: number
  },
) {
  return el("ReflectorPlane", {
    ...transform(t),
    width: t.width ?? null,
    height: t.height ?? null,
    color: t.color ?? null,
    resolution: t.resolution ?? null,
    blur: t.blur ?? null,
    mirror: t.mirror ?? null,
    mixBlur: t.mixBlur ?? null,
    mixStrength: t.mixStrength ?? null,
    depthScale: null,
    metalness: t.metalness ?? null,
    roughness: t.roughness ?? null,
  })
}

export function contactShadows(
  t: Transform & {
    opacity?: number
    width?: number
    height?: number
    blur?: number
    far?: number
    color?: string
  },
) {
  return el("ContactShadows", {
    ...transform(t),
    opacity: t.opacity ?? null,
    width: t.width ?? null,
    height: t.height ?? null,
    blur: t.blur ?? null,
    near: null,
    far: t.far ?? null,
    smooth: null,
    resolution: null,
    frames: null,
    color: t.color ?? null,
  })
}

/* ---------------------------------------------------------------- post fx */

export function effectComposer(children: string[]) {
  return el("EffectComposer", { enabled: true, multisampling: 4 }, children)
}

export function bloom(o: { intensity?: number; luminanceThreshold?: number; mipmapBlur?: boolean }) {
  return el("Bloom", {
    intensity: o.intensity ?? null,
    luminanceThreshold: o.luminanceThreshold ?? null,
    luminanceSmoothing: null,
    mipmapBlur: o.mipmapBlur ?? true,
  })
}

export function vignette(offset: number, darkness: number) {
  return el("Vignette", { offset, darkness })
}

export { TRANSFORM, SHADOWS }
