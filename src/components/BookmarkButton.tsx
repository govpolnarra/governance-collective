'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

type ContentType = 'playbook' | 'solution' | 'learning_resource' | 'request'

interface BookmarkButtonProps {
  contentId: string
  contentType: ContentType
  initialBookmarked: boolean
}

export default function BookmarkButton({
  contentId,
  contentType,
  initialBookmarked,
}: BookmarkButtonProps) {
  const supabase = createBrowserClient()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    if (bookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
      setBookmarked(false)
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, content_id: contentId, content_type: contentType })
      setBookmarked(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
        bookmarked
          ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
          : 'bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-700'
      } disabled:opacity-50`}
    >
      <span>{bookmarked ? '🔖' : '📌'}</span>
      <span>{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  )
}
