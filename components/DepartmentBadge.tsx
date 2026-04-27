const deptColors: Record<string, string> = {
  BEER:            "bg-amber-100  text-amber-800  border border-amber-200",
  Wines:           "bg-stone-100  text-stone-700  border border-stone-200",
  WINE:            "bg-stone-100  text-stone-700  border border-stone-200",
  LIQUOR:          "bg-amber-50   text-amber-700  border border-amber-200",
  "NON-ALCOHOLIC": "bg-stone-100  text-stone-600  border border-stone-200",
  OTHER:           "bg-stone-100  text-stone-500  border border-stone-200",
};

export default function DepartmentBadge({ dept }: { dept: string }) {
  const cls = deptColors[dept] ?? "bg-stone-100 text-stone-600 border border-stone-200";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {dept}
    </span>
  );
}
