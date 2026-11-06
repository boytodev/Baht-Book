import type { Metadata } from "next";
import Link from "next/link";
import { getMonthTransactions } from "@/lib/data";
import {
  currentMonth,
  formatBalance,
  formatDateThai,
  isValidMonth,
} from "@/lib/format";
import { IconPlus } from "@/components/icons";
import { MonthPicker } from "@/components/MonthPicker";
import { TransactionList } from "@/components/TransactionList";
import type { Transaction } from "@/lib/types";

export const metadata: Metadata = { title: "รายการ" };

type Props = { searchParams: Promise<{ m?: string; type?: string }> };

const TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "income", label: "รายรับ" },
  { key: "expense", label: "รายจ่าย" },
] as const;

export default async function TransactionsPage({ searchParams }: Props) {
  const { m, type } = await searchParams;
  const month = isValidMonth(m) ? m : currentMonth();
  const filter = type === "income" || type === "expense" ? type : "all";

  const all = await getMonthTransactions(month);
  const counts = {
    all: all.length,
    income: all.filter((t) => t.type === "income").length,
    expense: all.filter((t) => t.type === "expense").length,
  };
  const rows = filter === "all" ? all : all.filter((t) => t.type === filter);

  // จัดกลุ่มตามวัน (รายการเรียงใหม่สุดก่อนอยู่แล้ว)
  const groups: { date: string; items: Transaction[]; net: number }[] = [];
  for (const tx of rows) {
    let g = groups[groups.length - 1];
    if (!g || g.date !== tx.occurred_on) {
      g = { date: tx.occurred_on, items: [], net: 0 };
      groups.push(g);
    }
    g.items.push(tx);
    g.net += tx.type === "income" ? tx.amount : -tx.amount;
  }

  const tabHref = (key: string) => {
    const p = new URLSearchParams();
    if (month !== currentMonth()) p.set("m", month);
    if (key !== "all") p.set("type", key);
    const qs = p.toString();
    return qs ? `/transactions?${qs}` : "/transactions";
  };

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">รายการ</h1>
        <div className="topbar-right">
          <MonthPicker
            month={month}
            basePath="/transactions"
            extra={{ type: filter === "all" ? undefined : filter }}
          />
          <Link href="/add" className="btn" style={{ minHeight: 44 }}>
            <IconPlus size={18} /> เพิ่มรายการ
          </Link>
        </div>
      </div>

      <nav className="tabs" aria-label="กรองประเภทรายการ">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className="chip"
            aria-current={filter === t.key ? "true" : undefined}
            scroll={false}
          >
            {t.label} · {counts[t.key]}
          </Link>
        ))}
      </nav>

      {groups.length === 0 ? (
        <div className="panel">
          <div className="empty">ยังไม่มีรายการในเดือนนี้</div>
        </div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {groups.map((g) => (
            <section key={g.date} className="stack" style={{ gap: 8 }}>
              <div className="tx-group-head">
                <strong>{formatDateThai(g.date)}</strong>
                <span className="num">
                  สุทธิ {g.net >= 0 ? "+" : ""}
                  {formatBalance(g.net)}
                </span>
              </div>
              <div className="panel" style={{ padding: "0 16px", gap: 0 }}>
                <TransactionList rows={g.items} />
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
