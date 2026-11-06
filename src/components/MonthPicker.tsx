import Link from "next/link";
import {
  currentMonth,
  formatMonthShortThai,
  formatMonthThai,
  shiftMonth,
} from "@/lib/format";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

type Props = {
  month: string;
  basePath: string;
  /** พารามิเตอร์อื่นที่ต้องคงไว้ เช่น type */
  extra?: Record<string, string | undefined>;
};

function href(basePath: string, month: string, extra?: Props["extra"]) {
  const params = new URLSearchParams();
  if (month !== currentMonth()) params.set("m", month);
  for (const [k, v] of Object.entries(extra ?? {})) if (v) params.set(k, v);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function MonthPicker({ month, basePath, extra }: Props) {
  const isCurrent = month >= currentMonth();
  return (
    <div className="monthpick">
      <Link
        href={href(basePath, shiftMonth(month, -1), extra)}
        aria-label="เดือนก่อนหน้า"
        scroll={false}
      >
        <IconChevronLeft size={18} />
      </Link>
      <span>
        <span className="only-desktop">{formatMonthThai(month)}</span>
        <span className="only-mobile">{formatMonthShortThai(month)}</span>
      </span>
      {isCurrent ? (
        <span
          aria-hidden="true"
          style={{ width: 44, height: 44, display: "inline-block", opacity: 0.3 }}
        />
      ) : (
        <Link
          href={href(basePath, shiftMonth(month, 1), extra)}
          aria-label="เดือนถัดไป"
          scroll={false}
        >
          <IconChevronRight size={18} />
        </Link>
      )}
    </div>
  );
}
