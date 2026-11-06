import "server-only";
import { createClient } from "@/lib/supabase/server";
import { monthRange } from "@/lib/format";
import type { Category, MonthSummary, Transaction, TxType } from "@/lib/types";

/** รายการทั้งหมดของเดือน เรียงใหม่สุดก่อน */
export async function getMonthTransactions(month: string): Promise<Transaction[]> {
  const supabase = await createClient();
  const { start, end } = monthRange(month);

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, amount, note, occurred_on, category_id, categories(name)")
    .gte("occurred_on", start)
    .lte("occurred_on", end)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`โหลดรายการไม่สำเร็จ: ${error.message}`);
  return (data ?? []) as unknown as Transaction[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`โหลดหมวดหมู่ไม่สำเร็จ: ${error.message}`);
  return (data ?? []) as Category[];
}

export function categoryName(tx: Transaction): string {
  return tx.categories?.name ?? "ไม่ระบุหมวด";
}

/** สรุปยอดของเดือน คำนวณจากรายการที่ดึงมา */
export function summarize(month: string, txs: Transaction[]): MonthSummary {
  const { days } = monthRange(month);
  let income = 0;
  let expense = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  const catSums = new Map<string, number>();
  const daySums = new Map<string, number>();

  for (const tx of txs) {
    if (tx.type === "income") {
      income += tx.amount;
      incomeCount += 1;
    } else {
      expense += tx.amount;
      expenseCount += 1;
      const name = categoryName(tx);
      catSums.set(name, (catSums.get(name) ?? 0) + tx.amount);
      daySums.set(tx.occurred_on, (daySums.get(tx.occurred_on) ?? 0) + tx.amount);
    }
  }

  const byCategory = [...catSums.entries()]
    .map(([name, amount]) => ({
      name,
      amount,
      pct: expense > 0 ? Math.round((amount / expense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const byDay = Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const date = `${month}-${String(day).padStart(2, "0")}`;
    return { date, day, amount: daySums.get(date) ?? 0 };
  });

  const topExpenses = txs
    .filter((t) => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const balance = income - expense;
  return {
    income,
    expense,
    balance,
    savingRate: income > 0 ? Math.round((balance / income) * 100) : 0,
    incomeCount,
    expenseCount,
    byCategory,
    byDay,
    topExpenses,
  };
}

export type { TxType };
