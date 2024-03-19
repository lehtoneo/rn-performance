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

import useModelData from '@/lib/hooks/data/useModelData';
import useReactNativeFastTfLite, {
  Model
} from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import useMLPerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { resultService } from '@/lib/services/resultService';
import { ModelInputPrecision } from '@/lib/types';
import { imageNetLabels } from '@/lib/util/imagenet_labels';
import { perfUtil } from '@/lib/util/performance';
import validationUtil from '@/lib/util/validationUtil';

export default function App(): React.ReactNode {
  const [modelInputPrecision, setModelInputPrecision] =
    React.useState<ModelInputPrecision>('uint8');
  const [delegate, setDelegate] =
    React.useState<TensorflowModelDelegate>('default');

  const [model, setModel] = React.useState<Model>('mobilenet');

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

  const perfEvaluator = useMLPerformanceEvaluator({
    mlModel: fastTfLite.model
      ? {
          run: async (data) => {
            const r = await fastTfLite.model!.run(data);
            return r;
          }
        }
      : null,
    validateResult: async (o) => {
      if (model === 'mobilenet') {
        const typedResult = o.result[0];
        const t = o.result[0] as unknown as number[];
        // need to do the conversion because the result is a TypedArray
        let numberArray: number[] = [];
        for (let i = 0; i < t.length; i++) {
          const curr = typedResult[i];
          numberArray.push(new Number(curr).valueOf());
        }
        await resultService.sendImageNetResults({
          inputIndex: o.index,
          precision: modelInputPrecision,
          library: 'fast-tf-lite',
          results: numberArray
        });
        return validationUtil.validateMobileNet({
          result: numberArray,
          index: o.index
        });
      }

      return false;
    },
    data: imagenet.data?.map((d) => [d.array]) || null
  });

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
        performanceEvaluator={perfEvaluator}
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
