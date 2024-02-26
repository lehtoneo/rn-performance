import { Button, Text, View } from 'react-native';

import { useMainStackNavigation } from '../hooks/nav';

const MainScreen = () => {
  const nav = useMainStackNavigation();
  return (
    <View>
      <Button title="Go to Toxicity" onPress={() => nav.navigate('Toxicity')} />

      <Button title="Go to Image" onPress={() => nav.navigate('Image')} />

      <Button
        title="Go to fast tf lite"
        onPress={() => nav.navigate('fast-tf-lite')}
      />
    </View>
  );
};

export default MainScreen;
