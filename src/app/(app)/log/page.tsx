import { requireUser } from "@/lib/auth";
import { getExtractionUsage } from "@/lib/quota";
import LogActivity from "@/components/LogActivity";

export default async function LogPage() {
  const user = await requireUser();
  const usage = await getExtractionUsage(user.id, user.isPro);
  return <LogActivity isPro={user.isPro} usage={usage} />;
}
