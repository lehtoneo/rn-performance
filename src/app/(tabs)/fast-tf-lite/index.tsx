import { Link } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';

import RadioGroup from '@/components/tests/radio-group';

import useImageNetData from '@/lib/hooks/data/useImageNetData';
import useReactNativeFastTfLite from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import { ModelType } from '@/lib/types';
import { perfUtil } from '@/lib/util/performance';

export default function App(): React.ReactNode {
  const [modelType, setModelType] = React.useState<ModelType>('float32');

  const [results, setResults] = React.useState<number[]>([]);
  const [running, setRunning] = React.useState(false);
  const t = useReactNativeFastTfLite({ model: 'mobilenet', type: modelType });
  const d = useImageNetData(modelType);

  const runPredictions = async () => {
    if (!d.data || !t.model) {
      console.log({ d, t });
      return;
    }
    setRunning(true);
    let i = 0;

    let promises: (() => Promise<any>)[] = [];
    while (i < d.data.length) {
      const data = d.data[i];

      promises.push(async () => t.model!.run([data.array]));
      i++;
    }
    const r = await perfUtil.createMultipleAsyncPerformanceTests({
      name: 'run',
      fns: promises
    });

    console.log({ r });

    setResults(r.results.map((r) => r.time));
    setRunning(false);
  };

  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  return (
    <View style={styles.container}>
      <Link href={{ pathname: '/fast-tf-lite/show-results' }}>
        <View>
          <Text>See results</Text>
        </View>
      </Link>

      <RadioGroup<ModelType>
        options={[
          {
            label: 'uint8',
            value: 'uint8'
          },
          {
            label: 'float32',
            value: 'float32'
          }
        ]}
        value={modelType}
        onChange={(value) => setModelType(value)}
      />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Button
          title="Run predictions"
          onPress={runPredictions}
          disabled={running || !d.data || !t.model}
        />
        {d.isLoading && <Text>Loading data</Text>}
        {!t.model && <Text>Loading model...</Text>}
        {running && <ActivityIndicator size="large" color="#0000ff" />}
        {avg > 0 && <Text>Avg: {avg}ms</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 8
  }
});
