import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Onboarding from "@/components/Onboarding";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <Onboarding isPro={user.isPro} initialGoal={user.goal} />;
}
