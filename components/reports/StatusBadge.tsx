import { STATUS_LABELS, StatusKey } from '@/lib/constants'

interface StatusBadgeProps {
  status: StatusKey
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const s = STATUS_LABELS[status]
  if (!s) return null
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  )
}
