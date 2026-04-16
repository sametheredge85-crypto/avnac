import { HugeiconsIcon } from '@hugeicons/react'
import { Resize01Icon } from '@hugeicons/core-free-icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ARTBOARD_PRESETS } from '../data/artboard-presets'
import { useViewportAwarePopoverPlacement } from '../hooks/use-viewport-aware-popover'
import {
  floatingToolbarIconButton,
  floatingToolbarPopoverClass,
} from './floating-toolbar-shell'

const PANEL_ESTIMATE_H = 220
const CANVAS_MIN = 100
const CANVAS_MAX = 16000

type Props = {
  width: number
  height: number
  onResize: (width: number, height: number) => void
  disabled?: boolean
}

export default function ArtboardResizeToolbarControl({
  width,
  height,
  onResize,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const pickPanel = useCallback(() => panelRef.current, [])

  const [sizeDraftW, setSizeDraftW] = useState(String(width))
  const [sizeDraftH, setSizeDraftH] = useState(String(height))

  useEffect(() => {
    setSizeDraftW(String(width))
    setSizeDraftH(String(height))
  }, [width, height])

  const { openUpward, shiftX } = useViewportAwarePopoverPlacement(
    open,
    rootRef,
    PANEL_ESTIMATE_H,
    pickPanel,
    'center',
  )

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function applyCustomCanvasSize() {
    const w = Number.parseInt(sizeDraftW, 10)
    const h = Number.parseInt(sizeDraftH, 10)
    if (!Number.isFinite(w) || !Number.isFinite(h)) {
      setSizeDraftW(String(width))
      setSizeDraftH(String(height))
      return
    }
    const cw = Math.min(CANVAS_MAX, Math.max(CANVAS_MIN, w))
    const ch = Math.min(CANVAS_MAX, Math.max(CANVAS_MIN, h))
    setSizeDraftW(String(cw))
    setSizeDraftH(String(ch))
    if (cw === width && ch === height) return
    onResize(cw, ch)
  }

  const label = `${width}×${height}`
  const isDisabled = !!disabled

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={isDisabled}
        className={[
          floatingToolbarIconButton(open, { wide: true }),
          'gap-1 px-2',
          isDisabled ? 'pointer-events-none opacity-40' : '',
        ].join(' ')}
        aria-label={`Artboard size, ${label}px`}
        title="Resize artboard"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          if (!isDisabled) setOpen((o) => !o)
        }}
      >
        <HugeiconsIcon icon={Resize01Icon} size={18} strokeWidth={1.75} />
        <span className="max-w-[5.5rem] truncate text-left text-xs font-medium tabular-nums text-neutral-700 sm:max-w-none">
          {label}
        </span>
      </button>
      {open && !isDisabled ? (
        <div
          ref={panelRef}
          className={[
            'absolute left-1/2 z-[70] w-[min(18rem,calc(100vw-2rem))] p-3',
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2',
            floatingToolbarPopoverClass,
          ].join(' ')}
          style={{
            transform: `translateX(calc(-50% + ${shiftX}px))`,
          }}
        >
          <p className="mb-2 text-[13px] font-medium text-neutral-800">
            Artboard size
          </p>
          <label className="mb-3 block text-[12px] font-medium text-neutral-700">
            Preset
            <select
              className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[13px] text-neutral-900 outline-none focus:border-black/20"
              aria-label="Artboard preset"
              value={
                ARTBOARD_PRESETS.find(
                  (p) => p.width === width && p.height === height,
                )?.id ?? 'custom'
              }
              onChange={(e) => {
                const id = e.target.value
                if (id === 'custom') return
                const p = ARTBOARD_PRESETS.find((x) => x.id === id)
                if (p) onResize(p.width, p.height)
              }}
            >
              <option value="custom">Custom dimensions</option>
              {ARTBOARD_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[12px] font-medium text-neutral-700">
              Width
              <input
                type="number"
                min={CANVAS_MIN}
                max={CANVAS_MAX}
                value={sizeDraftW}
                onChange={(e) => setSizeDraftW(e.target.value)}
                onBlur={applyCustomCanvasSize}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                className="mt-1 box-border w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 font-mono text-[13px] tabular-nums text-neutral-900 outline-none focus:border-black/20"
              />
            </label>
            <label className="block text-[12px] font-medium text-neutral-700">
              Height
              <input
                type="number"
                min={CANVAS_MIN}
                max={CANVAS_MAX}
                value={sizeDraftH}
                onChange={(e) => setSizeDraftH(e.target.value)}
                onBlur={applyCustomCanvasSize}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                className="mt-1 box-border w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 font-mono text-[13px] tabular-nums text-neutral-900 outline-none focus:border-black/20"
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  )
}
