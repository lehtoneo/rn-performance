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
import useReactNativeFastTfLite from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import usePerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelPrecision } from '@/lib/types';
import { perfUtil } from '@/lib/util/performance';

export default function App(): React.ReactNode {
  const [modelPresicion, setModelPrecision] =
    React.useState<ModelPrecision>('uint8');
  const [delegate, setDelegate] =
    React.useState<TensorflowModelDelegate>('default');
  const fastTfLite = useReactNativeFastTfLite({
    model: 'mobilenet',
    type: modelPresicion,
    delegate: delegate
  });
  const imagenet = useImageNetData(modelPresicion);
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
        modelLoadError={fastTfLite.error ? 'Error loading model' : null}
        performanceEvaluator={test}
        modelPrecisionProps={{
          value: modelPresicion,
          onChange: setModelPrecision
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
