import { NavigationContainer } from '@react-navigation/native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { useEffect } from 'react';

import MainNavigator from './src/navigators/main';

export default function App() {
  useEffect(() => {
    const checkTfReady = async () => {
      await tf.ready();
      console.log('TF ready');
    };
    checkTfReady();
  }, []);
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}
