// Pixel-art helpers for the role-play stage (#76). Pure functions, no React.
// Sprites are text grids: one character per pixel, '.' is transparent, every other
// character is a key of a palette. They are drawn as SVG rectangles with crisp edges.

/**
 * Illustration palette, from the complementary colours of the State design charter
 * (docs/CHARTE_GRAPHIQUE.pdf p. 47, meant for illustrations): tint 1 = pure colour,
 * tints 2/3/4 = 50/25/10 % mixed with white, 0 = shade.
 */
export const PALETTE = {
  ink: '#1e1f33', // outline and darkest shade
  black: '#000000',
  white: '#ffffff',
  franceBlue: '#000091',
  marianneRed: '#e1000f',
  // G: slate blue (walls at night, trousers)
  g0: '#41456e',
  g1: '#484d7a',
  g2: '#a4a6bd',
  g3: '#d1d3de',
  // F: blue (sky, jeans)
  f1: '#5770be',
  f2: '#abb8df',
  f3: '#d5dbef',
  // E: green (plants, hoodie)
  e0: '#009b7e',
  e1: '#00ac8c',
  e2: '#80d6c6',
  // L, K: yellows (lamps, light)
  k1: '#ffe800',
  l1: '#fdcf41',
  l3: '#fff3d0',
  // M: orange (headscarf, warm light)
  m1: '#ff9940',
  m2: '#ffcca0',
  // H, I: warm skins and coral
  h1: '#ff8d7e',
  i1: '#d08a77',
  i2: '#e8c5bb',
  // P, R: woods and dark skin
  p0: '#714652',
  p1: '#7d4e5b',
  r1: '#a26859',
  r2: '#d1b4ac',
  // A: khaki (apron, carpet)
  a1: '#958b62',
  a2: '#cac5b1',
  // Q: neutral greys
  q1: '#333333',
  q2: '#808080',
  q3: '#bfbfbf',
  q4: '#e6e6e6',
} as const

export type PaletteKey = keyof typeof PALETTE

/** Grid (rows of equal length) + palette for its characters. */
export type Sprite = {
  rows: readonly string[]
  colors: Readonly<Record<string, string>>
}

/** One horizontal run of same-colour pixels: a single SVG rectangle. */
export type PixelRun = { x: number; y: number; width: number; color: string }

/**
 * Merges each row into runs of identical pixels: a 16 × 32 sprite becomes a few dozen
 * rectangles instead of 512. Unknown characters are treated as transparent.
 */
export function pixelRuns(sprite: Sprite): PixelRun[] {
  const runs: PixelRun[] = []
  sprite.rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const key = row[x]!
      let end = x + 1
      while (end < row.length && row[end] === key) end++
      const color = key === '.' ? undefined : sprite.colors[key]
      if (color) runs.push({ x, y, width: end - x, color })
      x = end
    }
  })
  return runs
}

/**
 * Adds a one-pixel outline (key 'o') around every opaque pixel, on the transparent pixels
 * that touch it (no diagonals). The grid grows by one pixel on each side.
 */
export function withOutline(rows: readonly string[]): string[] {
  const height = rows.length + 2
  const width = Math.max(...rows.map((r) => r.length)) + 2
  const at = (x: number, y: number) => rows[y - 1]?.[x - 1] ?? '.'
  const out: string[] = []
  for (let y = 0; y < height; y++) {
    let line = ''
    for (let x = 0; x < width; x++) {
      const key = at(x, y)
      if (key !== '.') {
        line += key
        continue
      }
      const touches = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].some(
        (k) => k !== '.',
      )
      line += touches ? 'o' : '.'
    }
    out.push(line)
  }
  return out
}

/** Writes pixels over a grid (used to draw faces): returns a new grid. */
export function paint(
  rows: readonly string[],
  pixels: readonly (readonly [x: number, y: number, key: string])[],
): string[] {
  const grid = rows.map((r) => r.split(''))
  for (const [x, y, key] of pixels) {
    if (grid[y] && x >= 0 && x < grid[y]!.length) grid[y]![x] = key
  }
  return grid.map((r) => r.join(''))
}

// ---- Pixel font -------------------------------------------------------------------
// 3 × 5 capitals for the onomatopoeias of the stage ("BOUM", "TOC TOC"…). Decorative
// only: what happens is always written in the dialogue too.

const FONT: Record<string, readonly string[]> = {
  A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'],
  B: ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'],
  C: ['XXX', 'X..', 'X..', 'X..', 'XXX'],
  D: ['XX.', 'X.X', 'X.X', 'X.X', 'XX.'],
  E: ['XXX', 'X..', 'XX.', 'X..', 'XXX'],
  G: ['XXX', 'X..', 'X.X', 'X.X', 'XXX'],
  H: ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'],
  I: ['XXX', '.X.', '.X.', '.X.', 'XXX'],
  K: ['X.X', 'X.X', 'XX.', 'X.X', 'X.X'],
  L: ['X..', 'X..', 'X..', 'X..', 'XXX'],
  M: ['X.X', 'XXX', 'XXX', 'X.X', 'X.X'],
  N: ['XX.', 'X.X', 'X.X', 'X.X', 'X.X'],
  O: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
  P: ['XX.', 'X.X', 'XX.', 'X..', 'X..'],
  R: ['XX.', 'X.X', 'XX.', 'X.X', 'X.X'],
  S: ['XXX', 'X..', 'XXX', '..X', 'XXX'],
  T: ['XXX', '.X.', '.X.', '.X.', '.X.'],
  U: ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'],
  Z: ['XXX', '..X', '.X.', 'X..', 'XXX'],
  '!': ['X', 'X', 'X', '.', 'X'],
  ' ': ['.', '.', '.', '.', '.'],
}

/**
 * Sprite of a short text in the pixel font, with an outline: `fill` for the letters,
 * `outline` around them. Letters the font does not have are skipped.
 */
export function textSprite(text: string, fill: string, outline: string = PALETTE.ink): Sprite {
  const glyphs = [...text.toUpperCase()].map((c) => FONT[c]).filter((g) => g !== undefined)
  const rows = Array.from({ length: 5 }, (_, y) => glyphs.map((g) => g[y]).join('.'))
  return { rows: withOutline(rows), colors: { X: fill, o: outline } }
}
