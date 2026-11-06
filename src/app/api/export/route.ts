import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function csvCell(value: string): string {
  // กันสูตรใน Excel/Sheets (CSV injection) และใส่เครื่องหมายคำพูดเมื่อจำเป็น
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("occurred_on, type, amount, note, categories(name)")
    .order("occurred_on", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return new Response("Export failed", { status: 500 });
  }

  const header = ["วันที่", "ประเภท", "หมวดหมู่", "จำนวนเงิน (บาท)", "บันทึก"];
  const rows = (data ?? []).map((r) => {
    const cat = (r.categories as unknown as { name: string } | null)?.name ?? "";
    return [
      r.occurred_on,
      r.type === "income" ? "รายรับ" : "รายจ่าย",
      cat,
      (r.amount / 100).toFixed(2),
      r.note ?? "",
    ]
      .map((c) => csvCell(String(c)))
      .join(",");
  });

  // ใส่ BOM เพื่อให้ Excel อ่านภาษาไทยถูกต้อง
  const body = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n") + "\r\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="samut-ngoen.csv"',
      "Cache-Control": "no-store",
    },
  });
}
