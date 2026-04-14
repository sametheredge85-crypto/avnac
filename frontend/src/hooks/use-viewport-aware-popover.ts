import {
  useCallback,
  useLayoutEffect,
  useState,
  type RefObject,
} from 'react'

export function measureViewportPopoverPlacement(
  anchor: HTMLElement,
  panel: HTMLElement | null,
  estimatedHeightPx: number,
  horizontal: 'center' | 'left' = 'center',
): { openUpward: boolean; shiftX: number } {
  const gap = 8
  const pad = 8
  const rr = anchor.getBoundingClientRect()
  const below = window.innerHeight - rr.bottom - gap - pad
  const above = rr.top - gap - pad
  const menuH = panel?.getBoundingClientRect().height ?? estimatedHeightPx

  let openUpward: boolean
  if (above >= menuH) openUpward = true
  else if (below >= menuH) openUpward = false
  else openUpward = above > below

  let shiftX = 0
  if (panel) {
    const pr = panel.getBoundingClientRect()
    if (horizontal === 'center') {
      const w = pr.width
      const rootCx = rr.left + rr.width / 2
      if (rootCx - w / 2 < pad) shiftX = pad - (rootCx - w / 2)
      else if (rootCx + w / 2 > window.innerWidth - pad)
        shiftX = window.innerWidth - pad - (rootCx + w / 2)
    } else {
      if (pr.right > window.innerWidth - pad)
        shiftX = window.innerWidth - pad - pr.right
      else if (pr.left < pad) shiftX = pad - pr.left
    }
  }

  return { openUpward, shiftX }
}

/**
 * `openUpward === true` → attach with `bottom-full` + margin (popover above anchor).
 * Also returns horizontal `shiftX` for `translateX(calc(-50% + shiftXpx))` when centered under `left-1/2`.
 */
export function useViewportAwarePopoverPlacement(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  estimatedHeightPx: number,
  pickPanel: () => HTMLElement | null,
  horizontal: 'center' | 'left' = 'center',
) {
  const [openUpward, setOpenUpward] = useState(true)
  const [shiftX, setShiftX] = useState(0)

  useLayoutEffect(() => {
    if (!open) {
      setOpenUpward(true)
      setShiftX(0)
      return
    }

    function sync() {
      const root = anchorRef.current
      if (!root) return
      const { openUpward: up, shiftX: sx } = measureViewportPopoverPlacement(
        root,
        pickPanel(),
        estimatedHeightPx,
        horizontal,
      )
      setOpenUpward(up)
      setShiftX(sx)
    }

    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
    }
  }, [open, estimatedHeightPx, anchorRef, pickPanel, horizontal])

  return { openUpward, shiftX }
}

export function useStablePickPanel(
  strokePanelOpen: boolean,
  strokePanelRef: RefObject<HTMLDivElement | null>,
  lineTypePanelRef: RefObject<HTMLDivElement | null>,
): () => HTMLElement | null {
  return useCallback(() => {
    return strokePanelOpen
      ? strokePanelRef.current
      : lineTypePanelRef.current
  }, [strokePanelOpen, strokePanelRef, lineTypePanelRef])
}
