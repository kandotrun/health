interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
}

export default function StatItem({ label, value, unit }: StatItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-xl font-semibold tabular-nums">{value}</span>
        {unit && (
          <span className="text-sm text-neutral-400">{unit}</span>
        )}
      </div>
    </div>
  );
}
