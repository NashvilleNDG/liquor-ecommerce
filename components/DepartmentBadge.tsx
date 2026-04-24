const deptColors: Record<string, string> = {
  BEER: "bg-amber-900 text-amber-300",
  Wines: "bg-purple-900 text-purple-300",
  WINE: "bg-purple-900 text-purple-300",
  LIQUOR: "bg-blue-900 text-blue-300",
  "NON-ALCOHOLIC": "bg-green-900 text-green-300",
  OTHER: "bg-gray-700 text-gray-300",
};

export default function DepartmentBadge({ dept }: { dept: string }) {
  const cls = deptColors[dept] ?? "bg-gray-700 text-gray-300";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {dept}
    </span>
  );
}
