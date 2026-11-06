"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidDate, parseBahtToSatang, todayInBangkok } from "@/lib/format";

export type FormState = {
  error?: string;
  /** เปลี่ยนค่าทุกครั้งที่บันทึกสำเร็จ ใช้สั่งให้ฟอร์มล้างข้อมูล */
  savedAt?: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function addTransaction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const type = String(formData.get("type") ?? "");
  if (type !== "income" && type !== "expense") {
    return { error: "ประเภทรายการไม่ถูกต้อง" };
  }

  const amount = parseBahtToSatang(String(formData.get("amount") ?? ""));
  if (amount === null) {
    return { error: "กรุณากรอกจำนวนเงินที่มากกว่า 0 (ทศนิยมไม่เกิน 2 ตำแหน่ง)" };
  }

  const occurredOn = String(formData.get("occurred_on") ?? "") || todayInBangkok();
  if (!isValidDate(occurredOn)) {
    return { error: "วันที่ไม่ถูกต้อง" };
  }

  const note = String(formData.get("note") ?? "").trim();
  if (note.length > 200) {
    return { error: "บันทึกยาวเกิน 200 ตัวอักษร" };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  // ตรวจว่าหมวดเป็นของผู้ใช้คนนี้และตรงกับประเภท (RLS กรองให้เห็นเฉพาะหมวดของตัวเอง)
  const categoryId = String(formData.get("category_id") ?? "");
  let validCategoryId: string | null = null;
  if (categoryId) {
    if (!UUID.test(categoryId)) return { error: "หมวดหมู่ไม่ถูกต้อง" };
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("type", type)
      .maybeSingle();
    if (!cat) return { error: "ไม่พบหมวดหมู่ที่เลือก" };
    validCategoryId = cat.id;
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type,
    amount,
    note: note || null,
    occurred_on: occurredOn,
    category_id: validCategoryId,
  });

  if (error) {
    return { error: "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }

  revalidatePath("/", "layout");

  if (formData.get("redirect_home") === "1") {
    redirect("/");
  }
  return { savedAt: Date.now() };
}

export async function deleteTransaction(id: string): Promise<void> {
  if (!UUID.test(id)) return;
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
