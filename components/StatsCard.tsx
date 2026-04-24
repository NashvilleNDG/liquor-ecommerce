interface StatsCardProps {
  title: string;
  value: string | number;
  sub?: string;
  color: "amber" | "green" | "blue" | "red" | "purple";
}

const colorMap = {
  amber: "border-amber-500 text-amber-400",
  green: "border-green-500 text-green-400",
  blue: "border-blue-500 text-blue-400",
  red: "border-red-500 text-red-400",
  purple: "border-purple-500 text-purple-400",
};

export default function StatsCard({ title, value, sub, color }: StatsCardProps) {
  return (
    <div className={`bg-gray-900 rounded-xl border-l-4 ${colorMap[color]} p-5`}>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colorMap[color].split(" ")[1]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
