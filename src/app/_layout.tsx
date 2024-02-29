import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from '@tanstack/react-query';
import { Stack } from 'expo-router';

const queryClient = new QueryClient();

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          header: () => null
        }}
      />
    </QueryClientProvider>
  );
};

export default RootLayout;
