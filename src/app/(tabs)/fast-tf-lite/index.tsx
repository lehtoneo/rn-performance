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
    onReady: async (results) => {
      const commonInputs = {
        precision: modelInputPrecision,
        library: 'react-native-fast-tflite',
        model: model || 'mobilenetv2',
        delegate: delegate
      };

      switch (model) {
        case 'mobilenetv2' || 'mobilenet_edgetpu': {
          const f = results.map((r) => {
            const typedResult = r.fnResult![0];
            // need to do the conversion because the result is a TypedArray
            let numberArray: number[] = [];
            for (let i = 0; i < typedResult.length; i++) {
              const curr = typedResult[i];
              numberArray.push(new Number(curr).valueOf());
            }
            return {
              ...commonInputs,
              inputIndex: r.index,
              resultsId: r.runId,
              inferenceTimeMs: r.timeMs,
              output: numberArray
            };
          });

          await resultService.mobileNet.sendMultipleResults(f);
          break;
        }
        case 'ssd_mobilenet': {
          const f = results.map((r) => {
            const typedResult = r.fnResult!;

            let result: [number[], number[], number[], number[]] = [
              [],
              [],
              [],
              []
            ];
            typedResult.forEach((r, index) => {
              for (let i = 0; i < r.length; i++) {
                const curr = r[i];
                result[index].push(new Number(curr).valueOf());
              }
            });

            return {
              ...commonInputs,
              inputIndex: r.index,
              resultsId: r.runId,
              inferenceTimeMs: r.timeMs,
              output: result
            };
          });
          await resultService.ssdMobilenet.sendMultipleResults(f);
          break;
        }
        case 'deeplabv3': {
          const f = results.map((r) => {
            const typedResult = r.fnResult![0];
            let results: number[] = [];
            for (let i = 0; i < typedResult.length; i++) {
              const curr = typedResult[i];
              results.push(new Number(curr).valueOf());
            }

            return {
              ...commonInputs,
              inputIndex: r.index,
              resultsId: r.runId,
              inferenceTimeMs: r.timeMs,
              output: results
            };
          });

          await resultService.deeplabv3.sendMultipleResults(f);
          break;
        }
      }
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
