import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon,
  DashedLine01Icon,
  SolidLine01Icon,
} from '@hugeicons/core-free-icons'
import { useEffect, useRef, useState } from 'react'
import type { ArrowLineStyle, AvnacShapeMeta } from '../lib/avnac-shape-meta'
import {
  FloatingToolbarDivider,
  FloatingToolbarShell,
  floatingToolbarIconButton,
  floatingToolbarPopoverClass,
} from './floating-toolbar-shell'

type Props = {
  meta: AvnacShapeMeta
  arrowStrokeColor?: string
  onPolygonSides: (sides: number) => void
  onStarPoints: (points: number) => void
  onArrowStrokeColor?: (hex: string) => void
  onArrowLineStyle: (style: ArrowLineStyle) => void
  onArrowRoundedEnds: (rounded: boolean) => void
  onArrowStrokeWidth: (w: number) => void
}

function smallLabel(className = '') {
  return `text-[10px] font-medium uppercase tracking-wide text-neutral-500 ${className}`
}

function DottedLineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="3" cy="12" r="1.5" fill="currentColor" />
      <circle cx="8" cy="12" r="1.5" fill="currentColor" />
      <circle cx="13" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
      <circle cx="23" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

const LINE_STYLES: { style: ArrowLineStyle; label: string }[] = [
  { style: 'solid', label: 'Solid' },
  { style: 'dashed', label: 'Dashed' },
  { style: 'dotted', label: 'Dotted' },
]

function lineStyleIcon(style: ArrowLineStyle) {
  if (style === 'solid')
    return <HugeiconsIcon icon={SolidLine01Icon} size={18} strokeWidth={1.75} />
  if (style === 'dashed')
    return <HugeiconsIcon icon={DashedLine01Icon} size={18} strokeWidth={1.75} />
  return <DottedLineIcon />
}

