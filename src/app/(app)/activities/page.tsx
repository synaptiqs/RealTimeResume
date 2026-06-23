import ActivitiesManager from "@/components/ActivitiesManager";

export default function ActivitiesPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Activities</h1>
      <p className="mb-6 text-slate-600">
        Log what you do and tag the skills behind it.
      </p>
      <ActivitiesManager />
    </div>
  );
}
