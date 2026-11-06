import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";
import { IconDownload } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "บัญชี" };

export default async function AccountPage() {
  const supabase = await createClient();
  const [{ data }, categories] = await Promise.all([
    supabase.auth.getUser(),
    getCategories(),
  ]);
  const email = data.user?.email ?? "";
  const initial = (email[0] ?? "?").toUpperCase();

  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <h1 className="page-title">บัญชี</h1>

      <section className="profile" aria-label="โปรไฟล์">
        <div className="avatar" aria-hidden="true">
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, overflowWrap: "anywhere" }}>{email}</div>
          <div style={{ fontSize: 13, color: "var(--hero-muted)" }}>เข้าสู่ระบบอยู่</div>
        </div>
      </section>

      <section className="stack" style={{ gap: 8 }} aria-label="การตั้งค่า">
        <div className="settings-title">การตั้งค่า</div>
        <div className="settings">
          <div className="setting-row">
            <div>
              <div>โหมดมืด</div>
              <div className="setting-sub">ใช้กับทุกหน้าในเบราว์เซอร์นี้</div>
            </div>
            <ThemeToggle />
          </div>
          <div className="setting-row">
            <span>สกุลเงิน</span>
            <span style={{ color: "var(--muted)" }}>บาท (฿)</span>
          </div>
          <div className="setting-row">
            <span>หมวดหมู่ของฉัน</span>
            <span style={{ color: "var(--muted)" }}>{categories.length} หมวด</span>
          </div>
        </div>
      </section>

      <section className="stack" style={{ gap: 8 }} aria-label="ข้อมูล">
        <div className="settings-title">ข้อมูล</div>
        <div className="settings">
          <a href="/api/export" className="setting-row" download>
            <span>ส่งออกเป็นไฟล์ CSV</span>
            <IconDownload size={20} />
          </a>
          <form action={signOut}>
            <button type="submit" className="setting-row danger">
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
