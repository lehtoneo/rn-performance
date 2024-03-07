import * as React from 'react';
import {
  ActivityIndicator,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import useModelData from '@/lib/hooks/data/useModelData';
import useReactNativeFastTfLite from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import { imageNetLabels } from '@/lib/util/imagenet_labels';

export default function App(): React.ReactNode {
  const [predictions, setPredictions] = React.useState<string[]>([]);
  const t = useReactNativeFastTfLite({ model: 'mobilenet', type: 'uint8' });
  const d = useModelData({
    model: 'mobilenet',
    dataPrecision: 'uint8',
    maxAmount: 30
  });

  return (
    <View style={styles.container}>
      {!d.data ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button
          title="Run predictions"
          onPress={async () => {
            setPredictions([]);
            let i = 0;

            while (i < d.data.length) {
              const data = d.data[i];
              const r = await t.model?.run([data.array]);
              if (r) {
                const pred = r[0] as unknown as number[];
                const max = Math.max(...pred);
                console.log({ max });
                const maxIndex = pred.indexOf(max);
                setPredictions((prev) => {
                  return [...prev, imageNetLabels[maxIndex - 1]];
                });
              }
              i++;
            }
          }}
        />
      )}
      <ScrollView>
        {d.data &&
          d.data.map((d, index) => {
            const base64 = d.base64;
            const pred = predictions[index];
            return (
              <View key={index}>
                <Image
                  key={index}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: 'cover'
                  }}
                  source={{
                    uri: `data:image/jpeg;base64,${base64}`
                  }}
                />
                <Text>{pred}</Text>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
