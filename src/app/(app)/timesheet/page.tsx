import TimesheetManager from "@/components/TimesheetManager";

export default function TimesheetPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Timesheet</h1>
      <p className="mb-6 text-slate-600">
        Log hours and generate a timesheet you can export as Markdown or CSV.
      </p>
      <TimesheetManager />
    </div>
  );
}
