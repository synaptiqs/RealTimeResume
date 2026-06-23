import JournalManager from "@/components/JournalManager";

export default function JournalPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Journal</h1>
      <p className="mb-6 text-slate-600">
        Capture achievements as they happen. (Plain notes — no assistant in this
        version.)
      </p>
      <JournalManager />
    </div>
  );
}
