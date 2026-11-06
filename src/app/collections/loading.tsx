export default function CollectionsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-36 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>

      {/* Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card h-[120px]" />
        ))}
      </div>
    </div>
  );
}
