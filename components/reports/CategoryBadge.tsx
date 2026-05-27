import { CATEGORIES, CategoryKey } from '@/lib/constants'

interface CategoryBadgeProps {
  category: CategoryKey
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function CategoryBadge({ category, size = 'md', showLabel = true }: CategoryBadgeProps) {
  const c = CATEGORIES[category]
  if (!c) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{ color: c.color, backgroundColor: c.color + '20' }}
    >
      <span>{c.emoji}</span>
      {showLabel && <span>{c.label}</span>}
    </span>
  )
}
