import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';
import { OrderDetailsModal } from './components/OrderDetailsModal';

export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
      <OrderDetailsModal />
    </AppProvider>
  );
}