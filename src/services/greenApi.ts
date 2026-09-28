import type { AuthCredentials } from "../types/auth";

interface SendMessageResponse {
    idMessage: string;
}

export interface GreenApiHistoryMessage {
    idMessage?: string;
    id?: string;
    type?: string;
    textMessage?: string;
    text?: string;
    timestamp?: number | string;
    messageData?: {
        textMessage?: string;
    };
    senderData?: {
        chatId?: string;
        sender?: string;
        senderName?: string;
    };
}

export interface Notification {
    receiptId: number;
    body: {
        typeWebhook?: string;
        [key: string]: unknown;
    };
}

export interface GreenApiChat {
    chatId: string;
    name?: string;
    type?: 'user' | 'group' | string;
    phoneNumber?: number;
    [key: string]: unknown;
}

export class GreenApiService {
    private readonly baseUrl = 'https://api.green-api.com';
    private readonly idInstance: string;
    private readonly apiTokenInstance: string;

    constructor(credentials: AuthCredentials) {
        this.idInstance = credentials.idInstance.trim();
        this.apiTokenInstance = credentials.apiTokenInstance.trim();
    }

    private buildUrl(method: string): string {
        return `${this.baseUrl}/waInstance${this.idInstance}/${method}/${this.apiTokenInstance}`;
    }

    private formatChatId(chatId: string): string {
        return chatId.includes('@') ? chatId : `${chatId}@c.us`;
    }

    public getCache<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    }

    public setCache<T>(key: string, data: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Ошибка сохранения в localStorage:', e);
        }
    }

    async validateCredentials(): Promise<boolean> {
        try {
            const response = await fetch(
                this.buildUrl('getStateInstance'),
                { method: 'GET' }
            );
            return response.ok;
        } catch {
            return false;
        }
    }

    
    async initHttpApi(): Promise<boolean> {
        try {
            const response = await fetch(
                this.buildUrl('SetSettings'),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        webhookUrl: "", 
                        outgoingWebhook: "yes",
                        stateWebhook: "yes",
                        incomingWebhook: "yes"
                    })
                }
            );
            return response.ok;
        } catch (error) {
            console.error('Не удалось настроить инстанс на режим HTTP API:', error);
            return false;
        }
    }

    async getChatHistory(
        chatId: string,
        count = 50,
        signal?: AbortSignal,
    ): Promise<GreenApiHistoryMessage[]> {
        const formattedChatId = this.formatChatId(chatId);
        const cacheKey = `greenApiHistory_${formattedChatId}`;
        const cachedMessages = this.getCache<GreenApiHistoryMessage[]>(cacheKey) || [];

        try {
            const response = await fetch(
                this.buildUrl('GetChatHistory'),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chatId: formattedChatId, count }),
                    signal,
                }
            );

            const newMessages: GreenApiHistoryMessage[] = response.ok ? await response.json() : [];
            const messageMap = new Map<string, GreenApiHistoryMessage>();
            
            cachedMessages.forEach(msg => messageMap.set(msg.idMessage || msg.id || JSON.stringify(msg), msg));
            if (Array.isArray(newMessages)) {
                newMessages.forEach(msg => messageMap.set(msg.idMessage || msg.id || JSON.stringify(msg), msg));
            }

            const mergedHistory = Array.from(messageMap.values()).sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
            const recentHistory = mergedHistory.slice(-200);
            this.setCache(cacheKey, recentHistory);

            return recentHistory;
        } catch (error) {
            console.warn(`Ошибка сети при загрузке истории для ${formattedChatId}:`, error);
            return cachedMessages;
        }
    }

    async getChats(): Promise<GreenApiChat[]> {
        const cacheKey = 'greenApiChats';
        const cachedChats = this.getCache<GreenApiChat[]>(cacheKey) || [];

        try {
            const response = await fetch(
                this.buildUrl('GetChats'),
                { method: 'GET' }
            );

            const newChats: GreenApiChat[] = response.ok ? await response.json() : [];
            const chatMap = new Map<string, GreenApiChat>();
            
            cachedChats.forEach(chat => chatMap.set(chat.chatId, chat));
            if (Array.isArray(newChats)) {
                newChats.forEach(chat => chatMap.set(chat.chatId, chat));
            }

            const mergedChats = Array.from(chatMap.values());
            this.setCache(cacheKey, mergedChats);

            return mergedChats;
        } catch (error) {
            console.warn('Ошибка сети при загрузке чатов:', error);
            return cachedChats;
        }
    }

    async sendMessage(chatId: string, message: string): Promise<SendMessageResponse> {
        const formattedChatId = this.formatChatId(chatId);
        
        const response = await fetch(
            this.buildUrl('SendMessage'), 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: formattedChatId, message })
            }
        );

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Указан несуществующий или невалидный номер в системе MAX');
            }
            if (response.status === 466) {
                throw new Error('На бесплатном тарифе MAX отправка доступна только на свой номер');
            }
            throw new Error(`GREEN-API sendMessage error: ${response.status}`);
        }

        return response.json();
    }

    
    async receiveNotification(receiveTimeout = 20): Promise<Notification | null> {
        const response = await fetch(
            `${this.buildUrl('receiveNotification')}?receiveTimeout=${receiveTimeout}`, 
            { method: 'GET' }
        );

        if (!response.ok) {
            throw new Error(`GREEN-API receiveNotification error: ${response.status}`);
        }

        const text = await response.text();
        if (!text.trim()) {
            return null;
        }

        return JSON.parse(text);
    }

    async deleteNotification(receiptId: number): Promise<void> {
        const response = await fetch(
            `${this.buildUrl('deleteNotification')}/${receiptId}`, 
            { method: 'DELETE' }
        );

        if (!response.ok) {
            throw new Error(`GREEN-API deleteNotification error: ${response.status}`);
        }
    }
}
