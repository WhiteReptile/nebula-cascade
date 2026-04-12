import { DIVISION_LABELS, DIVISION_COLORS, type Division } from '@/lib/divisionSystem';

interface DivisionBadgeProps {
  division: Division;
  size?: 'sm' | 'md';
}

const DivisionBadge = ({ division, size = 'sm' }: DivisionBadgeProps) => {
  const label = DIVISION_LABELS[division];
  const color = DIVISION_COLORS[division];
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono font-bold ${textSize}`}
      style={{
        borderColor: color,
        color: color,
        textShadow: `0 0 6px ${color}`,
        background: `${color}15`,
      }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
};

export default DivisionBadge;
