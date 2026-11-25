import { Check } from "lucide-react";

interface ChecklistProps {
  items: string[];
}

export function Checklist({ items }: ChecklistProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
