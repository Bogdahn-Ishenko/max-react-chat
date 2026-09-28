import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
import AuthForm from './components/AuthForm/AuthForm';
import ChatLayout from './components/ChatLayout/ChatLayout';
import { GreenApiService } from './services/greenApi'; 
import type { AuthCredentials } from './types/auth';

const protectedLoader = () => {
  const idInstance = localStorage.getItem('idInstance');
  const apiTokenInstance = localStorage.getItem('apiTokenInstance');

  if (!idInstance || !apiTokenInstance) {
    return redirect('/login');
  }
  return null;
};

const authLoader = () => {
  const idInstance = localStorage.getItem('idInstance');
  const apiTokenInstance = localStorage.getItem('apiTokenInstance');

  if (idInstance && apiTokenInstance) {
    return redirect('/chat');
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: '/',
    loader: () => {
      const idInstance = localStorage.getItem('idInstance');
      const apiTokenInstance = localStorage.getItem('apiTokenInstance');
      return redirect(idInstance && apiTokenInstance ? '/chat' : '/login');
    },
  },
  {
    path: '/login',
    element: (
      <AuthForm 
        onLogin={async (credentials: AuthCredentials) => {
          const tempApi = new GreenApiService(credentials);
          
          const isValid = await tempApi.validateCredentials();
          
          if (!isValid) {
              throw new Error('Неверный ID аккаунта или токен. Убедитесь, что инстанс активен.');
          }

          
          await tempApi.initHttpApi();
          
          localStorage.setItem('idInstance', credentials.idInstance);
          localStorage.setItem('apiTokenInstance', credentials.apiTokenInstance);
          router.navigate('/chat');
        }} 
      />
    ),
    loader: authLoader,
  },
  {
    path: '/chat',
    element: <ChatLayout />,
    loader: protectedLoader,
  },
  {
    path: '*',
    loader: () => redirect('/'),
  }
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
