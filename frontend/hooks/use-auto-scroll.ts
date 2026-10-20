//This is a custom React hook designed for your Whispr messaging app. Its job is to manage scrolling inside a chat conversation.The main idea: when a new message arrives, automatically scroll to the latest message if the user is already near the bottom. But if the user has scrolled up to read older messages, don't force them back down. Instead, show an option to jump to the latest message.
'use client' //this keyword tells the nextjs as this component is client side not server side

import { useCallback, useLayoutEffect, useRef, useState } from 'react' //these are the four hooks used in this component

const NEAR_BOTTOM_PX = 96 //The hook treats the user as being "near the bottom" when they're less than 96 pixels away from the end of the scrollable content.

export function useAutoScroll(messageCount: number, lastMessageIsOwn: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isNearBottom = useRef(true)
  const [hasUnseen, setHasUnseen] = useState(false)

  //scrollToBottom is a function to move the DOM to the bottom[latest message].
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const element = containerRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior })
    setHasUnseen(false)
  }, [])

  //handle scroll is a function to ensure the user moved up to read older messages or not. so that scrolling can be handled.
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
