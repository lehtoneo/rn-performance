import { Link } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Button,
  ScrollView,
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

export default function App(): React.ReactNode {
  const [modelInputPrecision, setModelInputPrecision] =
    React.useState<ModelInputPrecision>('float32');
  const [delegate, setDelegate] = React.useState<FastTFLiteModelDelegate>(
    FastTFLiteModelDelegate.DEFAULT
  );

  const [model, setModel] = React.useState<Model | null>(null);

  const fastTfLite = useReactNativeFastTfLite({
    model: model || 'mobilenetv2',
    type: modelInputPrecision,
    delegate: delegate
  });
  const modelData = useModelData({
    dataPrecision: modelInputPrecision,
    model: model,
    maxAmount: 300
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
        library: 'react-native-fast-tflite',
        resultsId: o.runId,
        inferenceTimeMs: o.timeMs,
        model: model || 'mobilenetv2',
        delegate: delegate
      };
      if (model === 'mobilenetv2' || model === 'mobilenet_edgetpu') {
        const typedResult = o.result[0];
        const t = o.result[0] as unknown as number[];
        // need to do the conversion because the result is a TypedArray
        let numberArray: number[] = [];
        for (let i = 0; i < t.length; i++) {
          const curr = typedResult[i];
          numberArray.push(new Number(curr).valueOf());
        }
        const t2 = await resultService.sendImageNetResults({
          ...commonInputs,
          output: numberArray
        });

        return t2?.correct === true;
      } else if (model === 'ssd_mobilenet') {
        const typedResult = o.result;

        let result: [number[], number[], number[], number[]] = [[], [], [], []];
        typedResult.forEach((r, index) => {
          for (let i = 0; i < r.length; i++) {
            const curr = r[i];
            result[index].push(new Number(curr).valueOf());
          }
        });

        const r = await resultService.sendSSDMobilenetResults({
          ...commonInputs,
          output: result
        });
        return r?.correct === true;
      } else if (model === 'deeplabv3') {
        const typedResult = o.result[0];
        console.log(typedResult.length);
        let results: number[] = [];
        for (let i = 0; i < typedResult.length; i++) {
          const curr = typedResult[i];
          results.push(new Number(curr).valueOf());
        }

        // reshape to 512x512
        let r: number[][] = [];
        for (let i = 0; i < 512; i++) {
          r.push(results.slice(i * 512, (i + 1) * 512));
        }

        await resultService.sendDeeplabv3Results({
          ...commonInputs,
          output: results
        });
      }

      return false;
    },
    data: modelData.data ? modelData.data.map((d) => [d.array]) : null
  });

  return (
    <View style={styles.container}>
      <ScrollView>
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
            onChange: (value) => value && setModel(value as Model)
          }}
          modelLoadError={fastTfLite.error ? 'Error loading model' : null}
          performanceEvaluator={perfEvaluator}
          modelInputPrecisionProps={{
            value: modelInputPrecision,
            onChange: setModelInputPrecision
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8
  }
});
