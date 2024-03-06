import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from '@tanstack/react-query';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const [tfReady, setTfReady] = useState(false);
  useEffect(() => {
    (async () => {
      await tf.ready();
      setTfReady(true);
    })();
  }, []);
  if (!tfReady) {
    return null;
  }
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
