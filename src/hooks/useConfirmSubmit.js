import { useState } from "react"

// ponytail: wraps RHF form.handleSubmit with a confirm modal.
// Every submit goes through "Apakah data sudah benar?" before firing.
export function useConfirmSubmit(form, onConfirm) {
  const [open, setOpen] = useState(false)

  const handleSubmit = form.handleSubmit(() => setOpen(true))

  const handleConfirm = () => {
    setOpen(false)
    onConfirm(form.getValues())
  }

  const confirmModal = (overrides = {}) => ({
    type: "confirm",
    open,
    onOpenChange: setOpen,
    title: overrides.title || "Konfirmasi Simpan",
    description: overrides.description || "Apakah data sudah benar dan akan disimpan?",
    confirmText: overrides.confirmText || "Ya, Simpan",
    onConfirm: handleConfirm
  })

  return { handleSubmit, confirmModal }
}
