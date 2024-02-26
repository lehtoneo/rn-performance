import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FastTFLiteMain from '../../screens/fast-tf-lite';
import ImageScreen from '../../screens/image';
import MainScreen from '../../screens/main';
import Toxicity from '../../screens/toxicity';

export type MainNavigatorStackParamList = {
  Main: undefined;
  Toxicity: undefined;
  Image: undefined;
  'fast-tf-lite': undefined;
};

const Stack = createNativeStackNavigator<MainNavigatorStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Toxicity" component={Toxicity} />
      <Stack.Screen name="Image" component={ImageScreen} />

      <Stack.Group>
        <Stack.Screen name="fast-tf-lite" component={FastTFLiteMain} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default MainNavigator;
