import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Toxicity from '../../screens/toxicity';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Toxicity" component={Toxicity} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
