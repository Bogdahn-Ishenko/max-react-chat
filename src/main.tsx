import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './AppRoutes';
import './index.css';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000,          
      gcTime: 1000 * 60 * 5,     
      refetchOnWindowFocus: false, 
      retry: (failureCount, error: unknown) => {
        if (error instanceof Error && error.message.includes('429') && failureCount < 2) return true;
        return false;
      },
      retryDelay: (attemptIndex) => Math.pow(2, attemptIndex) * 3000, 
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  </StrictMode>,
);
