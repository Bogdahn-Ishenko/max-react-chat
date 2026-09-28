import { useRef, useEffect } from 'react'
import type { Message } from "../../types/message"
import MessageBubble from './MessageBubble'
import styles from './MessageList.module.css'

interface MessageListProps {
    messages: Message[]
}

function MessageList ({ messages }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const prevCountRef = useRef(messages.length) 

    useEffect(() => {
        if (messages.length === 0) {
            prevCountRef.current = 0
            return
        }

        if (messages.length === prevCountRef.current + 1) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        } else {
            bottomRef.current?.scrollIntoView({ behavior: 'auto' })
        }

        prevCountRef.current = messages.length
    }, [messages])

    return (
        <div className={styles.list}>
            {messages.length === 0 ? (
                
                <div className={styles.emptyContainer}>
                    <span className={styles.emptyBadge}>Сообщений пока нет</span>
                </div>
            ) : (
                <div className={styles.wrapper}>
                    {messages.map(message => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                        />
                    ))}
                    <div ref={bottomRef} style={{ float: 'left', clear: 'both' }} />
                </div>
            )}
        </div>
    )
}

export default MessageList
