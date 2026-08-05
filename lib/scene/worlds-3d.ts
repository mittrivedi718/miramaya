import {
  ambient,
  cloud,
  cone,
  cylinder,
  directional,
  distortSphere,
  type Elements,
  float,
  glassSphere,
  group,
  orbit,
  plane,
  pointLight,
  pulse,
  reflectorPlane,
  roundedBox,
  sky,
  sparkles,
  sphere,
  spin,
  stars,
  torus,
  torusKnot,
} from "./three-builders"

export type WorldScene = { elements: Elements; children: string[] }

const HALF_PI = -1.5708

/* --------------------------------------------------------------- mira ---- */
/* Ocean and devotion: a low sun over open water, spray in the air.          */

function miraWorld(): WorldScene {
  const e: Elements = {
    "mira-sky": sky({ sunPosition: [0, 0.6, -100], turbidity: 6, rayleigh: 3, mieCoefficient: 0.008 }),
    "mira-ambient": ambient("#9fd9d2", 0.55),
    "mira-sun": directional({ position: [0, 3, -14], color: "#8fe6d6", intensity: 2.2 }),
    "mira-water": reflectorPlane({
      position: [0, -1.6, -6],
      rotation: [HALF_PI, 0, 0],
      width: 60,
      height: 60,
      color: "#062a2e",
      resolution: 512,
      blur: 700,
      mirror: 0.85,
      mixBlur: 12,
      mixStrength: 3,
      metalness: 0.85,
      roughness: 0.25,
    }),
    "mira-swell-a": group({ position: [-2.4, -1.45, -5] }, ["mira-swell-a-mesh"]),
    "mira-swell-a-mesh": cylinder({
      rotation: [0, 0, HALF_PI],
      radiusTop: 0.35,
      radiusBottom: 0.35,
      height: 14,
      radialSegments: 16,
      material: { color: "#0d4a4f", roughness: 0.35, metalness: 0.4 },
    }),
    "mira-swell-b": group({ position: [1.8, -1.35, -9] }, ["mira-swell-b-mesh"]),
    "mira-swell-b-mesh": cylinder({
      rotation: [0, 0, HALF_PI],
      radiusTop: 0.5,
      radiusBottom: 0.5,
      height: 18,
      radialSegments: 16,
      material: { color: "#0a3f45", roughness: 0.4, metalness: 0.35 },
    }),
    "mira-crest": float({ position: [0, -0.9, -3.4], speed: 1.1, floatIntensity: 1.4, rotationIntensity: 0.2 }, [
      "mira-crest-mesh",
    ]),
    "mira-crest-mesh": distortSphere({
      radius: 1.1,
      color: "#1d7d78",
      speed: 1.6,
      distort: 0.45,
      metalness: 0.5,
      roughness: 0.25,
    }),
    "mira-moon": sphere({
      position: [2.6, 2.6, -16],
      radius: 1.2,
      material: { color: "#dff6f1", emissive: "#bfeae2", emissiveIntensity: 0.8, roughness: 1 },
    }),
    "mira-spray": sparkles({
      position: [0, 0.2, -4],
      scale: [9, 4, 8],
      count: 220,
      speed: 0.35,
      opacity: 0.55,
      color: "#dff6f1",
      size: 1.6,
      noise: 2.5,
    }),
    "mira-mist": cloud({
      position: [0, 1.4, -8],
      seed: 3,
      segments: 22,
      bounds: [12, 2, 4],
      volume: 7,
      opacity: 0.22,
      color: "#9fd9d2",
      speed: 0.09,
    }),
  }

  return {
    elements: e,
    children: [
      "mira-sky",
      "mira-ambient",
      "mira-sun",
      "mira-water",
      "mira-swell-a",
      "mira-swell-b",
      "mira-crest",
      "mira-moon",
      "mira-spray",
      "mira-mist",
    ],
  }
}

/* --------------------------------------------------------------- maya ---- */
/* Illusion and creation: a starfield with glass forms mid-manifestation.    */

