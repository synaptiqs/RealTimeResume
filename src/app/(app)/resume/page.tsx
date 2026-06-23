import ResumeManager from "@/components/ResumeManager";

export default function ResumePage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Resume</h1>
      <p className="mb-6 text-slate-600">
        Generate and manage resume versions from your logged history.
      </p>
      <ResumeManager />
    </div>
  );
}
