import { Button, Text, View } from 'react-native';

import useReactNativeFastTfLite from '@/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

const FastTFLite = () => {
  const t = useReactNativeFastTfLite();
  return (
    <View>
      <Text>FastTFLite</Text>

      {t.isReady && <Button title="Test" onPress={t.doInference} />}
    </View>
  );
};

export default FastTFLite;