function mayaWorld(): WorldScene {
  const e: Elements = {
    "maya-stars": stars({ radius: 70, depth: 45, count: 4500, factor: 4, saturation: 0.2, speed: 0.25 }),
    "maya-ambient": ambient("#3a3444", 0.9),
    "maya-key": pointLight({ position: [1.6, 2.2, -1.6], color: "#d8bd85", intensity: 26, distance: 18 }),
    "maya-fill": pointLight({ position: [-2.4, -0.6, -4], color: "#9f93ad", intensity: 14, distance: 20 }),
    "maya-glass": float({ position: [0, 0.1, -3.2], speed: 0.9, floatIntensity: 1.2, rotationIntensity: 0.5 }, [
      "maya-glass-mesh",
    ]),
    "maya-glass-mesh": glassSphere({
      radius: 1.05,
      color: "#efeaf0",
      transmission: 1,
      thickness: 1.4,
      roughness: 0.05,
      chromaticAberration: 0.35,
      ior: 1.45,
      distortion: 0.25,
    }),
    "maya-knot": spin({ position: [0, 0.1, -3.2], speed: 0.32, axis: "y" }, ["maya-knot-mesh"]),
    "maya-knot-mesh": torusKnot({
      radius: 1.85,
      tube: 0.045,
      tubularSegments: 220,
      radialSegments: 10,
      p: 2,
      q: 5,
      material: { color: "#d8bd85", emissive: "#d8bd85", emissiveIntensity: 0.7, roughness: 0.25, metalness: 0.8 },
    }),
    "maya-satellites": orbit({ position: [0, 0.1, -3.2], speed: 0.4, radius: 2.6, tilt: 0.42 }, [
      "maya-satellite-mesh",
    ]),
    "maya-satellite-mesh": sphere({
      radius: 0.13,
      material: { color: "#efeaf0", emissive: "#efeaf0", emissiveIntensity: 1.4, roughness: 0.4 },
    }),
    "maya-echo": pulse({ position: [0, 0.1, -3.2], speed: 0.7, min: 0.95, max: 1.35 }, ["maya-echo-mesh"]),
    "maya-echo-mesh": torus({
      rotation: [1.2, 0.4, 0],
      radius: 2.2,
      tube: 0.012,
      radialSegments: 8,
      tubularSegments: 120,
      material: { color: "#a79fae", emissive: "#a79fae", emissiveIntensity: 0.8, transparent: true, opacity: 0.6 },
    }),
    "maya-motes": sparkles({
      position: [0, 0, -4],
      scale: [8, 7, 8],
      count: 300,
      speed: 0.16,
      opacity: 0.75,
      color: "#e8d8b0",
      size: 1.9,
      noise: 3.2,
    }),
  }

  return {
    elements: e,
    children: [
      "maya-stars",
      "maya-ambient",
      "maya-key",
      "maya-fill",
      "maya-glass",
      "maya-knot",
      "maya-satellites",
      "maya-echo",
      "maya-motes",
    ],
  }
}

/* --------------------------------------------------------------- gaia ---- */
/* The gift shop at the center of the earth: warm daylight, stacked goods.   */

