import type { ConditionLevel } from "@/lib/types";
import { conditionConfig } from "@/lib/condition";

interface ConditionBadgeProps {
  condition: ConditionLevel;
}

export default function ConditionBadge({ condition }: ConditionBadgeProps) {
  const cfg = conditionConfig[condition];

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${cfg.bg}`}
    >
      <span className={`text-lg ${cfg.color}`}>{cfg.emoji}</span>
      <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
    </div>
  );
}
