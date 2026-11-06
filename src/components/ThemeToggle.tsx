"use client";

import { useEffect, useState } from "react";

/** สวิตช์โหมดมืด: จำค่าไว้ใน localStorage และใช้กับทุกหน้า */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // เบราว์เซอร์ปิดการจัดเก็บ: ยังใช้ได้ในหน้านี้ แต่จะไม่จำค่า
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="โหมดมืด"
      className="switch"
      onClick={toggle}
    >
      <span />
    </button>
  );
}
