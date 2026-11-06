import type { Metadata } from "next";
import { getMonthTransactions, summarize, categoryName } from "@/lib/data";
import {
  currentMonth,
  formatBaht,
  formatDayMonth,
  isValidMonth,
  monthRange,
  todayInBangkok,
} from "@/lib/format";
import { CategoryBars, CompareBar, DailyBars } from "@/components/Bars";
import { MonthPicker } from "@/components/MonthPicker";

export const metadata: Metadata = { title: "สถิติ" };

type Props = { searchParams: Promise<{ m?: string }> };

export default async function StatsPage({ searchParams }: Props) {
  const { m } = await searchParams;
  const month = isValidMonth(m) ? m : currentMonth();

  const txs = await getMonthTransactions(month);
  const s = summarize(month, txs);

  // เฉลี่ยต่อวัน: เดือนปัจจุบันนับถึงวันนี้ เดือนอื่นนับทั้งเดือน
  const { days } = monthRange(month);
  const elapsed =
    month === currentMonth() ? Number(todayInBangkok().slice(8, 10)) : days;
  const avgPerDay = elapsed > 0 ? Math.round(s.expense / elapsed) : 0;
  const biggest = s.topExpenses[0];
  const max = Math.max(s.income, s.expense);

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">สถิติ</h1>
        <MonthPicker month={month} basePath="/stats" />
      </div>

      <section className="summary" aria-label="ตัวเลขสำคัญ">
        <div className="stat">
          <div className="stat-label">รายจ่ายเฉลี่ยต่อวัน</div>
          <div className="stat-value expense-text num">฿ {formatBaht(avgPerDay)}</div>
          <div className="stat-note">จาก {elapsed} วัน</div>
        </div>
        <div className="stat">
          <div className="stat-label">รายจ่ายสูงสุดต่อรายการ</div>
          <div className="stat-value expense-text num">
            ฿ {biggest ? formatBaht(biggest.amount) : "0"}
          </div>
          <div className="stat-note">{biggest ? biggest.note || categoryName(biggest) : "ยังไม่มีรายจ่าย"}</div>
        </div>
        <div className="stat">
          <div className="stat-label">อัตราการออม</div>
          <div className="stat-value income-text num">{s.savingRate}%</div>
          <div className="stat-note">เก็บได้ ฿ {formatBaht(Math.max(0, s.balance))}</div>
        </div>
        <div className="stat">
          <div className="stat-label">จำนวนรายการ</div>
          <div className="stat-value num">{s.incomeCount + s.expenseCount}</div>
          <div className="stat-note">
            รายรับ {s.incomeCount} · รายจ่าย {s.expenseCount}
          </div>
        </div>
      </section>

      <div className="grid-main">
        <div className="col-main" style={{ flexBasis: 480, flexGrow: 3 }}>
          <div className="stack" style={{ gap: 24 }}>
            <section className="panel" aria-label="รายรับเทียบรายจ่าย">
              <h2>รายรับเทียบรายจ่าย</h2>
              <CompareBar label="รายรับ" amount={s.income} max={max} kind="income" />
              <CompareBar label="รายจ่าย" amount={s.expense} max={max} kind="expense" />
            </section>
            <section className="panel" aria-label="รายจ่ายรายวัน">
              <h2>รายจ่ายรายวัน</h2>
              <DailyBars days={s.byDay} />
            </section>
          </div>
        </div>

        <div className="col-side" style={{ flexBasis: 340, flexGrow: 2, maxWidth: "none" }}>
          <section className="panel" aria-label="รายจ่ายแยกตามหมวด">
            <h2>รายจ่ายแยกตามหมวด</h2>
            <CategoryBars items={s.byCategory} />
          </section>
        </div>
      </div>

      <section className="panel" aria-label="รายจ่ายสูงสุด" style={{ gap: 4 }}>
        <h2>รายจ่ายสูงสุด {s.topExpenses.length > 0 ? `${s.topExpenses.length} อันดับ` : ""}</h2>
        {s.topExpenses.length === 0 ? (
          <div className="empty">ยังไม่มีรายจ่ายในเดือนนี้</div>
        ) : (
          <div className="tx-list">
            {s.topExpenses.map((tx, i) => (
              <div className="tx-row" key={tx.id}>
                <div className="rank">{i + 1}</div>
                <div className="tx-body">
                  <div className="tx-title">{tx.note || categoryName(tx)}</div>
                  <div className="tx-meta">
                    {categoryName(tx)} · {formatDayMonth(tx.occurred_on)}
                  </div>
                </div>
                <div className="tx-amount expense-text num">
                  {"−"}
                  {formatBaht(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
