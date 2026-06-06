export type UserRole = 'investor' | 'collector';
export type LoanStatus = 'active' | 'overdue' | 'closed' | 'cancelled';
export type InstallmentStatus =
  | 'pending'
  | 'due_today'
  | 'overdue'
  | 'paid'
  | 'partial'
  | 'missed';
export type PaymentMode = 'CASH' | 'UPI' | 'BANK';
export type RiskLevel = 'low' | 'medium' | 'high';
export type RepaymentFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'half_yearly'
  | 'yearly'
  | 'custom';
export type LendingModel = 'model_a' | 'model_b';
export type InterestType = 'pct' | 'fixed';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string | null;
  risk_level: RiskLevel;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  active_loan_count: number;
  total_outstanding: number;
}

export interface Installment {
  id: string;
  sequence: number;
  due_date: string;
  due_amount: number;
  paid_amount: number;
  status: InstallmentStatus;
}

export interface Loan {
  id: string;
  customer_id: string;
  customer_name: string;
  collector_id: string;
  collector_name: string;

  principal: number;
  interest_type: InterestType;
  interest_value: number;
  lending_model: LendingModel;

  disbursed: number;
  repayable: number;
  profit: number;

  repayment_frequency: RepaymentFrequency;
  total_installments: number;
  installment_amount: number;
  /** Largest single installment amount (= base+1 when remainder distributes a +1). */
  installment_amount_max: number;
  start_date: string;

  status: LoanStatus;
  outstanding: number;
  repaid: number;
  repaid_pct: number;
  paid_count: number;
  overdue_count: number;
  closed_at: string | null;

  installments?: Installment[];
}

export interface Payment {
  id: string;
  loan_id: string;
  schedule_id: string | null;
  collector_id: string;
  is_missed: boolean;
  missed_reason: string | null;
  amount: number;
  mode: PaymentMode | null;
  notes: string | null;
  proof_photo_url: string | null;
  collected_at: string;
}

export interface Collector {
  id: string;
  name: string;
  phone: string | null;
  status: 'active' | 'inactive';
  loan_count: number;
  total_collected: number;
  missed_count: number;
}

export interface PickupItem {
  loan_id: string;
  customer_name: string;
  customer_phone: string;
  location: string | null;
  amount: number;
  status: InstallmentStatus;
  installment_id: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}
