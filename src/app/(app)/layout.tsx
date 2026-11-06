import { redirect } from "next/navigation";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { IconLogo } from "@/components/icons";
import { BottomNav, TopNav } from "@/components/Nav";
import { SetupNotice } from "@/components/SetupNotice";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="container">
        <SetupNotice />
      </div>
    );
  }

  // proxy.ts ตรวจแล้วชั้นหนึ่ง ตรวจซ้ำที่นี่อีกชั้นเพื่อความปลอดภัย
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <div className="container">
      <header className="topbar">
        <div className="brand">
          <div className="logo">
            <IconLogo size={26} />
          </div>
          <div>
            <h1>{APP_NAME}</h1>
            <p>{APP_TAGLINE}</p>
          </div>
        </div>
        <TopNav />
      </header>
      {children}
      <BottomNav />
    </div>
  );
}
