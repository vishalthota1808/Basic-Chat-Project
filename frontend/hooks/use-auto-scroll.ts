'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'

const NEAR_BOTTOM_PX = 96

/**
 * Keeps a scroll container pinned to the newest message, unless the user has
 * scrolled up to read older ones. Then it offers a "jump to latest" instead.
 */
export function useAutoScroll(messageCount: number, lastMessageIsOwn: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isNearBottom = useRef(true)
  const [hasUnseen, setHasUnseen] = useState(false)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const element = containerRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior })
    setHasUnseen(false)
  }, [])

  const handleScroll = useCallback(() => {
    const element = containerRef.current
    if (!element) return
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight
    isNearBottom.current = distance < NEAR_BOTTOM_PX
    if (isNearBottom.current) setHasUnseen(false)
  }, [])

  useLayoutEffect(() => {
    if (messageCount === 0) return
    if (isNearBottom.current || lastMessageIsOwn) {
      scrollToBottom()
    } else {
      setHasUnseen(true)
    }
  }, [messageCount, lastMessageIsOwn, scrollToBottom])

  return { containerRef, handleScroll, hasUnseen, scrollToBottom }
}
