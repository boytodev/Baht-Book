import Link from "next/link";
import { getCategories, getMonthTransactions, summarize } from "@/lib/data";
import {
  currentMonth,
  formatBalance,
  formatBaht,
  isValidMonth,
  todayInBangkok,
} from "@/lib/format";
import { CategoryBars } from "@/components/Bars";
import { IconArrowDown, IconArrowUp, IconPlus } from "@/components/icons";
import { MonthPicker } from "@/components/MonthPicker";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";

type Props = { searchParams: Promise<{ m?: string }> };

export default async function OverviewPage({ searchParams }: Props) {
  const { m } = await searchParams;
  const month = isValidMonth(m) ? m : currentMonth();

  const [categories, txs] = await Promise.all([getCategories(), getMonthTransactions(month)]);
  const s = summarize(month, txs);
  const recent = txs.slice(0, 8);
  const rate = Math.max(0, Math.min(100, s.savingRate));

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">ภาพรวม</h1>
        <MonthPicker month={month} basePath="/" />
      </div>

      <section className="summary" aria-label="สรุปภาพรวม">
        <div className="hero">
          <div className="hero-label">ยอดคงเหลือเดือนนี้</div>
          <div className="hero-value num">฿ {formatBalance(s.balance)}</div>
          <div className="hero-note only-desktop">รายรับ − รายจ่าย</div>
          <div className="hero-split">
            <div>
              <small>
                <IconArrowUp size={14} /> รายรับ
              </small>
              <strong className="num" style={{ color: "var(--hero-income)" }}>
                {formatBaht(s.income)}
              </strong>
            </div>
            <div>
              <small>
                <IconArrowDown size={14} /> รายจ่าย
              </small>
              <strong className="num" style={{ color: "var(--hero-expense)" }}>
                {formatBaht(s.expense)}
              </strong>
            </div>
          </div>
        </div>

        <div className="stat only-desktop">
          <div className="stat-label">
            <span className="badge badge-income">
              <IconArrowUp size={18} />
            </span>
            รายรับ
          </div>
          <div className="stat-value income-text num">฿ {formatBaht(s.income)}</div>
        </div>
        <div className="stat only-desktop">
          <div className="stat-label">
            <span className="badge badge-expense">
              <IconArrowDown size={18} />
            </span>
            รายจ่าย
          </div>
          <div className="stat-value expense-text num">฿ {formatBaht(s.expense)}</div>
        </div>
        <div className="stat only-desktop">
          <div className="stat-label">อัตราการออม</div>
          <div className="stat-value num">{s.savingRate}%</div>
          <div
            className="meter"
            role="img"
            aria-label={`อัตราการออม ${s.savingRate}%`}
          >
            <span style={{ width: `${rate}%` }} />
          </div>
          <div className="stat-note">ของรายรับที่เหลือเก็บ</div>
        </div>
      </section>

      <section className="quick-add only-mobile" aria-label="เพิ่มรายการ">
        <Link href="/add?type=income" className="btn btn-income">
          <IconPlus size={18} /> รายรับ
        </Link>
        <Link href="/add?type=expense" className="btn btn-expense">
          <IconPlus size={18} /> รายจ่าย
        </Link>
      </section>

      <div className="grid-main">
        <div className="col-side">
          <div className="only-desktop">
            <TransactionForm categories={categories} defaultDate={todayInBangkok()} />
          </div>
          <section className="panel" aria-label="รายจ่ายแยกตามหมวด">
            <h2>รายจ่ายแยกตามหมวด</h2>
            <CategoryBars items={s.byCategory} limit={5} />
          </section>
        </div>

        <section className="col-main panel" aria-label="รายการล่าสุด">
          <div className="page-head">
            <h2>รายการล่าสุด</h2>
            <Link href="/transactions" className="chip chip-ghost">
              ดูทั้งหมด
            </Link>
          </div>
          <TransactionList rows={recent} />
        </section>
      </div>
    </>
  );
}
