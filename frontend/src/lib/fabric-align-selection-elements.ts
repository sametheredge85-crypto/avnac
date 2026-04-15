import type { Canvas } from 'fabric'
import { getAvnacLocked } from './avnac-object-lock'

export type AlignElementsKind =
  | 'left'
  | 'centerH'
  | 'right'
  | 'top'
  | 'centerV'
  | 'bottom'

/**
 * Align edges or centers of the active multi-selection to the selection bounds.
 * Locked objects define the target bounds but are not moved.
 */
export function alignSelectedObjectsRelative(
  canvas: Canvas,
  fabricMod: typeof import('fabric'),
  kind: AlignElementsKind,
): void {
  const active = canvas.getActiveObject()
  if (!active || !fabricMod.ActiveSelection) return
  if (!(active instanceof fabricMod.ActiveSelection)) return
  const objs = active.getObjects()
  if (objs.length < 2) return

  const snapshots = objs.map((o) => ({
    o,
    br: o.getBoundingRect(),
    locked: getAvnacLocked(o),
  }))

  if (!snapshots.some((s) => !s.locked)) return

  const allLeft = snapshots.map((s) => s.br.left)
  const allRight = snapshots.map((s) => s.br.left + s.br.width)
  const allTop = snapshots.map((s) => s.br.top)
  const allBottom = snapshots.map((s) => s.br.top + s.br.height)
  const minL = Math.min(...allLeft)
  const maxR = Math.max(...allRight)
  const minT = Math.min(...allTop)
  const maxB = Math.max(...allBottom)
  const selCx = (minL + maxR) / 2
  const selCy = (minT + maxB) / 2

  for (const { o, br, locked } of snapshots) {
    if (locked) continue
    let dx = 0
    let dy = 0
    if (kind === 'left') dx = minL - br.left
    else if (kind === 'centerH') dx = selCx - (br.left + br.width / 2)
    else if (kind === 'right') dx = maxR - (br.left + br.width)
    else if (kind === 'top') dy = minT - br.top
    else if (kind === 'centerV') dy = selCy - (br.top + br.height / 2)
    else if (kind === 'bottom') dy = maxB - (br.top + br.height)

    if (dx !== 0 || dy !== 0) {
      o.set({
        left: (o.left ?? 0) + dx,
        top: (o.top ?? 0) + dy,
      })
      o.setCoords()
    }
  }
  active.setCoords()
  canvas.requestRenderAll()
}
