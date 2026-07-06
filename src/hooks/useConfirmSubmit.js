import { useState } from "react"
import { useTranslation } from "react-i18next"

// ponytail: wraps RHF form.handleSubmit with a confirm modal.
// Every submit goes through confirm modal before firing.
export function useConfirmSubmit(form, onConfirm) {
  const { t } = useTranslation()
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
    title: overrides.title || t("common.confirmSave"),
    description: overrides.description || t("common.confirmSaveDesc"),
    confirmText: overrides.confirmText || t("common.yesSave"),
    onConfirm: handleConfirm
  })

  return { handleSubmit, confirmModal }
}
