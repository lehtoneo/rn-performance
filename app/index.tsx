import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const Test = () => {
  return (
    <View>
      <Link
        href={{
          pathname: '/sddj'
        }}
      >
        Test
      </Link>
      <Text>Moi</Text>
    </View>
  );
};

export default Test;
