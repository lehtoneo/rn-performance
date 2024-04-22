import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import * as ort from 'onnxruntime-react-native';
import { useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';
import PerformanceRunnerScreen from '@/components/performance-evaluating/PerformanceRunnerScreen';
import RadioGroup from '@/components/tests/radio-group';

import useModelData, {
  useModelDataDimensions
} from '@/lib/hooks/data/useModelData';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import useOnnxRuntime, {
  OnnxRuntimeExecutionProvider
} from '@/lib/hooks/ml/onnx-runtime/useOnnxRuntime';
import { useMLPerformanceSpeedRunner } from '@/lib/hooks/performance/useMLPerformanceSpeedRunner';
import useMLPerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { onnxMLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/onnxruntime';
import { Delegate, resultService } from '@/lib/services/resultService';
import { ModelInputPrecision } from '@/lib/types';
import validationUtil from '@/lib/util/validationUtil';

const Onnx = () => {
  const [modelType, setModelType] = useState<Model | null>(null);

  const [executionProvider, setExecutionProvider] =
    useState<OnnxRuntimeExecutionProvider>(OnnxRuntimeExecutionProvider.COREML);

  const [modelInputPrecision, setModelInputPrecision] =
    useState<ModelInputPrecision>('float32');

  const inputDimensions = useModelDataDimensions(modelType || 'mobilenetv2');

  const onnxRuntime = useOnnxRuntime({
    inputPrecision: modelInputPrecision,
    model: modelType || 'mobilenetv2',
    executionProvider: executionProvider
  });

  const d = useModelData({
    dataPrecision: modelInputPrecision,
    model: modelType,
    maxAmount: modelType === 'deeplabv3' ? 100 : 300
  });

  const usedData = onnxRuntime.model
    ? d.data?.map((d) => {
        const tensorA = new ort.Tensor(modelInputPrecision, d.array, [
          1,
          ...inputDimensions
        ]);

        const myObject: { [key: string]: any } = {
          [onnxRuntime.model!.inputNames![0]]: tensorA
        };
        return myObject;
      })
    : null;

  const ttt = useMLPerformanceEvaluator({
    mlModel: {
      run: async (data) => {
        return await onnxRuntime.model!.run(data);
      }
    },
    data: usedData || null,
    validateResult: async (o) => {
      const common = {
        inputIndex: o.index,
        precision: modelInputPrecision,
        library: 'onnxruntime',
        resultsId: o.runId,
        delegate: executionProvider as any
      };

      if (modelType === 'mobilenet_edgetpu' || modelType === 'mobilenetv2') {
        const t2 = onnxRuntime.model?.outputNames[0] || '';
        const t = o.result[t2] as any;
        const d = t.cpuData as number[];
        let numberArray = [];
        for (let i = 0; i < d.length; i++) {
          numberArray.push(new Number(d[i]).valueOf());
        }
        const r = await resultService.sendImageNetResults({
          ...common,
          output: numberArray,
          inferenceTimeMs: o.timeMs,
          model: modelType
        });
        return r?.correct === true;
      }

      if (modelType === 'ssd_mobilenet') {
        let results: any = [];
        onnxRuntime.model!.outputNames.forEach((name, index) => {
          const t = o.result[name] as any;
          const d = t.cpuData as number[];
          let numberArray = [];
          for (let i = 0; i < d.length; i++) {
            numberArray.push(new Number(d[i]).valueOf());
          }
          results.push(numberArray);
        });
        const r = await resultService.sendSSDMobilenetResults({
          ...common,
          output: results,
          inferenceTimeMs: o.timeMs,
          model: modelType
        });
        return r?.correct === true;
      }

      if (modelType === 'deeplabv3') {
        const r = await resultService.sendDeeplabv3Results({
          ...common,
          output: [],
          inferenceTimeMs: o.timeMs,
          model: modelType
        });
        return r?.correct === true;
      }
      return false;
    },
    options: {
      logResults: false
    }
  });

  const t = Object.values(OnnxRuntimeExecutionProvider);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <PerformanceRunnerScreen service={onnxMLPerformanceRunnerService} />

        <Text>{onnxRuntime.modelPath}</Text>
        {onnxRuntime.modelLoadError && (
          <Text
            style={{
              color: 'red'
            }}
          >
            Error loading model: {onnxRuntime.modelLoadError}
          </Text>
        )}

        <Text>Exection Provider</Text>
        <RadioGroup<OnnxRuntimeExecutionProvider>
          options={t.map((v) => {
            return {
              value: v,
              label: v
            };
          })}
          value={executionProvider}
          onChange={(value) => setExecutionProvider(value)}
        />
        <PerformanceEvaluatingScreen
          modelTypeProps={{
            value: modelType,
            onChange: setModelType
          }}
          modelInputPrecisionProps={{
            value: modelInputPrecision,
            onChange: setModelInputPrecision
          }}
          dataLoadError={d.error ? d.error.message : null}
          performanceEvaluator={ttt}
          modelLoadError={null}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default Onnx;
