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
  FastTFLiteModelDelegate,
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
  const [delegate, setDelegate] = React.useState<FastTFLiteModelDelegate>(
    FastTFLiteModelDelegate.DEFAULT
  );

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
      const commonInputs = {
        inputIndex: o.index,
        precision: modelInputPrecision,
        library: 'fast-tf-lite',
        resultsId: 'fast-tf-lite',
        inferenceTimeMs: o.timeMs
      };
      if (model === 'mobilenet') {
        const typedResult = o.result[0];
        console.log({ o });
        const t = o.result[0] as unknown as number[];
        // need to do the conversion because the result is a TypedArray
        let numberArray: number[] = [];
        for (let i = 0; i < t.length; i++) {
          const curr = typedResult[i];
          numberArray.push(new Number(curr).valueOf());
        }
        const t2 = await resultService.sendImageNetResults({
          ...commonInputs,
          results: numberArray
        });

        return t2.correct === true;
      } else if (model === 'ssd_mobilenet') {
        const typedResult = o.result;

        let result: [number[], number[], number[], number[]] = [[], [], [], []];
        typedResult.forEach((r, index) => {
          for (let i = 0; i < r.length; i++) {
            const curr = r[i];
            result[index].push(new Number(curr).valueOf());
          }
        });

        await resultService.sendSSDMobilenetResults({
          ...commonInputs,
          results: result
        });
      } else if (model === 'deeplabv3') {
        const typedResult = o.result[0];

        let results: number[] = [];
        for (let i = 0; i < typedResult.length; i++) {
          const curr = typedResult[i];
          results.push(new Number(curr).valueOf());
        }
        await resultService.sendDeeplabv3Results({
          ...commonInputs,
          results: results
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
      <RadioGroup<FastTFLiteModelDelegate>
        options={Object.values(FastTFLiteModelDelegate).map((v) => {
          return {
            value: v,
            label: v
          };
        })}
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
