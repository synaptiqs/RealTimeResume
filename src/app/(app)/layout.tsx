import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import BottomTabBar from "@/components/BottomTabBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto min-h-screen max-w-app bg-bg">
      <main className="px-5 pb-24 pt-6">{children}</main>
      <BottomTabBar />
    </div>
  );
}
