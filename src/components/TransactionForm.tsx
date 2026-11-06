"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTransaction, type FormState } from "@/app/(app)/actions";
import type { Category, TxType } from "@/lib/types";
import { IconCheck } from "@/components/icons";

type Props = {
  categories: Category[];
  defaultDate: string;
  defaultType?: TxType;
  /** หลังบันทึกให้กลับหน้าหลัก (ใช้กับหน้า /add บนมือถือ) */
  redirectHome?: boolean;
  heading?: string;
};

const initial: FormState = {};

export function TransactionForm({
  categories,
  defaultDate,
  defaultType = "expense",
  redirectHome = false,
  heading = "เพิ่มรายการใหม่",
}: Props) {
  const [state, action, pending] = useActionState(addTransaction, initial);
  const [type, setType] = useState<TxType>(defaultType);
  const [categoryId, setCategoryId] = useState<string>(
    () => categories.find((c) => c.type === defaultType)?.id ?? "",
  );
  const formRef = useRef<HTMLFormElement>(null);

  const options = categories.filter((c) => c.type === type);

  function pickType(next: TxType) {
    setType(next);
    setCategoryId(categories.find((c) => c.type === next)?.id ?? "");
  }

  // บันทึกสำเร็จ → ล้างช่องกรอก (คงประเภท หมวด และวันที่ไว้เพื่อจดรายการต่อเนื่อง)
  useEffect(() => {
    if (state.savedAt) formRef.current?.reset();
  }, [state.savedAt]);

  return (
    <form ref={formRef} action={action} className="panel">
      <h2>{heading}</h2>

      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="category_id" value={categoryId} />
      {redirectHome ? <input type="hidden" name="redirect_home" value="1" /> : null}

      <div className="seg" role="group" aria-label="ประเภทรายการ">
        <button
          type="button"
          className="is-income"
          aria-pressed={type === "income"}
          onClick={() => pickType("income")}
        >
          รายรับ
        </button>
        <button
          type="button"
          className="is-expense"
          aria-pressed={type === "expense"}
          onClick={() => pickType("expense")}
        >
          รายจ่าย
        </button>
      </div>

      <div className="field">
        <label htmlFor="amount">จำนวนเงิน (บาท)</label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          autoComplete="off"
          required
          className="input input-amount num"
        />
      </div>

      <div className="field">
        <span className="field-title" id="cat-title">
          หมวดหมู่
        </span>
        <div className="chips" role="group" aria-labelledby="cat-title">
          {options.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={categoryId === c.id}
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="occurred_on">วันที่</label>
          <input
            id="occurred_on"
            name="occurred_on"
            type="date"
            defaultValue={defaultDate}
            required
            className="input"
          />
        </div>
        <div className="field">
          <label htmlFor="note">บันทึกเพิ่มเติม</label>
          <input
            id="note"
            name="note"
            type="text"
            maxLength={200}
            placeholder="เช่น ข้าวกลางวัน"
            autoComplete="off"
            className="input"
          />
        </div>
      </div>

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.savedAt && !pending ? (
        <p className="form-ok" role="status">
          บันทึกแล้ว
        </p>
      ) : null}

      <button type="submit" className="btn" disabled={pending}>
        <IconCheck size={20} />
        <span>{pending ? "กำลังบันทึก…" : "บันทึกรายการ"}</span>
      </button>
    </form>
  );
}
