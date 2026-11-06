const MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const MONTHS_LONG = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

/** สตางค์ → บาท เช่น 8500 → "85", 123456 → "1,234.56" */
export function formatBaht(satang: number): string {
  const baht = satang / 100;
  return baht.toLocaleString("th-TH", {
    minimumFractionDigits: Number.isInteger(baht) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** ยอดคงเหลือ (ติดลบได้) เช่น 18,421 หรือ −1,200 */
export function formatBalance(satang: number): string {
  return (satang < 0 ? "−" : "") + formatBaht(Math.abs(satang));
}

/** ตัวเลขมีเครื่องหมาย เช่น +38,000 หรือ −8,500 */
export function formatSigned(satang: number, type: "income" | "expense"): string {
  return (type === "income" ? "+" : "−") + formatBaht(satang);
}

/** ข้อความผู้ใช้ → สตางค์ (จำนวนเต็ม) คืน null ถ้าไม่ถูกต้อง */
export function parseBahtToSatang(input: string): number | null {
  const cleaned = input.replace(/[,\s฿]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const satang = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(satang) || satang <= 0) return null;
  return satang;
}

/** "2026-11-04" → "4 พ.ย." */
export function formatDayMonth(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

/** "2026-11-04" → "4 พ.ย. 2569" */
export function formatDateThai(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y + 543}`;
}

/** "2026-11" → "พฤศจิกายน 2569" */
export function formatMonthThai(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS_LONG[m - 1]} ${y + 543}`;
}

/** "2026-11" → "พ.ย. 2569" */
export function formatMonthShortThai(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${y + 543}`;
}

// ---- เดือนและวันที่ (ใช้เขตเวลาไทย เพื่อไม่ให้วันที่เพี้ยนตอนใกล้เที่ยงคืน) ----

export function todayInBangkok(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
}

export function currentMonth(): string {
  return todayInBangkok().slice(0, 7);
}

export function isValidMonth(value: string | undefined): value is string {
  return !!value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthRange(month: string): { start: string; end: string; days: number } {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return {
    start: `${month}-01`,
    end: `${month}-${String(days).padStart(2, "0")}`,
    days,
  };
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
