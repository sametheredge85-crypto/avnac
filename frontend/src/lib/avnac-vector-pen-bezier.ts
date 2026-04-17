export type VectorPenAnchor = {
  x: number
  y: number
  inX?: number
  inY?: number
  outX?: number
  outY?: number
}

export function ctrlOutAbs(a: VectorPenAnchor): [number, number] {
  return [a.outX ?? a.x, a.outY ?? a.y]
}

export function ctrlInAbs(b: VectorPenAnchor): [number, number] {
  return [b.inX ?? b.x, b.inY ?? b.y]
}

function cubicSample(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): [number, number] {
  const u = 1 - t
  const u2 = u * u
  const u3 = u2 * u
  const t2 = t * t
  const t3 = t2 * t
  return [
    u3 * p0[0] + 3 * u2 * t * p1[0] + 3 * u * t2 * p2[0] + t3 * p3[0],
    u3 * p0[1] + 3 * u2 * t * p1[1] + 3 * u * t2 * p2[1] + t3 * p3[1],
  ]
}

/** Polyline samples along the full pen path (normalized coords). */
export function samplePenAnchorsToPolyline(
  anchors: VectorPenAnchor[],
  stepsPerSegment = 20,
  closed = false,
): [number, number][] {
  if (anchors.length < 2) return []
  const out: [number, number][] = []
  const segCount = closed ? anchors.length : anchors.length - 1
  for (let i = 0; i < segCount; i++) {
    const a = anchors[i]!
    const b = anchors[(i + 1) % anchors.length]!
    const p0: [number, number] = [a.x, a.y]
    const p1 = ctrlOutAbs(a)
    const p2 = ctrlInAbs(b)
    const p3: [number, number] = [b.x, b.y]
    const n = Math.max(2, stepsPerSegment)
    for (let s = 0; s < n; s++) {
      const t = s / n
      out.push(cubicSample(t, p0, p1, p2, p3))
    }
  }
  if (!closed) {
    const last = anchors[anchors.length - 1]!
    out.push([last.x, last.y])
  } else if (out.length > 0) {
    const f = out[0]!
    const last = out[out.length - 1]!
    if (
      (f[0] - last[0]) * (f[0] - last[0]) + (f[1] - last[1]) * (f[1] - last[1]) >
      1e-16
    ) {
      out.push([f[0], f[1]])
    }
  }
  return out
}

export function penAnchorsToFabricCommands(
  anchors: VectorPenAnchor[],
  scale: number,
  closed = false,
): [string, ...number[]][] | null {
  if (anchors.length < 2) return null
  const S = scale
  const cmds: [string, ...number[]][] = [
    ['M', anchors[0]!.x * S, anchors[0]!.y * S],
  ]
  const segCount = closed ? anchors.length : anchors.length - 1
  for (let i = 0; i < segCount; i++) {
    const a = anchors[i]!
    const b = anchors[(i + 1) % anchors.length]!
    const [ox, oy] = ctrlOutAbs(a)
    const [ix, iy] = ctrlInAbs(b)
    cmds.push(['C', ox * S, oy * S, ix * S, iy * S, b.x * S, b.y * S])
  }
  if (closed) {
    cmds.push(['Z'])
  }
  return cmds
}

export function applySmoothPlacementHandles(
  anchors: VectorPenAnchor[],
  anchorIndex: number,
  mx: number,
  my: number,
): void {
  const B = anchors[anchorIndex]
  if (!B) return
  // Drag direction is the OUT handle (tangent leaving this anchor forward).
  // IN handle mirrors across the anchor (tangent coming into it from previous).
  B.outX = mx
  B.outY = my
  if (anchorIndex <= 0) {
    delete B.inX
    delete B.inY
    return
  }
  B.inX = 2 * B.x - mx
  B.inY = 2 * B.y - my
}

export function stripAnchorHandles(a: VectorPenAnchor): void {
  delete a.inX
  delete a.inY
  delete a.outX
  delete a.outY
}
