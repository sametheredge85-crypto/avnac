import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import type { AvnacVectorBoardMeta } from '../lib/avnac-vector-boards-storage'
import { editorSidebarPanelTopClass } from '../lib/editor-sidebar-panel-layout'

type Props = {
  open: boolean
  onClose: () => void
  boards: AvnacVectorBoardMeta[]
  onCreateNew: () => void
  onOpenBoard: (id: string) => void
}

export default function EditorVectorBoardPanel({
  open,
  onClose,
  boards,
  onCreateNew,
  onOpenBoard,
}: Props) {
  if (!open) return null

  return (
    <div
      data-avnac-chrome
      className={[
        'pointer-events-auto fixed left-[5.75rem] z-40 flex w-[min(100vw-1.5rem,280px)] flex-col overflow-hidden rounded-3xl border border-black/[0.08] bg-white/95 backdrop-blur-md',
        editorSidebarPanelTopClass,
      ].join(' ')}
      role="dialog"
      aria-label="Vector boards"
    >
      <div className="flex items-center justify-between border-b border-black/[0.06] px-3 py-2">
        <span className="text-sm font-semibold text-neutral-800">
          Vector boards
        </span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-black/[0.06]"
          onClick={onClose}
          aria-label="Close vector boards"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.75} />
        </button>
      </div>
      <div className="flex max-h-[min(50vh,320px)] flex-col gap-2 overflow-auto p-2">
        {boards.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-neutral-500">
            No vector boards yet. Create one to work on a larger canvas.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {boards.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm text-neutral-800 transition-colors hover:bg-black/[0.04]"
                  onClick={() => onOpenBoard(b.id)}
                >
                  <span className="truncate font-medium">{b.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-black/[0.06] p-2">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          onClick={onCreateNew}
        >
          <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={1.75} />
          New vector board
        </button>
      </div>
    </div>
  )
}
