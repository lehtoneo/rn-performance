import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const TabLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs />
    </SafeAreaView>
  );
};

export default TabLayout;
