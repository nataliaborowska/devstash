export default function SettingsLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-28 rounded bg-muted" />
        <div className="h-4 w-40 rounded bg-muted" />
      </div>

      {/* Account section */}
      <div className="space-y-4">
        <div className="h-5 w-20 rounded bg-muted" />
        <div className="rounded-lg border border-border bg-card h-[154px]" />
      </div>
    </div>
  );
}
