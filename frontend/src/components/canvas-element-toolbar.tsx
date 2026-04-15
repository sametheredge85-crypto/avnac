import { HugeiconsIcon } from '@hugeicons/react'
import {
  AlignBottomIcon,
  AlignHorizontalCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignVerticalCenterIcon,
  ArrowRight01Icon,
  Copy01Icon,
  Delete02Icon,
  FilePasteIcon,
  Layers01Icon,
  More01Icon,
  SquareLock01Icon,
  SquareUnlock01Icon,
} from '@hugeicons/core-free-icons'
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import { useContainedViewportPopoverPlacement } from '../hooks/use-viewport-aware-popover'
import {
  FloatingToolbarDivider,
  FloatingToolbarShell,
  floatingToolbarIconButton,
  floatingToolbarPopoverClass,
} from './floating-toolbar-shell'

export type CanvasAlignKind =
  | 'left'
  | 'centerH'
  | 'right'
  | 'top'
  | 'centerV'
  | 'bottom'

type CanvasElementToolbarProps = {
  style: CSSProperties
  placement: 'above' | 'below'
  viewportRef: RefObject<HTMLElement | null>
  locked: boolean
  onDuplicate: () => void
  onToggleLock: () => void
  onDelete: () => void
  onCopy: () => void
  onPaste: () => void
  onAlign: (kind: CanvasAlignKind) => void
  alignAlreadySatisfied: Record<CanvasAlignKind, boolean>
}

