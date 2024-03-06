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
import { TensorflowModelDelegate } from 'react-native-fast-tflite';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';
import RadioGroup from '@/components/tests/radio-group';

import useImageNetData from '@/lib/hooks/data/useImageNetData';
import useModelData from '@/lib/hooks/data/useModelData';
import useReactNativeFastTfLite, {
  Model
} from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import usePerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelInputPrecision } from '@/lib/types';
import { perfUtil } from '@/lib/util/performance';

export default function App(): React.ReactNode {
  const [modelInputPrecision, setModelInputPrecision] =
    React.useState<ModelInputPrecision>('uint8');
  const [delegate, setDelegate] =
    React.useState<TensorflowModelDelegate>('default');

  const [model, setModel] = React.useState<Model>('ssd_mobilenet');

  const fastTfLite = useReactNativeFastTfLite({
    model: model,
    type: modelInputPrecision,
    delegate: delegate
  });
  const imagenet = useModelData({
    dataPrecision: modelInputPrecision,
    model: model,
    maxAmount: 20
  });

  const test = usePerformanceEvaluator({
    mlModel: fastTfLite.model || null,
    data: imagenet.data?.map((d) => [d.array]) || null
  });

  const avg = test.results.reduce((a, b) => a + b, 0) / test.results.length;
  return (
    <View style={styles.container}>
      <Link href={{ pathname: '/fast-tf-lite/show-results' }}>
        <View>
          <Text>See results</Text>
        </View>
      </Link>

      <Text>Delegate</Text>
      <RadioGroup<TensorflowModelDelegate>
        options={[
          {
            label: 'default',
            value: 'default'
          },
          {
            label: 'core-ml',
            value: 'core-ml'
          },
          {
            label: 'metal',
            value: 'metal'
          }
        ]}
        value={delegate}
        onChange={(value) => setDelegate(value)}
      />

      <PerformanceEvaluatingScreen
        modelTypeProps={{
          value: model,
          onChange: setModel
        }}
        modelLoadError={fastTfLite.error ? 'Error loading model' : null}
        performanceEvaluator={test}
        modelInputPrecisionProps={{
          value: modelInputPrecision,
          onChange: setModelInputPrecision
        }}
        loadingData={!imagenet.data}
        loadingModel={!fastTfLite.model}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8
  }
});
