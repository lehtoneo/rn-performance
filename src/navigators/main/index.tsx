import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ImageScreen from '../../screens/image';
import MainScreen from '../../screens/main';
import Toxicity from '../../screens/toxicity';

export type MainNavigatorStackParamList = {
  Main: undefined;
  Toxicity: undefined;
  Image: undefined;
};

const Stack = createNativeStackNavigator<MainNavigatorStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Toxicity" component={Toxicity} />
      <Stack.Screen name="Image" component={ImageScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
