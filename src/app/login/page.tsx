import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { IconLogo } from "@/components/icons";
import { SetupNotice } from "@/components/SetupNotice";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          <div className="logo">
            <IconLogo size={26} />
          </div>
          <div>
            <h1>{APP_NAME}</h1>
            <p>{APP_TAGLINE}</p>
          </div>
        </div>
        {isSupabaseConfigured ? <LoginForm /> : <SetupNotice />}
      </div>
    </main>
  );
}
