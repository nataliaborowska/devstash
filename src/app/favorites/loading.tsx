export default function FavoritesLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-36 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>

      {/* Rows */}
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-muted" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-6 rounded bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
