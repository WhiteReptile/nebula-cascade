"use client";

import { creditConfirmCopy, type CreditConfirmState } from "@/lib/hybrid-credits";

export function CreditConfirmModal({
  open,
  state,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  state: CreditConfirmState | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open || !state) return null;
  const enough = state.balance >= state.cost && state.balance > 0;
  const copy = creditConfirmCopy(state);

  return (
    <div
      className="pdf-need-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credit-confirm-title"
    >
      <div className="pdf-need-card cosmic-glass">
        <p id="credit-confirm-title" className="label-white text-[10px] mb-3">
          Hybrid credits
        </p>
        <p className="text-white text-sm leading-relaxed mb-6">{copy}</p>
        <div className="flex justify-end gap-3">
          <button type="button" className="text-dynamic text-sm px-3 py-2" onClick={onCancel}>
            Cancel
          </button>
          {enough ? (
            <button type="button" className="cosmic-cta text-sm px-8 py-2.5" onClick={onConfirm}>
              Submit
            </button>
          ) : (
            <a href="/pricing" className="cosmic-cta text-sm px-8 py-2.5">
              Open Pricing
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
