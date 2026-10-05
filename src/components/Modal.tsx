import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button, IconButton } from './Button'
import { XIcon } from './Icons'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Bottom sheet on mobile, centered dialog on larger screens. Built on <dialog> for focus trap + Esc. */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto w-full max-w-none rounded-t-3xl border border-line bg-surface p-0 text-fg backdrop:bg-black/70 sm:m-auto sm:max-w-md sm:rounded-3xl"
    >
      {open && (
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id={titleId} className="font-display text-2xl font-bold uppercase">
              {title}
            </h2>
            <IconButton label="Fechar" onClick={onClose}>
              <XIcon />
            </IconButton>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  onClose: () => void
  /** Destructive actions are red; neutral confirmations use the brand color */
  tone?: 'danger' | 'primary'
  cancelLabel?: string
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Excluir',
  onConfirm,
  onClose,
  tone = 'danger',
  cancelLabel = 'Cancelar',
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)
  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="text-muted">{message}</div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={tone} onClick={handleConfirm} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
