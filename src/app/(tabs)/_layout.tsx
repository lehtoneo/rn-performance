import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          header: () => null
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'Moi' }} />
      </Tabs>
    </SafeAreaView>
  );
};

export default RootLayout;
