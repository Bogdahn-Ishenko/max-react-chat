import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GreenApiService } from '../services/greenApi';
import { normalizePhone } from '../utils/normalizePhone';
import type { Message } from '../types/message';
import { toChatId } from '../utils/toChatId';
import { normalizeTimestamp } from '../utils/normalizeTimestamp';

export function useChats(api: GreenApiService) {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const remoteChats = await api.getChats();
      return remoteChats
        .map((c) => normalizePhone(c.chatId))
        .filter((k) => k && k.length >= 10);
    },
    staleTime: 30000,
  });
}

export function useChatMessages(api: GreenApiService, activeChat: string | null) {
  return useQuery({
    queryKey: ['messages', activeChat],
    queryFn: async ({ signal }): Promise<Message[]> => { 
      if (!activeChat) return [];
      
      const chatId = toChatId(activeChat);
      if (!chatId) return [];

      const history = await api.getChatHistory(chatId, 50, signal);
      
      return history
        .filter((item) => {
          const text = item.textMessage ?? item.text ?? item.messageData?.textMessage ?? '';
          return typeof text === 'string' && text.trim().length > 0;
        })
        .map((item) => ({
          id: String(item.idMessage ?? item.id),
          text: item.textMessage ?? item.text ?? item.messageData?.textMessage ?? '',
          sender: item.type === 'outgoing' ? 'me' : 'them', 
          timestamp: normalizeTimestamp(item.timestamp),
        }));
    },
    enabled: !!activeChat,
    
    staleTime: 60000, 
  });
}

export function useSendMessageMutation(api: GreenApiService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activeChat, text }: { activeChat: string; text: string }) => {
      const chatId = toChatId(activeChat);
      if (!chatId) throw new Error('Некорректный номер телефона');

      return await api.sendMessage(chatId, text);
    },
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['messages', variables.activeChat], (oldMessages: Message[] = []) => {
        const newMessage: Message = {
          id: response.idMessage,
          text: variables.text,
          sender: 'me',
          timestamp: new Date().toISOString(),
        };

        const cacheKey = `greenApiHistory_${variables.activeChat}@c.us`;
        const currentHistory = api.getCache<any[]>(cacheKey) || [];
        const rawApiMessage = {
          idMessage: response.idMessage,
          textMessage: variables.text,
          type: 'outgoing',
          timestamp: Math.floor(Date.now() / 1000)
        };
        api.setCache(cacheKey, [...currentHistory, rawApiMessage]);

        return [...oldMessages, newMessage];
      });
    },
  });
}
