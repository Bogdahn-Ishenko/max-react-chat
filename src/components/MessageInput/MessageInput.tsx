import React, { useState, useRef } from 'react';
import Button from '../ui/Button/Button';
import styles from './MessageInput.module.css';

interface MessageInputProps {
    onSend: (message: string) => Promise<void>;
}

function MessageInput({ onSend }: MessageInputProps) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handlerSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedText = text.trim();

        if (!normalizedText || loading) {
            return;
        }

        setLoading(true);

        try {
            await onSend(normalizedText);
            setText('');
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <footer className={styles.footer}>
            <form className={styles.inputForm} onSubmit={handlerSubmit}>
                <input
                    ref={inputRef} 
                    type="text"
                    value={text}
                    disabled={loading}
                    onChange={event => setText(event.target.value)}
                    placeholder="Введите сообщение..."
                    autoComplete="off" 
                />
                <Button
                    type="submit"
                    disabled={!text.trim() || loading}
                >
                    {!loading ? 'Отправить' : '...'}
                </Button>
            </form>
        </footer>
    );
}

export default MessageInput;
