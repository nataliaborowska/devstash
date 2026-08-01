export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-4 h-[72px]"
          />
        ))}
      </div>

      {/* Collections */}
      <section>
        <div className="h-5 w-28 rounded bg-muted mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card h-[124px]"
            />
          ))}
        </div>
      </section>

      {/* Recent Items */}
      <section>
        <div className="h-5 w-32 rounded bg-muted mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card h-[72px]"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