function gaiaWorld(): WorldScene {
  const shelfMat = { color: "#8a6a3c", roughness: 0.8, metalness: 0.1 }

  const e: Elements = {
    "gaia-env": { type: "Environment", props: { preset: "park", background: false, blur: 0, intensity: 0.9 }, children: [] },
    "gaia-ambient": ambient("#f6f1e6", 1.1),
    "gaia-sun": directional({ position: [-3, 6, 2], color: "#ffeccc", intensity: 2.4 }),
    "gaia-ground": plane({
      position: [0, -1.7, -5],
      rotation: [HALF_PI, 0, 0],
      width: 40,
      height: 40,
      material: { color: "#d9cdb0", roughness: 1 },
    }),
    "gaia-shelf-low": roundedBox({
      position: [0, -1.5, -3.6],
      width: 5.4,
      height: 0.22,
      depth: 1.4,
      radius: 0.04,
      smoothness: 3,
      material: shelfMat,
    }),
    "gaia-shelf-high": roundedBox({
      position: [0, 0.55, -4.4],
      width: 6.2,
      height: 0.22,
      depth: 1.2,
      radius: 0.04,
      smoothness: 3,
      material: shelfMat,
    }),
    "gaia-crate-a": roundedBox({
      position: [-1.5, -1.05, -3.5],
      rotation: [0, 0.24, 0],
      width: 0.85,
      height: 0.68,
      depth: 0.85,
      radius: 0.06,
      smoothness: 3,
      material: { color: "#c4673d", roughness: 0.7 },
    }),
    "gaia-crate-b": roundedBox({
      position: [1.45, -1.12, -3.3],
      rotation: [0, -0.3, 0],
      width: 0.7,
      height: 0.54,
      depth: 0.7,
      radius: 0.06,
      smoothness: 3,
      material: { color: "#5f7038", roughness: 0.7 },
    }),
    "gaia-jar": cylinder({
      position: [-0.15, -1.02, -3.2],
      radiusTop: 0.28,
      radiusBottom: 0.3,
      height: 0.74,
      radialSegments: 24,
      material: { color: "#efe6d2", roughness: 0.35, metalness: 0.15 },
    }),
    "gaia-lantern": float({ position: [0.7, 0.05, -2.7], speed: 1.4, floatIntensity: 0.7, rotationIntensity: 0.25 }, [
      "gaia-lantern-body",
      "gaia-lantern-core",
      "gaia-lantern-light",
    ]),
    "gaia-lantern-body": cylinder({
      radiusTop: 0.2,
      radiusBottom: 0.2,
      height: 0.42,
      radialSegments: 18,
      material: { color: "#5f7038", roughness: 0.5, metalness: 0.5 },
    }),
    "gaia-lantern-core": sphere({
      radius: 0.13,
      material: { color: "#ffd79a", emissive: "#ffbe5c", emissiveIntensity: 2.6, roughness: 1 },
    }),
    "gaia-lantern-light": pointLight({ color: "#ffbe5c", intensity: 9, distance: 6 }),
    "gaia-globe": spin({ position: [-1.1, 0.05, -2.9], speed: 0.22, axis: "y" }, ["gaia-globe-mesh", "gaia-globe-ring"]),
    "gaia-globe-mesh": sphere({
      radius: 0.42,
      material: { color: "#4d7f6b", roughness: 0.65, metalness: 0.2 },
    }),
    "gaia-globe-ring": torus({
      rotation: [1.35, 0, 0.3],
      radius: 0.56,
      tube: 0.02,
      radialSegments: 8,
      tubularSegments: 80,
      material: { color: "#c9a24a", metalness: 0.9, roughness: 0.3 },
    }),
    "gaia-fern-stem": cylinder({
      position: [2.05, -1.02, -3.6],
      radiusTop: 0.04,
      radiusBottom: 0.06,
      height: 0.7,
      radialSegments: 8,
      material: { color: "#6b5636", roughness: 0.9 },
    }),
    "gaia-fern-crown": cone({
      position: [2.05, -0.42, -3.6],
      radius: 0.42,
      height: 0.85,
      radialSegments: 10,
      material: { color: "#5f7038", roughness: 0.85 },
    }),
    "gaia-dust": sparkles({
      position: [0, -0.2, -3],
      scale: [7, 3.5, 5],
      count: 90,
      speed: 0.12,
      opacity: 0.35,
      color: "#fff3d8",
      size: 1.2,
      noise: 1.6,
    }),
  }

  return {
    elements: e,
    children: [
      "gaia-env",
      "gaia-ambient",
      "gaia-sun",
      "gaia-ground",
      "gaia-shelf-low",
      "gaia-shelf-high",
      "gaia-crate-a",
      "gaia-crate-b",
      "gaia-jar",
      "gaia-lantern",
      "gaia-globe",
      "gaia-fern-stem",
      "gaia-fern-crown",
      "gaia-dust",
    ],
  }
}

