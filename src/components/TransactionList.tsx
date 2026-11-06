import { deleteTransaction } from "@/app/(app)/actions";
import { categoryName } from "@/lib/data";
import { formatDayMonth, formatSigned } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { IconArrowDown, IconArrowUp, IconTrash } from "@/components/icons";

export function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === "income";
  const cat = categoryName(tx);
  const title = tx.note || cat;
  const meta = tx.note
    ? `${cat} · ${formatDayMonth(tx.occurred_on)}`
    : formatDayMonth(tx.occurred_on);

  return (
    <div className="tx-row">
      <div className={`tx-icon ${tx.type}`}>
        {isIncome ? <IconArrowUp size={20} /> : <IconArrowDown size={20} />}
      </div>
      <div className="tx-body">
        <div className="tx-title">{title}</div>
        <div className="tx-meta">{meta}</div>
      </div>
      <div className={`tx-amount num ${isIncome ? "income-text" : "expense-text"}`}>
        {formatSigned(tx.amount, tx.type)}
      </div>
      <form action={deleteTransaction.bind(null, tx.id)}>
        <button type="submit" className="icon-btn" aria-label={`ลบรายการ ${title}`}>
          <IconTrash size={20} />
        </button>
      </form>
    </div>
  );
}

export function TransactionList({ rows }: { rows: Transaction[] }) {
  if (rows.length === 0) {
    return <div className="empty">ยังไม่มีรายการ</div>;
  }
  return (
    <div className="tx-list">
      {rows.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} />
      ))}
    </div>
  );
}
