import {
  Group,
  LayoutManager,
  Path,
  Point,
  Polygon,
  util,
  type XY,
} from 'fabric'
import type { ArrowLineStyle, ArrowPathType } from './avnac-shape-meta'
import { getAvnacShapeMeta } from './avnac-shape-meta'

export type ArrowOpts = {
  strokeWidth: number
  headFrac: number
  color: string
  lineStyle?: ArrowLineStyle
  roundedEnds?: boolean
  pathType?: ArrowPathType
}

function headGeometry(
  L: number,
  strokeW: number,
  headFrac: number,
): { headLen: number; headHalf: number } {
  const hf = Math.max(0, Math.min(2, headFrac))
  const shaftH = strokeW / 2
  const headWing = strokeW * 1.3 * hf
  const headHalf = shaftH + headWing
  const headLen = Math.min(headHalf * 1.6, L * 0.45)
  return { headLen, headHalf }
}

function dashArrayForStyle(
  style: ArrowLineStyle | undefined,
  strokeW: number,
): number[] | undefined {
  if (!style || style === 'solid') return undefined
  if (style === 'dashed') return [strokeW * 2.8, strokeW * 1.6]
  return [0, strokeW * 2.2]
}

function shaftStrokeLineCap(
  lineStyle: ArrowLineStyle | undefined,
  roundedEnds: boolean | undefined,
): CanvasLineCap {
  if (lineStyle === 'dotted') return 'round'
  return roundedEnds ? 'round' : 'butt'
}

function curveBulge(
  L: number,
  strokeW: number,
  pathType: ArrowPathType | undefined,
): number {
  if (pathType !== 'curved') return 0
  return -Math.min(L * 0.24, Math.max(strokeW * 4.5, 14))
}

function shaftPathD(shaftLen: number, bulge: number): string {
  if (bulge === 0) {
    return `M 0 0 L ${shaftLen} 0`
  }
  const mid = shaftLen / 2
  return `M 0 0 Q ${mid} ${bulge} ${shaftLen} 0`
}

function headTangentAngleDeg(shaftLen: number, bulge: number): number {
  if (bulge === 0) return 0
  return (Math.atan2(-2 * bulge, shaftLen) * 180) / Math.PI
}

export function getArrowParts(
  g: Group,
): { shaft: Path; head: Polygon } | null {
  const objs = g.getObjects()
  const shaft = objs.find((o) => o instanceof Path) as Path | undefined
  const head = objs.find((o) => o instanceof Polygon) as Polygon | undefined
  if (shaft && head) return { shaft, head }
  return null
}

export function arrowDisplayColor(g: Group): string {
  const parts = getArrowParts(g)
  if (parts) {
    const s = parts.shaft.stroke
    if (typeof s === 'string') return s
    const f = parts.head.fill
    if (typeof f === 'string') return f
  }
  return '#262626'
}

export function createArrowGroup(
  mod: typeof import('fabric'),
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts: ArrowOpts,
): Group {
  const {
    strokeWidth: strokeW,
    headFrac,
    color,
    lineStyle,
    roundedEnds,
    pathType,
  } = opts
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.max(Math.hypot(dx, dy), 1)
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI
  const hf = Math.max(0, Math.min(2, headFrac))
  const { headLen, headHalf } = headGeometry(L, strokeW, headFrac)

  const shaftLen = hf < 0.01 ? L : Math.max(L - headLen, 1)
  const cap = shaftStrokeLineCap(lineStyle, roundedEnds)
  const bulge = curveBulge(L, strokeW, pathType)
  const pathD = shaftPathD(shaftLen, bulge)
  const headTilt = headTangentAngleDeg(shaftLen, bulge)

  const shaft = new mod.Path(pathD, {
    left: -L / 2,
    top: 0,
    originX: 'left',
    originY: 'center',
    stroke: color,
    strokeWidth: strokeW,
    strokeLineCap: cap,
    strokeLineJoin: 'round',
    strokeDashArray: dashArrayForStyle(lineStyle, strokeW),
    fill: '',
    selectable: false,
    evented: false,
    objectCaching: false,
  })

  let head: Polygon | undefined
  if (hf >= 0.01) {
    const headPts: XY[] = [
      { x: 0, y: -headHalf },
      { x: headLen, y: 0 },
      { x: 0, y: headHalf },
    ]
    head = new mod.Polygon(headPts, {
      left: L / 2 - headLen,
      top: 0,
      originX: 'left',
      originY: 'center',
      angle: headTilt,
      fill: color,
      stroke: null,
      strokeWidth: 0,
      selectable: false,
      evented: false,
      objectCaching: false,
    })
  }

  const children = head ? [shaft, head] : [shaft]

  return new mod.Group(children, {
    left: cx,
    top: cy,
    angle: angleDeg,
    originX: 'center',
    originY: 'center',
    subTargetCheck: false,
    interactive: false,
    objectCaching: false,
    layoutManager: new LayoutManager(),
  })
}

