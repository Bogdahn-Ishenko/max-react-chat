import React, { useState } from "react";
import { ChevronLeft, X } from 'lucide-react'; 
import Button from "../ui/Button/Button";
import { formatPhoneNumber } from "../../utils/formatPhoneNumber";
import styles from './ChatSidebar.module.css';

interface ChatSidebarProps {
    activeChat: string | null;
    chats: string[];
    isSidebarOpen: boolean;
    onCloseSidebar: () => void;
    onCreateChat: (phone: string) => void;
    onSelectChat: (phone: string) => void;
    onDeleteChatRequest: (phone: string) => void; 
    onLogout: () => void;
}

function ChatSidebar ({ 
    activeChat, 
    chats, 
    isSidebarOpen, 
    onCloseSidebar, 
    onCreateChat, 
    onSelectChat, 
    onDeleteChatRequest,
    onLogout 
}: ChatSidebarProps) {
    const [phone, setPhone] = useState('');

    const numericPhone = phone.replace(/\D/g, '');
    const isPhoneValid = numericPhone.length === 10 || numericPhone.length === 11;

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isPhoneValid) {
            return;
        }

        onCreateChat(phone);
        setPhone('');
    };

    return (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
            <div className={styles.user}>
                <div className={styles.userInfoWrapper}>
                    <button 
                        type="button" 
                        className={styles.closeBtn} 
                        onClick={onCloseSidebar}
                        aria-label="Закрыть меню"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <strong>MAX Chat</strong>
                        <span>GREEN-API</span>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.logoutBtn}
                    onClick={onLogout}
                >
                    Выйти
                </button>
            </div>

            <form
                className={styles.newChat}
                onSubmit={handleSubmit}
            >
                <label htmlFor="phone">Новый чат</label>
                <div className={styles.inputWrapper}>
                    <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="79990000000"
                        aria-invalid={!isPhoneValid && phone.length > 0}
                    />
                    <Button
                        type="submit"
                        disabled={!isPhoneValid}
                    >
                        Открыть
                    </Button>
                </div>
            </form>

            <div className={styles.chatsContainer}>
                <span className={styles.title}>Чаты</span>

                {chats.length === 0 ? (
                    <span className={styles.empty}>Нет активных чатов</span>
                ) : (
                    chats.map((chat) => (
                        <div 
                            key={chat} 
                            className={`${styles.chatWrapper} ${activeChat === chat ? styles.chatActive : ''}`}
                        >
                            <button
                                type="button"
                                className={styles.chatBtn}
                                onClick={() => onSelectChat(chat)}
                            >
                                {formatPhoneNumber(chat)}
                            </button>
                            <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    onDeleteChatRequest(chat);
                                }}
                                aria-label="Удалить чат"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

export default ChatSidebar;
