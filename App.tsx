import { NavigationContainer } from '@react-navigation/native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
