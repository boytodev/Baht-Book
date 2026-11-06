/** แสดงเมื่อยังไม่ได้ตั้งค่า .env.local */
export function SetupNotice() {
  return (
    <div className="notice" role="status">
      <strong>ยังไม่ได้เชื่อมต่อ Supabase</strong>
      <p style={{ margin: "8px 0 0" }}>
        คัดลอก <code>.env.example</code> เป็น <code>.env.local</code> แล้วใส่{" "}
        <code>NEXT_PUBLIC_SUPABASE_URL</code> และ{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> จากโปรเจกต์ Supabase ของคุณ
        จากนั้นรัน <code>supabase/schema.sql</code> ใน SQL Editor และรีสตาร์ต{" "}
        <code>npm run dev</code>
      </p>
    </div>
  );
}
