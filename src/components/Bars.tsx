import { formatBaht } from "@/lib/format";
import type { CategoryTotal, DayTotal } from "@/lib/types";

export function CategoryBars({
  items,
  limit,
}: {
  items: CategoryTotal[];
  limit?: number;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  if (shown.length === 0) {
    return <div className="empty">ยังไม่มีรายจ่ายในเดือนนี้</div>;
  }
  return (
    <div className="bar-list">
      {shown.map((item) => (
        <div className="bar-item" key={item.name}>
          <div className="bar-head">
            <span style={{ fontWeight: 500 }}>{item.name}</span>
            <span className="num">
              ฿ {formatBaht(item.amount)} · {item.pct}%
            </span>
          </div>
          <div
            className="bar-track"
            role="img"
            aria-label={`${item.name} ${item.pct}% ของรายจ่าย`}
          >
            <div className="bar-fill" style={{ width: `${item.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompareBar({
  label,
  amount,
  max,
  kind,
}: {
  label: string;
  amount: number;
  max: number;
  kind: "income" | "expense";
}) {
  const pct = max > 0 ? Math.round((amount / max) * 100) : 0;
  return (
    <div className="bar-item">
      <div className="bar-head">
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span
          className={`num ${kind === "income" ? "income-text" : "expense-text"}`}
          style={{ fontWeight: 600 }}
        >
          ฿ {formatBaht(amount)}
        </span>
      </div>
      <div className="bar-track thick" role="img" aria-label={`${label} ${pct}% ของค่าสูงสุด`}>
        <div className={`bar-fill ${kind}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DailyBars({ days }: { days: DayTotal[] }) {
  const max = Math.max(1, ...days.map((d) => d.amount));
  return (
    <div className="daybars" role="list" aria-label="รายจ่ายรายวัน">
      {days.map((d) => (
        <div
          key={d.date}
          className="daybar"
          role="listitem"
          title={`วันที่ ${d.day}: ฿ ${formatBaht(d.amount)}`}
        >
          <div
            className="daybar-fill"
            style={{ height: `${Math.max(2, Math.round((d.amount / max) * 150))}px`, opacity: d.amount ? 1 : 0.25 }}
          />
          <span className="daybar-label num">{d.day}</span>
        </div>
      ))}
    </div>
  );
}
