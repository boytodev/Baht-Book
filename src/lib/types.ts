export type TxType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TxType;
};

export type Transaction = {
  id: string;
  type: TxType;
  /** จำนวนเงินเป็นสตางค์ */
  amount: number;
  note: string | null;
  occurred_on: string; // YYYY-MM-DD
  category_id: string | null;
  categories: { name: string } | null;
};

export type CategoryTotal = {
  name: string;
  amount: number;
  pct: number;
};

export type DayTotal = {
  date: string;
  day: number;
  amount: number;
};

export type MonthSummary = {
  income: number;
  expense: number;
  balance: number;
  /** อัตราการออม เป็นเปอร์เซ็นต์ (0 ถ้าไม่มีรายรับ) */
  savingRate: number;
  incomeCount: number;
  expenseCount: number;
  byCategory: CategoryTotal[];
  byDay: DayTotal[];
  topExpenses: Transaction[];
};
