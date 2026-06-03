/**
 * Pure functions for loan terms preview. Mirrors `loan_terms.py` on the BE.
 */
import type { InterestType, LendingModel } from '@/types';

export interface LoanPreview {
  interestAmount: number;
  disbursed: number;
  repayable: number;
  profit: number;
  installmentAmount: number;
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
  const installmentAmount = Math.ceil(repayable / installments);

  return {
    interestAmount,
    disbursed,
    repayable,
    profit: interestAmount,
    installmentAmount,
    valid: true,
  };
}

function _empty(error: string): LoanPreview {
  return {
    interestAmount: 0,
    disbursed: 0,
    repayable: 0,
    profit: 0,
    installmentAmount: 0,
    valid: false,
    error,
  };
}
