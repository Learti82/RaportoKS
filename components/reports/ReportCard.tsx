import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Clock } from 'lucide-react'
import { Report } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { CategoryBadge } from './CategoryBadge'

interface ReportCardProps {
  report: Report
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/raport/${report.id}`}>
      <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {report.photo_url ? (
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={report.photo_url}
              alt={report.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-4xl opacity-30">📷</span>
          </div>
        )}
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <CategoryBadge category={report.category} size="sm" />
            <StatusBadge status={report.status} size="sm" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {report.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{report.address_text || report.municipality}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(report.created_at)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Heart className="h-3 w-3" />
              <span>{report.upvotes}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
