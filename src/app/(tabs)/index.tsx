import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const Test = () => {
  return (
    <View>
      <Link
        href={{
          pathname: '/home'
        }}
      >
        Test
      </Link>
      <Text>Moi</Text>
    </View>
  );
};

export default Test;
