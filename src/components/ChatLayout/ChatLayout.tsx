import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { Message, MessagePolling } from '../../types/message'
import type { AuthCredentials } from '../../types/auth'

import ChatSidebar from '../ChatSidebar/ChatSidebar'
import ChatHeader from '../ChatHeader/ChatHeader'
import MessageList from '../MessageList/MessageList'
import MessageInput from '../MessageInput/MessageInput'
import Modal from '../ui/Modal/Modal' 

import { GreenApiService } from '../../services/greenApi'
import { useChats, useChatMessages, useSendMessageMutation } from '../../hooks/useChatHistory'
import usePolling from '../../hooks/usePolling'
import { normalizePhone } from '../../utils/normalizePhone'
import { normalizeTimestamp } from '../../utils/normalizeTimestamp'
import styles from './ChatLayout.module.css'

function ChatLayout() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [activeChat, setActiveChat] = useState<string | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [chatToDelete, setChatToDelete] = useState<string | null>(null)

    const credentials = useMemo<AuthCredentials>(() => {
        return {
            idInstance: localStorage.getItem('idInstance') || '',
            apiTokenInstance: localStorage.getItem('apiTokenInstance') || '',
        }
    }, [])

    const api = useMemo(() => new GreenApiService(credentials), [credentials]);

    const { data: chats = [] } = useChats(api)
    const { data: currentMessages = [] } = useChatMessages(api, activeChat)
    const sendMessageMutation = useSendMessageMutation(api)

    const handleLogout = () => {
        localStorage.clear()
        queryClient.clear() 
        navigate('/login')
    }

    const handleCreateChat = (phone: string) => {
        const chatKey = normalizePhone(phone);
        if (!chatKey || chatKey.length < 11) return;

        queryClient.setQueryData<string[]>(['chats'], (oldChats = []) => {
            if (oldChats.includes(chatKey)) return oldChats;
            const updatedChats = [...oldChats, chatKey].sort();
            
            const currentCache = api.getCache<any[]>('greenApiChats') || [];
            if (!currentCache.some(c => c.chatId.includes(chatKey))) {
                api.setCache('greenApiChats', [...currentCache, { chatId: `${chatKey}@c.us` }]);
            }

            return updatedChats;
        });

        setActiveChat(chatKey);
        setIsSidebarOpen(false);
    };

    const handleSelectChat = (phone: string) => {
        const chatKey = normalizePhone(phone)
        if (chatKey) {
            setActiveChat(chatKey);
            setIsSidebarOpen(false);
        }
    }

    const handleConfirmDeleteChat = () => {
        if (!chatToDelete) return;

        const target = chatToDelete;
        setChatToDelete(null);

        queryClient.setQueryData<string[]>(['chats'], (oldChats = []) => {
            return oldChats.filter(c => c !== target);
        });

        queryClient.removeQueries({ queryKey: ['messages', target] });

        const currentChatsCache = api.getCache<any[]>('greenApiChats') || [];
        const updatedChatsCache = currentChatsCache.filter(c => !c.chatId.includes(target));
        api.setCache('greenApiChats', updatedChatsCache);

        localStorage.removeItem(`greenApiHistory_${target}@c.us`);

        if (activeChat === target) {
            setActiveChat(null);
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!activeChat) return
        await sendMessageMutation.mutateAsync({ activeChat, text })
    }

    const handleIncomingMessage = useCallback((message: MessagePolling) => {
        const chatKey = normalizePhone(message.chatId);
        if (!chatKey) return;

        queryClient.setQueryData<Message[]>(['messages', chatKey], (oldMessages = []) => {
            if (oldMessages.some((m) => m.id === message.id)) return oldMessages;

            const newMessage: Message = {
                id: message.id,
                text: message.text,
                sender: 'them',
                timestamp: normalizeTimestamp(message.timestamp),
            };

            const updatedMessages = [...oldMessages, newMessage];

            const cacheKey = `greenApiHistory_${chatKey}@c.us`;
            const currentHistory = api.getCache<any[]>(cacheKey) || [];
            const rawApiMessage = {
                idMessage: message.id,
                textMessage: message.text,
                type: 'incoming',
                timestamp: Math.floor(new Date(message.timestamp).getTime() / 1000)
            };
            api.setCache(cacheKey, [...currentHistory, rawApiMessage]);

            return updatedMessages;
        });
    }, [queryClient, api]);

    usePolling({ api, onMessage: handleIncomingMessage })

    return (
        <div className={styles.layout}>
            <ChatSidebar
                activeChat={activeChat}
                chats={chats}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
                onCreateChat={handleCreateChat}
                onSelectChat={handleSelectChat}
                onDeleteChatRequest={(phone) => setChatToDelete(phone)}
                onLogout={handleLogout}
            />
            <section className={styles.content}>
                {!activeChat ? (
                    <div className={styles.empty}>
                        {!isSidebarOpen && (
                            <button 
                                className={styles.mobileToggleEmpty} 
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                Открыть меню чатов
                            </button>
                        )}
                        <p>Выберите или создайте чат для начала общения</p>
                    </div>
                ) : (
                    <>
                        <ChatHeader 
                            phone={activeChat} 
                            onOpenSidebar={() => setIsSidebarOpen(true)}
                        />
                        <MessageList messages={currentMessages} />
                        <MessageInput onSend={handleSendMessage} />
                    </>
                )}
            </section>

            <Modal 
                isOpen={chatToDelete !== null}
                title="Удалить чат?"
                description="Вы уверены, что хотите полностью удалить этот чат и всю историю переписки? Это действие необратимо."
                confirmText="Удалить"
                cancelText="Отмена"
                onClose={() => setChatToDelete(null)}
                onConfirm={handleConfirmDeleteChat}
            />
        </div>
    )
}

export default ChatLayout
