import { Button, Text, View } from 'react-native';

import { useMainStackNavigation } from '../hooks/nav';

const MainScreen = () => {
  const nav = useMainStackNavigation();
  return (
    <View>
      <Button title="Go to Toxicity" onPress={() => nav.navigate('Toxicity')} />

      <Button title="Go to Image" onPress={() => nav.navigate('Image')} />
    </View>
  );
};

export default MainScreen;
