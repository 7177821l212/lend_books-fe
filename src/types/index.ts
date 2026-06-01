export type UserRole = 'investor' | 'collector';
export type LoanStatus = 'active' | 'overdue' | 'closed';
export type InstallmentStatus = 'pending' | 'due_today' | 'overdue' | 'paid';
export type PaymentMode = 'CASH' | 'UPI' | 'BANK';
export type RiskLevel = 'low' | 'medium' | 'high';
export type RepaymentFrequency = 'daily' | 'weekly' | 'monthly';
export type LendingModel = 'model_a';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  investor_id: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string | null;
  risk_level: RiskLevel;
  is_blacklisted: boolean;
  active_loan_count: number;
  total_outstanding: number;
}

export interface Installment {
  id: string;
  sequence: number;
  due_date: string;
  amount: number;
  status: InstallmentStatus;
}

export interface Loan {
  id: string;
  customer_id: string;
  customer_name: string;
  collector_id: string;
  collector_name: string;
  principal: number;
  interest_rate: number;
  lending_model: LendingModel;
  repayment_frequency: RepaymentFrequency;
  total_installments: number;
  installment_amount: number;
  start_date: string;
  status: LoanStatus;
  outstanding: number;
  repaid: number;
  repaid_pct: number;
  installments?: Installment[];
}

export interface Payment {
  id: string;
  loan_id: string;
  collector_id: string;
  amount: number;
  mode: PaymentMode;
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
