import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import { todayInBangkok } from "@/lib/format";
import { IconChevronLeft } from "@/components/icons";
import { TransactionForm } from "@/components/TransactionForm";

export const metadata: Metadata = { title: "เพิ่มรายการ" };

type Props = { searchParams: Promise<{ type?: string }> };

export default async function AddPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const categories = await getCategories();

  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <div className="page-head" style={{ justifyContent: "flex-start" }}>
        <Link href="/" className="back-link" aria-label="ย้อนกลับ">
          <IconChevronLeft size={20} />
        </Link>
        <h1 className="page-title">เพิ่มรายการ</h1>
      </div>
      <TransactionForm
        categories={categories}
        defaultDate={todayInBangkok()}
        defaultType={type === "income" ? "income" : "expense"}
        redirectHome
        heading="รายละเอียดรายการ"
      />
    </div>
  );
}
