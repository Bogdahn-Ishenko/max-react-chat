import { useEffect, useRef } from 'react';
import type { GreenApiService } from '../services/greenApi';
import type { MessagePolling } from '../types/message';

interface UsePollingProps {
    api: GreenApiService;
    onMessage: (message: MessagePolling) => void;
}

const ERROR_DELAY = 5000; 

function usePolling({ api, onMessage }: UsePollingProps) {
    const onMessageRef = useRef(onMessage);
    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

    useEffect(() => {
        let cancelled = false;

        const sleep = (ms: number) => new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });

        const poll = async () => {
            while (!cancelled) {
                try {
                    
                    const notification = await api.receiveNotification(20);

                    if (cancelled) return;

                    
                    if (!notification) {
                        continue;
                    }

                    const { receiptId, body } = notification;

                    try {
                        if (body?.typeWebhook === 'incomingMessageReceived') {
                            const message = extractIncomingMessage(body);
                            if (message) {
                                onMessageRef.current(message);   
                            }
                        }
                    } finally {
                        
                        try {
                            await api.deleteNotification(receiptId);
                        } catch (error) {
                            console.warn('deleteNotification failed:', error);
                        }
                    }
                } catch (error) {
                    console.error('Ошибка фонового опроса (HTTP API Long Polling):', error);
                    await sleep(ERROR_DELAY);
                }
            }
        };

        void poll();

        return () => { cancelled = true; };
    }, [api]); 

    function extractIncomingMessage(body: Record<string, any>): MessagePolling | null {
        const senderData = body.senderData as Record<string, any> | undefined;
        const messageData = body.messageData as Record<string, any> | undefined;

        if (!senderData || !messageData) {
            return null;
        }

        const chatId = typeof senderData.chatId === 'string' ? senderData.chatId : '';
        const idMessage = typeof body.idMessage === 'string' ? body.idMessage : '';
        const timestamp = typeof body.timestamp === 'number' ? body.timestamp : Date.now();
        const textMessage = messageData.textMessage || messageData.extendedTextMessage?.text || '';

        if (!chatId || !textMessage || !idMessage) {
            return null;
        }

        return {
            id: idMessage,
            text: textMessage,
            timestamp: timestamp, 
            chatId,
        };
    }
}

export default usePolling;