/* ---------------------------------------------------------- mirabelle ---- */
/* Medicine and wonder: rose mist, a ring of candles, a warm healing core.   */

function mirabelleWorld(): WorldScene {
  const candle = (id: string, x: number, z: number, h: number) => ({
    [`${id}-wax`]: cylinder({
      position: [x, -1.5 + h / 2, z],
      radiusTop: 0.09,
      radiusBottom: 0.11,
      height: h,
      radialSegments: 14,
      material: { color: "#fff3ec", roughness: 0.55 },
    }),
    [`${id}-flame`]: sphere({
      position: [x, -1.5 + h + 0.08, z],
      scale: [0.6, 1.5, 0.6],
      radius: 0.06,
      material: { color: "#ffd9b0", emissive: "#ffb478", emissiveIntensity: 3.4, roughness: 1 },
    }),
  })

  const e: Elements = {
    "mira-b-ambient": ambient("#ffd9cd", 1),
    "mira-b-glow": pointLight({ position: [0, 0.2, -3], color: "#e0a48f", intensity: 22, distance: 14 }),
    "mira-b-rim": pointLight({ position: [-2, 1.6, -1.4], color: "#fff1ea", intensity: 10, distance: 12 }),
    "mira-b-ground": plane({
      position: [0, -1.55, -5],
      rotation: [HALF_PI, 0, 0],
      width: 40,
      height: 40,
      material: { color: "#e7c6bb", roughness: 1 },
    }),
    "mira-b-heart": pulse({ position: [0, 0.15, -3.2], speed: 0.55, min: 0.94, max: 1.08 }, ["mira-b-heart-mesh"]),
    "mira-b-heart-mesh": distortSphere({
      radius: 0.82,
      color: "#e59b84",
      speed: 0.9,
      distort: 0.22,
      metalness: 0.15,
      roughness: 0.35,
    }),
    "mira-b-halo": spin({ position: [0, 0.15, -3.2], speed: 0.18, axis: "y" }, ["mira-b-halo-mesh"]),
    "mira-b-halo-mesh": torus({
      rotation: [1.4, 0, 0],
      radius: 1.5,
      tube: 0.018,
      radialSegments: 8,
      tubularSegments: 120,
      material: { color: "#c0705f", emissive: "#e0a48f", emissiveIntensity: 1.1 },
    }),
    "mira-b-vessel": float({ position: [1.35, -0.55, -2.6], speed: 1.2, floatIntensity: 0.6, rotationIntensity: 0.3 }, [
      "mira-b-vessel-body",
      "mira-b-vessel-neck",
    ]),
    "mira-b-vessel-body": sphere({
      radius: 0.3,
      material: { color: "#b8663f", roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 },
    }),
    "mira-b-vessel-neck": cylinder({
      position: [0, 0.32, 0],
      radiusTop: 0.07,
      radiusBottom: 0.1,
      height: 0.24,
      radialSegments: 14,
      material: { color: "#8a5638", roughness: 0.5 },
    }),
    ...candle("mira-b-candle-a", -1.55, -2.5, 0.62),
    ...candle("mira-b-candle-b", -1.05, -3.4, 0.44),
    ...candle("mira-b-candle-c", 1.85, -3.6, 0.52),
    "mira-b-mist": cloud({
      position: [0, -0.4, -4.2],
      seed: 9,
      segments: 20,
      bounds: [8, 1.6, 3],
      volume: 5,
      opacity: 0.3,
      color: "#f6cfc2",
      speed: 0.1,
    }),
    "mira-b-petals": sparkles({
      position: [0, 0.4, -3],
      scale: [6.5, 5, 6],
      count: 170,
      speed: 0.2,
      opacity: 0.7,
      color: "#ffcdbb",
      size: 2.1,
      noise: 2.2,
    }),
  }

  return {
    elements: e,
    children: [
      "mira-b-ambient",
      "mira-b-glow",
      "mira-b-rim",
      "mira-b-ground",
      "mira-b-heart",
      "mira-b-halo",
      "mira-b-vessel",
      "mira-b-candle-a-wax",
      "mira-b-candle-a-flame",
      "mira-b-candle-b-wax",
      "mira-b-candle-b-flame",
      "mira-b-candle-c-wax",
      "mira-b-candle-c-flame",
      "mira-b-mist",
      "mira-b-petals",
    ],
  }
}

