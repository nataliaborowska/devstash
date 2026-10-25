export default function ItemsByTypeLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-muted" />
        <div className="space-y-2">
          <div className="h-7 w-32 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card h-[72px]"
          />
        ))}
      </div>
    </div>
  );
}