export function layoutArrowGroup(
  group: Group,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts: ArrowOpts,
): void {
  const parts = getArrowParts(group)
  if (!parts) return

  const {
    strokeWidth: strokeW,
    headFrac,
    color,
    lineStyle,
    roundedEnds,
    pathType,
  } = opts
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.max(Math.hypot(dx, dy), 1)
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI
  const hf = Math.max(0, Math.min(2, headFrac))
  const { headLen, headHalf } = headGeometry(L, strokeW, headFrac)

  const shaftLen = hf < 0.01 ? L : Math.max(L - headLen, 1)
  const cap = shaftStrokeLineCap(lineStyle, roundedEnds)
  const bulge = curveBulge(L, strokeW, pathType)
  const pathD = shaftPathD(shaftLen, bulge)
  const headTilt = headTangentAngleDeg(shaftLen, bulge)

  parts.shaft._setPath(pathD, false)
  parts.shaft.setDimensions()
  parts.shaft.set({
    left: -L / 2,
    top: 0,
    originX: 'left',
    originY: 'center',
    stroke: color,
    strokeWidth: strokeW,
    strokeLineCap: cap,
    strokeLineJoin: 'round',
    strokeDashArray: dashArrayForStyle(lineStyle, strokeW),
    fill: '',
    scaleX: 1,
    scaleY: 1,
    angle: 0,
  })

  if (hf >= 0.01) {
    const headPts: XY[] = [
      { x: 0, y: -headHalf },
      { x: headLen, y: 0 },
      { x: 0, y: headHalf },
    ]
    parts.head.set({
      points: headPts,
      left: L / 2 - headLen,
      top: 0,
      originX: 'left',
      originY: 'center',
      angle: headTilt,
      fill: color,
      stroke: null,
      strokeWidth: 0,
      scaleX: 1,
      scaleY: 1,
      visible: true,
    })
    parts.head.setDimensions()
  } else {
    parts.head.set({ visible: false })
  }

  parts.shaft.setCoords()
  parts.head.setCoords()

  group.set({
    left: cx,
    top: cy,
    angle: angleDeg,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
  })
  group.setCoords()
  group.triggerLayout({ bubbles: false })
  group.set('dirty', true)
}

export function arrowTailTipLocal(
  g: Group,
): { tail: Point; tip: Point } | null {
  const meta = getAvnacShapeMeta(g)
  if (meta?.kind === 'arrow' && meta.arrowEndpoints) {
    const inv = util.invertTransform(g.calcTransformMatrix())
    const { x1, y1, x2, y2 } = meta.arrowEndpoints
    return {
      tail: util.transformPoint(new Point(x1, y1), inv),
      tip: util.transformPoint(new Point(x2, y2), inv),
    }
  }
  const parts = getArrowParts(g)
  if (!parts) return null
  const shaftW = parts.shaft.width ?? 0
  const headW = parts.head.visible !== false ? (parts.head.width ?? 0) : 0
  const totalHalf = (shaftW + headW) / 2
  return {
    tail: new Point(-totalHalf, 0),
    tip: new Point(totalHalf, 0),
  }
}