export default function ShapeOptionsToolbar({
  meta,
  arrowStrokeColor,
  onPolygonSides,
  onStarPoints,
  onArrowStrokeColor,
  onArrowLineStyle,
  onArrowRoundedEnds,
  onArrowStrokeWidth,
}: Props) {
  const [strokePanelOpen, setStrokePanelOpen] = useState(false)
  const arrowRootRef = useRef<HTMLDivElement>(null)
  const arrowColorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!strokePanelOpen) return
    const onDoc = (e: MouseEvent) => {
      if (arrowRootRef.current?.contains(e.target as Node)) return
      setStrokePanelOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [strokePanelOpen])

  if (meta.kind === 'polygon') {
    const sides = meta.polygonSides ?? 6
    return (
      <FloatingToolbarShell role="toolbar" aria-label="Polygon options">
        <div className="flex items-center gap-2 py-1 pl-3 pr-3">
          <span className={smallLabel()}>Sides</span>
          <input
            type="number"
            min={3}
            max={32}
            value={sides}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v)) onPolygonSides(Math.round(v))
            }}
            className="w-12 rounded-md border border-black/12 bg-neutral-50 px-1.5 py-0.5 text-center text-xs tabular-nums text-neutral-900 outline-none focus:border-black/25"
          />
          <input
            type="range"
            min={3}
            max={16}
            value={Math.min(16, sides)}
            onChange={(e) => onPolygonSides(Number(e.target.value))}
            className="w-24 accent-neutral-900"
            aria-label="Polygon sides"
          />
        </div>
      </FloatingToolbarShell>
    )
  }

  if (meta.kind === 'star') {
    const pts = meta.starPoints ?? 5
    return (
      <FloatingToolbarShell role="toolbar" aria-label="Star options">
        <div className="flex items-center gap-2 py-1 pl-3 pr-3">
          <span className={smallLabel()}>Points</span>
          <input
            type="number"
            min={3}
            max={24}
            value={pts}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v)) onStarPoints(Math.round(v))
            }}
            className="w-12 rounded-md border border-black/12 bg-neutral-50 px-1.5 py-0.5 text-center text-xs tabular-nums text-neutral-900 outline-none focus:border-black/25"
          />
          <input
            type="range"
            min={3}
            max={12}
            value={Math.min(12, pts)}
            onChange={(e) => onStarPoints(Number(e.target.value))}
            className="w-24 accent-neutral-900"
            aria-label="Star points"
          />
        </div>
      </FloatingToolbarShell>
    )
  }

  if (meta.kind === 'arrow') {
    const lineStyle = meta.arrowLineStyle ?? 'solid'
    const rounded = meta.arrowRoundedEnds ?? false
    const strokeW = meta.arrowStrokeWidth ?? 10
    const strokeHex = arrowStrokeColor ?? '#262626'

    return (
      <div ref={arrowRootRef} className="relative">
        <FloatingToolbarShell role="toolbar" aria-label="Arrow options">
          <div className="flex items-center gap-1 py-1 pl-2 pr-2">
            <button
              type="button"
              className={floatingToolbarIconButton(false)}
              onClick={() => arrowColorInputRef.current?.click()}
              aria-label="Stroke color"
              title="Stroke color"
            >
              <span
                className="h-5 w-5 rounded-md border border-black/15 shadow-inner"
                style={{ backgroundColor: strokeHex }}
              />
            </button>
            <input
              ref={arrowColorInputRef}
              type="color"
              value={
                /^#[0-9A-Fa-f]{6}$/.test(strokeHex) ? strokeHex : '#262626'
              }
              onChange={(e) => onArrowStrokeColor?.(e.target.value)}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />

            <FloatingToolbarDivider />

            <button
              type="button"
              className={floatingToolbarIconButton(strokePanelOpen, {
                wide: true,
              })}
              aria-expanded={strokePanelOpen}
              aria-haspopup="dialog"
              aria-label="Stroke style"
              title="Stroke style"
              onClick={() => setStrokePanelOpen((o) => !o)}
            >
              {lineStyleIcon(lineStyle)}
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={12}
                strokeWidth={1.75}
                className={`transition-transform ${strokePanelOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </FloatingToolbarShell>

        {strokePanelOpen ? (
          <div
            role="dialog"
            aria-label="Stroke style options"
            className={[
              'absolute bottom-full left-1/2 z-[60] mb-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 px-4 py-3.5',
              floatingToolbarPopoverClass,
            ].join(' ')}
          >
            <div className="flex items-center gap-1.5">
              {LINE_STYLES.map(({ style, label }) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onArrowLineStyle(style)}
                  className={`flex h-10 flex-1 items-center justify-center rounded-lg border text-neutral-600 transition-colors ${
                    lineStyle === style
                      ? 'border-black/15 bg-black/[0.08] text-neutral-900'
                      : 'border-black/[0.08] hover:bg-black/[0.05]'
                  }`}
                  aria-label={label}
                  title={label}
                >
                  {lineStyleIcon(style)}
                </button>
              ))}
            </div>

            <label className="mt-3 flex cursor-pointer items-center justify-between">
              <span className="text-[13px] font-medium text-neutral-700">
                Rounded end points
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={rounded}
                onClick={() => onArrowRoundedEnds(!rounded)}
                className={`relative h-6 w-10 rounded-full transition-colors ${
                  rounded ? 'bg-neutral-900' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    rounded ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>

            <div className="mt-3 flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-neutral-700">
                Stroke weight
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={80}
                  value={strokeW}
                  onChange={(e) => onArrowStrokeWidth(Number(e.target.value))}
                  className="h-1.5 flex-1 accent-neutral-900"
                  aria-label="Stroke weight"
                />
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={strokeW}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (Number.isFinite(v)) onArrowStrokeWidth(v)
                  }}
                  className="w-12 rounded-md border border-black/12 bg-neutral-50 px-1.5 py-1 text-center text-xs tabular-nums text-neutral-900 outline-none focus:border-black/25"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return null
}
