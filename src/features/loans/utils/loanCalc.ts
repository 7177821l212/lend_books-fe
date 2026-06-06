/**
 * Pure functions for loan terms preview. Mirrors `loan_terms.py` on the BE.
 *
 * Schedule split semantics — must match `split_installment` on the backend:
 *   base = floor(repayable / n)
 *   remainder = repayable - base * n
 *   first `remainder` rows carry `base + 1`; the rest carry `base`.
 *
 * The UI exposes both values so users see exactly what the schedule will look
 * like (`X for the first R installments, Y for the rest`).
 */
import type { InterestType, LendingModel } from '@/types';

export interface LoanPreview {
  interestAmount: number;
  disbursed: number;
  repayable: number;
  profit: number;
  /** Floor amount most rows carry — matches BE `installment_amount`. */
  installmentBase: number;
  /** Largest single-row amount — `base + 1` when `remainder > 0`, else `base`. */
  installmentMax: number;
  /** How many rows carry `installmentMax`. */
  highRows: number;
  valid: boolean;
  error?: string;
}

export function previewLoan(input: {
  principal: number;
  interestType: InterestType;
  interestValue: number;
  lendingModel: LendingModel;
  installments: number;
}): LoanPreview {
  const { principal, interestType, interestValue, lendingModel, installments } = input;

  if (!Number.isFinite(principal) || principal <= 0) {
    return _empty('Principal must be positive');
  }
  if (!Number.isFinite(interestValue) || interestValue < 0) {
    return _empty('Interest cannot be negative');
  }
  if (interestType === 'pct' && (interestValue < 0 || interestValue > 100)) {
    return _empty('Percentage must be 0–100');
  }
  if (!Number.isFinite(installments) || installments <= 0) {
    return _empty('Installments must be positive');
  }

  const interestAmount =
    interestType === 'pct'
      ? Math.round((principal * interestValue) / 100)
      : Math.round(interestValue);

  if (lendingModel === 'model_a' && interestAmount >= principal) {
    return _empty('Interest cannot exceed principal in Model A');
  }

  const disbursed = lendingModel === 'model_a' ? principal - interestAmount : principal;
  const repayable = lendingModel === 'model_a' ? principal : principal + interestAmount;

  // Match BE: base = floor(repayable / n), remainder distributes to first rows.
  const installmentBase = Math.floor(repayable / installments);
  const remainder = repayable - installmentBase * installments;
  const installmentMax = remainder > 0 ? installmentBase + 1 : installmentBase;

  return {
    interestAmount,
    disbursed,
    repayable,
    profit: interestAmount,
    installmentBase,
    installmentMax,
    highRows: remainder,
    valid: true,
  };
}

function _empty(error: string): LoanPreview {
  return {
    interestAmount: 0,
    disbursed: 0,
    repayable: 0,
    profit: 0,
    installmentBase: 0,
    installmentMax: 0,
    highRows: 0,
    valid: false,
    error,
  };
}
