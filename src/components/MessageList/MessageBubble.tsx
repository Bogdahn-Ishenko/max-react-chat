import type { Message } from "../../types/message"
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
    message: Message;
}

function MessageBubble ({ message }: MessageBubbleProps) {
    const isOwnMessage = message.sender === 'me';

    const renderTime = () => {
        try {
            const date = new Date(message.timestamp);
            if (Number.isNaN(date.getTime())) {
                return '';
            }
            return date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    return (
        <div
            className={`${styles.row} ${
                isOwnMessage 
                    ? styles.rowOutgoing
                    : styles.rowIncoming
            }`}
        >
            <div className={styles.bubble}>
                <span>{message.text}</span>
                <time dateTime={message.timestamp}>
                    {renderTime()}
                </time>
            </div>
        </div>
    );
}

export default MessageBubble;
