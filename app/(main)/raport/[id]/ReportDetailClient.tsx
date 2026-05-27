'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Heart, Share2, MessageCircle, MapPin, Calendar, Eye, ChevronLeft, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { CategoryBadge } from '@/components/reports/CategoryBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_LABELS, StatusKey } from '@/lib/constants'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Report, ReportComment, StatusHistory } from '@/lib/types'

const ReportMap = dynamic(() => import('@/components/map/ReportMap'), { ssr: false })

const STATUS_ORDER: StatusKey[] = ['raportuar', 'shqyrtim', 'ne_proces', 'zgjidhur']

interface ReportDetailClientProps {
  report: Report & { comments: ReportComment[]; history: StatusHistory[] }
}

export function ReportDetailClient({ report: initialReport }: ReportDetailClientProps) {
  const { user, isSignedIn } = useUser()
  const [report, setReport] = useState(initialReport)
  const [upvoted, setUpvoted] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [comments, setComments] = useState(initialReport.comments)

  const handleUpvote = async () => {
    if (!isSignedIn) { toast.error('Hyr për të votuar'); return }
    const res = await fetch(`/api/reports/${report.id}/upvote`, { method: 'POST' })
    if (res.ok) {
      const { upvoted: newUpvoted } = await res.json()
      setUpvoted(newUpvoted)
      setReport((prev) => ({ ...prev, upvotes: prev.upvotes + (newUpvoted ? 1 : -1) }))
    }
  }

  const handleComment = async () => {
    if (!isSignedIn) { toast.error('Hyr për të komentuar'); return }
    if (commentText.trim().length < 2) { toast.error('Komenti është shumë i shkurtër'); return }
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/reports/${report.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
        setCommentText('')
        toast.success('Komenti u shtua')
      }
    } catch {
      toast.error('Komenti dështoi')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Linku u kopjua!')
  }

  const statusIndex = STATUS_ORDER.indexOf(report.status as StatusKey)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Kthehu
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {report.photo_url && (
            <div className="rounded-xl overflow-hidden">
              <img src={report.photo_url} alt={report.title} className="w-full max-h-[400px] object-cover" />
            </div>
          )}

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <CategoryBadge category={report.category} />
              <StatusBadge status={report.status} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{report.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{report.address_text || report.municipality}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(report.created_at)}</span>
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{report.views} shikime</span>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{report.description}</p>

          {/* Status timeline */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4">Rrjedha e statusit</h3>
            <div className="flex items-center gap-2">
              {STATUS_ORDER.map((s, i) => {
                const sl = STATUS_LABELS[s]
                const done = i <= statusIndex
                const isCurrent = i === statusIndex
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${done ? 'border-current' : 'border-gray-200 dark:border-gray-700'}`}
                        style={done ? { color: sl.color, backgroundColor: sl.bg, borderColor: sl.color } : {}}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <span className={`text-[10px] mt-1 text-center leading-tight ${isCurrent ? 'font-semibold' : 'text-gray-400'}`} style={isCurrent ? { color: sl.color } : {}}>
                        {sl.label}
                      </span>
                    </div>
                    {i < STATUS_ORDER.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-5 ${i < statusIndex ? 'bg-[#1D9E75]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-48">
            <ReportMap
              reports={[report]}
              height="100%"
              center={[report.latitude, report.longitude]}
              zoom={15}
              interactive={false}
            />
          </div>

          {/* Comments */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Komentet ({comments.length})
            </h3>
            <div className="space-y-3 mb-4">
              {comments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Nuk ka komente ende. Bëhu i pari!</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className={`p-4 rounded-xl ${c.is_official ? 'bg-[#1D9E75]/10 border border-[#1D9E75]/30' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{c.author_name}</span>
                    {c.is_official && (
                      <span className="flex items-center gap-1 text-xs text-[#1D9E75] font-medium">
                        <Shield className="h-3 w-3" /> Zyrtar
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                </div>
              ))}
            </div>
            {isSignedIn ? (
              <div className="space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Shto koment..."
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleComment}
                  disabled={submittingComment || commentText.trim().length < 2}
                  className="bg-[#1D9E75] hover:bg-[#17836B]"
                  size="sm"
                >
                  {submittingComment ? 'Duke dërguar...' : 'Dërgo komentin'}
                </Button>
              </div>
            ) : (
              <Link href="/sign-in" className="block text-center text-sm text-[#1D9E75] hover:underline py-3">
                Hyr për të komentuar
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {/* Upvote */}
            <button
              onClick={handleUpvote}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors font-medium ${upvoted ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-400'}`}
            >
              <Heart className={`h-5 w-5 ${upvoted ? 'fill-current' : ''}`} />
              <span>{report.upvotes} vota</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-sm font-medium text-gray-600"
            >
              <Share2 className="h-4 w-4" />
              Ndaj
            </button>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Raportues</span>
                <span className="font-medium text-gray-900 dark:text-white">{report.reporter_name}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Komuna</span>
                <span className="font-medium text-gray-900 dark:text-white">{report.municipality}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Kategoria</span>
                <CategoryBadge category={report.category} size="sm" />
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Statusi</span>
                <StatusBadge status={report.status} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
