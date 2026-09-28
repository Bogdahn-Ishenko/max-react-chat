export interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    timestamp: string;
}

export interface MessagePolling {
    id: string;
    text: string;
    timestamp: number;
    chatId: string;
}