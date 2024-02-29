import { useQuery } from '@tanstack/react-query';
import { Buffer } from 'buffer';
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
import { useResizePlugin } from 'vision-camera-resize-plugin';

import useReactNativeFastTfLite from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import dataService, { ImageNetQuery } from '@/lib/services/dataService';
import { imageNetLabels } from '@/lib/util/imagenet_labels';
import imagesUtil from '@/lib/util/images';

export default function App(): React.ReactNode {
  const [predictionIndex, setPredictionIndex] = React.useState<number>(0);

  const [predictions, setPredictions] = React.useState<string[]>([]);
  const prediction = imageNetLabels[predictionIndex];
  const t = useReactNativeFastTfLite({ model: 'mobilenet_224_uint8' });

  const queryVars: ImageNetQuery = { amount: 10, skip: 0, type: 'uint8' };

  const d = useQuery({
    queryKey: ['imageNetData', queryVars],
    queryFn: async () => {
      const d = await dataService.fetchImageNetData(queryVars);

      return d;
    }
  });
  // from https://www.kaggle.com/models/tensorflow/efficientdet/frameworks/tfLite
  const model = t.model;

  const { resize } = useResizePlugin();

  const firstVal = d.data?.[0];
  return (
    <View style={styles.container}>
      {!d.data ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button
          title="Moi"
          onPress={async () => {
            setPredictions([]);
            let i = 0;

            while (i < d.data.length) {
              const data = d.data[i];
              const r = await t.actualModel?.run([data.array]);
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