/* ------------------------------------------------------- marked by Mit --- */
/* White ink on black: a void, a thin ring, and 1:11 constellations.         */

function mitWorld(): WorldScene {
  const white = { color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 1.6, roughness: 0.4 }

  const e: Elements = {
    "mit-stars": stars({ radius: 60, depth: 30, count: 2200, factor: 3, saturation: 0, speed: 0.12 }),
    "mit-ambient": ambient("#3a3a40", 0.5),
    "mit-key": pointLight({ position: [0, 1.4, -1.2], color: "#ffffff", intensity: 14, distance: 12 }),
    "mit-ring": spin({ position: [0, 0.15, -3.4], speed: 0.14, axis: "z" }, ["mit-ring-mesh"]),
    "mit-ring-mesh": torus({
      radius: 1.55,
      tube: 0.008,
      radialSegments: 8,
      tubularSegments: 180,
      material: white,
    }),
    "mit-ring-inner": spin({ position: [0, 0.15, -3.4], speed: -0.2, axis: "z" }, ["mit-ring-inner-mesh"]),
    "mit-ring-inner-mesh": torus({
      rotation: [0.5, 0.3, 0],
      radius: 1.1,
      tube: 0.006,
      radialSegments: 8,
      tubularSegments: 140,
      material: { ...white, emissiveIntensity: 1.1 },
    }),
    "mit-needle-a": cylinder({
      position: [-0.62, 0.15, -3.3],
      rotation: [0, 0, 0.06],
      radiusTop: 0.006,
      radiusBottom: 0.006,
      height: 1.9,
      radialSegments: 6,
      material: white,
    }),
    "mit-needle-b": cylinder({
      position: [0, 0.15, -3.3],
      radiusTop: 0.006,
      radiusBottom: 0.006,
      height: 1.9,
      radialSegments: 6,
      material: white,
    }),
    "mit-needle-c": cylinder({
      position: [0.62, 0.15, -3.3],
      rotation: [0, 0, -0.06],
      radiusTop: 0.006,
      radiusBottom: 0.006,
      height: 1.9,
      radialSegments: 6,
      material: white,
    }),
    "mit-dot-a": sphere({ position: [-0.31, 1.22, -3.3], radius: 0.028, material: white }),
    "mit-dot-b": sphere({ position: [0.31, 1.22, -3.3], radius: 0.028, material: white }),
    "mit-drift": orbit({ position: [0, 0.15, -3.4], speed: 0.26, radius: 2.1, tilt: 0.7 }, ["mit-drift-mesh"]),
    "mit-drift-mesh": sphere({ radius: 0.05, material: { ...white, emissiveIntensity: 2.4 } }),
    "mit-ink": sparkles({
      position: [0, 0.1, -3.6],
      scale: [7, 6, 6],
      count: 260,
      speed: 0.1,
      opacity: 0.9,
      color: "#ffffff",
      size: 1.4,
      noise: 1.2,
    }),
  }

  return {
    elements: e,
    children: [
      "mit-stars",
      "mit-ambient",
      "mit-key",
      "mit-ring",
      "mit-ring-inner",
      "mit-needle-a",
      "mit-needle-b",
      "mit-needle-c",
      "mit-dot-a",
      "mit-dot-b",
      "mit-drift",
      "mit-ink",
    ],
  }
}

export const WORLD_SCENES: Record<string, () => WorldScene> = {
  mira: miraWorld,
  maya: mayaWorld,
  gaia: gaiaWorld,
  mirabelle: mirabelleWorld,
  "marked-by-mit": mitWorld,
}
