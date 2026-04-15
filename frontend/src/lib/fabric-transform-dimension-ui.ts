import type { Canvas, FabricObject } from 'fabric'

/** `object:modified` `action` values that end a scale / resize / skew transform. */
export const TRANSFORM_DIMENSION_END_ACTIONS = new Set([
  'scale',
  'scaleX',
  'scaleY',
  'scaling',
  'resizing',
  'skewX',
  'skewY',
  'skewing',
])

export type TransformDimensionUi = {
  left: number
  top: number
  text: string
}

/**
 * Positions are in CSS pixels relative to `position: relative` clusterEl (same space as
 * the floating element toolbar). Width/height are Fabric scene units (artboard space);
 * they do not change when only the canvas CSS size / zoom percentage changes.
 */
export function computeTransformDimensionUi(
  canvas: Canvas,
  frameEl: HTMLElement,
  clusterEl: HTMLElement,
  target: FabricObject,
): TransformDimensionUi | null {
  const br = target.getBoundingRect()
  const cw = canvas.getWidth()
  const ch = canvas.getHeight()
  const fw = frameEl.offsetWidth
  const fh = frameEl.offsetHeight
  if (cw <= 0 || ch <= 0 || fw <= 0 || fh <= 0) return null
  const sx = fw / cw
  const sy = fh / ch
  const wPx = Math.round(br.width)
  const hPx = Math.round(br.height)
  const ox = frameEl.offsetLeft
  const oy = frameEl.offsetTop
  const anchorLeft = ox + (br.left + br.width) * sx + 8
  const anchorTop = oy + (br.top + br.height) * sy + 8
  return {
    left: anchorLeft,
    top: anchorTop,
    text: `w: ${wPx.toLocaleString('en-US')} h: ${hPx.toLocaleString('en-US')}`,
  }
}
