import { useEffect, type ReactNode } from "react";

import { CloseIcon } from "./Icons";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Oddiy modal oyna: Esc va fonni bosish bilan yopiladi, ochiq paytda sahifa scroll bo'lmaydi. */
export function Modal({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Yopish" className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <div className="page-in relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line-strong bg-panel p-6 shadow-soft sm:max-w-xl sm:rounded-3xl sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Yopish" className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-panel-2 hover:text-ink">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
