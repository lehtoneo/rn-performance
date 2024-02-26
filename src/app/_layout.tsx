import { Stack } from 'expo-router';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      screenOptions={{
        header: () => null
      }}
      initialRouteName="home"
    />
  );
};

export default RootLayout;
