import { Dispatch, SetStateAction } from 'react';

export interface ExpenseProps {
  id: number;
  fatture_expense_id: number;
  invoice_number: string;
  trainer_order_id: number | null;
  role_type: string;
  type: ExpenseFilterType;
  description: string;
  amount_due_discount: number;
  is_marked: false;
  entity_id: number;
  name: string;
  address_street: string;
  address_postal_code: string;
  address_city: string;
  address_province: string;
  country: string;
  vat_number: string;
  tax_code: string;
  date: Date | string;
  is_marked_date: Date | string;
  status: PaymentStatusType;
  next_due_date: Date | string;
  due_date: Date | string;
  payment_date: Date | string;
  amount_net: number;
  amount_vat: number;
  amount_gross: number;
  created_by: null;
  updated_by: null;
  deleted_by: null;
  slug: string;
  notes: string;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string;
  order: orderType[];
}

export interface orderType {
  order_number: string;
  id: number;
}
export interface TrainerOrderProps {
  order_number: string;
  trainer_id: number;
  id: number;
}
export enum ExpenseFilterType {
  travelExpenses = 'travel expenses',
  material = 'material',
  trainers = 'trainers',
  meetingRooms = 'meeting rooms',
  equipment = 'equipment',
}

export interface expenseProps {
  category: string[];
  name: string[];
}

export interface FilterExpenseProps {
  setFilterModal: Dispatch<SetStateAction<boolean>>;
  setExpenseFilters: Dispatch<SetStateAction<expenseProps>>;
  expenseFilters: expenseProps;
}

export interface ExpenseUpdateProps {
  notes?: string;
  role_type?: ExpenseFilterType;
  trainerOrder?: number | null;
  slug?: string;
  date?: Date | string;
  invoice_number?: string;
  payment_date?: Date | string;
}

export enum PaymentStatusType {
  paid = 'paid',
  unpaid = 'unpaid',
}
