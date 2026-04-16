import type { Canvas, FabricObject } from 'fabric'
import { ensureGoogleFontsForFamilies } from './load-google-font'

function collectFromStyles(
  styles: unknown,
  acc: Set<string>,
): void {
  if (!styles || typeof styles !== 'object') return
  for (const line of Object.values(styles as Record<string, unknown>)) {
    if (!line || typeof line !== 'object') continue
    for (const decl of Object.values(line as Record<string, unknown>)) {
      if (!decl || typeof decl !== 'object') continue
      if (!('fontFamily' in decl)) continue
      const ff = (decl as { fontFamily?: unknown }).fontFamily
      if (typeof ff === 'string' && ff.trim()) acc.add(ff)
    }
  }
}

function collectFromObject(
  o: FabricObject,
  mod: typeof import('fabric'),
  acc: Set<string>,
): void {
  if (mod.Group && o instanceof mod.Group) {
    for (const c of o.getObjects()) collectFromObject(c, mod, acc)
    return
  }
  if (!(o instanceof mod.FabricText)) return
  const ff = o.fontFamily
  if (typeof ff === 'string' && ff.trim()) acc.add(ff)
  collectFromStyles(o.styles, acc)
}

export function collectFontFamiliesFromCanvas(
  canvas: Canvas,
  mod: typeof import('fabric'),
): string[] {
  const acc = new Set<string>()
  for (const o of canvas.getObjects()) collectFromObject(o, mod, acc)
  return [...acc]
}

function relayoutFabricTextTree(o: FabricObject, mod: typeof import('fabric')) {
  if (mod.Group && o instanceof mod.Group) {
    for (const c of o.getObjects()) relayoutFabricTextTree(c, mod)
    return
  }
  if (o instanceof mod.FabricText) {
    o.initDimensions()
    o.setCoords()
  }
}

export async function loadCanvasGoogleFontsAndRelayout(
  canvas: Canvas,
  mod: typeof import('fabric'),
): Promise<void> {
  const families = collectFontFamiliesFromCanvas(canvas, mod)
  await ensureGoogleFontsForFamilies(families)
  for (const o of canvas.getObjects()) relayoutFabricTextTree(o, mod)
  canvas.requestRenderAll()
}
