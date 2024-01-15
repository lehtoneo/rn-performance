import { MainNavigatorStackParamList } from '../../navigators/main';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * MainStack Navigation
 */
export const useMainStackNavigation = () => {
  const nav =
    useNavigation<NativeStackNavigationProp<MainNavigatorStackParamList>>();

  return nav;
};