const CanvasElementToolbar = forwardRef<HTMLDivElement, CanvasElementToolbarProps>(
  function CanvasElementToolbar(
    {
      style,
      placement,
      viewportRef,
      locked,
      onDuplicate,
      onToggleLock,
      onDelete,
      onCopy,
      onPaste,
      onAlign,
      alignAlreadySatisfied,
    },
    ref,
  ) {
    const [moreOpen, setMoreOpen] = useState(false)
    const [alignOpen, setAlignOpen] = useState(false)
    const moreWrapRef = useRef<HTMLDivElement>(null)
    const moreMenuAnchorRef = useRef<HTMLButtonElement>(null)
    const morePanelRef = useRef<HTMLDivElement>(null)
    const pickMorePanel = useCallback(
      () => morePanelRef.current,
      [],
    )
    const moreMenuEstimateH = 170
    const {
      openUpward: morePopoverUp,
      shiftX: morePopoverShiftX,
    } = useContainedViewportPopoverPlacement(
      moreOpen,
      moreMenuAnchorRef,
      viewportRef,
      moreMenuEstimateH,
      pickMorePanel,
      'right',
    )

    useEffect(() => {
      if (!moreOpen && !alignOpen) return
      const onDown = (e: MouseEvent) => {
        const t = e.target as Node
        if (moreWrapRef.current?.contains(t)) return
        setMoreOpen(false)
        setAlignOpen(false)
      }
      document.addEventListener('mousedown', onDown)
      return () => document.removeEventListener('mousedown', onDown)
    }, [moreOpen, alignOpen])

    return (
      <div
        ref={ref}
        className="pointer-events-auto z-[35]"
        style={{
          position: 'absolute',
          transform:
            placement === 'above'
              ? 'translate(-50%, calc(-100% - 10px))'
              : 'translate(-50%, 10px)',
          ...style,
        }}
      >
        <FloatingToolbarShell role="toolbar" aria-label="Element actions">
          <button
            type="button"
            className={floatingToolbarIconButton(false)}
            title="Duplicate"
            aria-label="Duplicate"
            onClick={onDuplicate}
          >
            <HugeiconsIcon icon={Layers01Icon} size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className={floatingToolbarIconButton(locked)}
            title={locked ? 'Unlock' : 'Lock'}
            aria-label={locked ? 'Unlock' : 'Lock'}
            aria-pressed={locked}
            onClick={onToggleLock}
          >
            <HugeiconsIcon
              icon={locked ? SquareLock01Icon : SquareUnlock01Icon}
              size={18}
              strokeWidth={1.75}
            />
          </button>
          <button
            type="button"
            className={floatingToolbarIconButton(false)}
            title="Delete"
            aria-label="Delete"
            onClick={onDelete}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={1.75} />
          </button>
          <FloatingToolbarDivider />
          <div ref={moreWrapRef} className="relative flex items-center pr-1">
            <button
              ref={moreMenuAnchorRef}
              type="button"
              className={floatingToolbarIconButton(moreOpen)}
              title="More options"
              aria-label="More options"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => {
                setMoreOpen((o) => !o)
                setAlignOpen(false)
              }}
            >
              <HugeiconsIcon icon={More01Icon} size={18} strokeWidth={1.75} />
            </button>
            {moreOpen ? (
              <div
                ref={morePanelRef}
                role="menu"
                className={[
                  'absolute right-0 z-[60] min-w-[11rem] py-1',
                  morePopoverUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
                  floatingToolbarPopoverClass,
                ].join(' ')}
                style={{
                  transform:
                    morePopoverShiftX !== 0
                      ? `translateX(${morePopoverShiftX}px)`
                      : undefined,
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-neutral-800 hover:bg-black/[0.05]"
                  onClick={() => {
                    onCopy()
                    setMoreOpen(false)
                  }}
                >
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    size={18}
                    strokeWidth={1.75}
                    className="shrink-0 text-neutral-600"
                  />
                  Copy
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-neutral-800 hover:bg-black/[0.05]"
                  onClick={() => {
                    void onPaste()
                    setMoreOpen(false)
                  }}
                >
                  <HugeiconsIcon
                    icon={FilePasteIcon}
                    size={18}
                    strokeWidth={1.75}
                    className="shrink-0 text-neutral-600"
                  />
                  Paste
                </button>
                <div className="my-1 h-px bg-black/[0.06]" aria-hidden />
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] font-medium text-neutral-800 hover:bg-black/[0.05]"
                    aria-expanded={alignOpen}
                    onClick={() => setAlignOpen((a) => !a)}
                  >
                    <span>Align to page</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      strokeWidth={1.75}
                      className={`shrink-0 transition-transform ${alignOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {alignOpen ? (
                    <div
                      role="menu"
                      className={[
                        'absolute left-full top-0 z-[61] ml-1.5 min-w-[11rem] py-1',
                        floatingToolbarPopoverClass,
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        disabled={alignAlreadySatisfied.left}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-neutral-800 hover:bg-black/[0.05] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                        onClick={() => {
                          onAlign('left')
                          setAlignOpen(false)
                          setMoreOpen(false)
                        }}
                      >
                        <HugeiconsIcon
                          icon={AlignLeftIcon}
                          size={16}
                          strokeWidth={1.75}
                          className="text-neutral-600"
                        />
                        Left
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={alignAlreadySatisfied.centerH}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-neutral-800 hover:bg-black/[0.05] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                        onClick={() => {
                          onAlign('centerH')
                          setAlignOpen(false)
                          setMoreOpen(false)
                        }}
                      >
                        <HugeiconsIcon
                          icon={AlignHorizontalCenterIcon}
                          size={16}
                          strokeWidth={1.75}
                          className="text-neutral-600"
                        />
                        Center horizontally
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={alignAlreadySatisfied.right}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-neutral-800 hover:bg-black/[0.05] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                        onClick={() => {
                          onAlign('right')
                          setAlignOpen(false)
                          setMoreOpen(false)
                        }}
                      >
                        <HugeiconsIcon
                          icon={AlignRightIcon}
                          size={16}
                          strokeWidth={1.75}
                          className="text-neutral-600"
                        />
                        Right
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={alignAlreadySatisfied.top}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-neutral-800 hover:bg-black/[0.05] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                        onClick={() => {
                          onAlign('top')
                          setAlignOpen(false)
                          setMoreOpen(false)
                        }}
                      >
                        <HugeiconsIcon
                          icon={AlignTopIcon}
                          size={16}
                          strokeWidth={1.75}
                          className="text-neutral-600"
                        />
                        Top
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={alignAlreadySatisfied.centerV}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-neutral-800 hover:bg-black/[0.05] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                        onClick={() => {
                          onAlign('centerV')
                          setAlignOpen(false)
                          setMoreOpen(false)
                        }}
                      >
                        <HugeiconsIcon
                          icon={AlignVerticalCenterIcon}
                          size={16}
                          strokeWidth={1.75}
                          className="text-neutral-600"
                        />
                        Center vertically
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={alignAlreadySatisfied.bottom}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-neutral-800 hover:bg-black/[0.05] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                        onClick={() => {
                          onAlign('bottom')
                          setAlignOpen(false)
                          setMoreOpen(false)
                        }}
                      >
                        <HugeiconsIcon
                          icon={AlignBottomIcon}
                          size={16}
                          strokeWidth={1.75}
                          className="text-neutral-600"
                        />
                        Bottom
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </FloatingToolbarShell>
      </div>
    )
  },
)

export default CanvasElementToolbar
