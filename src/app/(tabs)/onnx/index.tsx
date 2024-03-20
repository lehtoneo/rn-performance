import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import * as ort from 'onnxruntime-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';
import RadioGroup from '@/components/tests/radio-group';

import useModelData, {
  useModelDataDimensions
} from '@/lib/hooks/data/useModelData';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import useOnnxRuntime, {
  OnnxRuntimeExecutionProvider
} from '@/lib/hooks/ml/onnx-runtime/useOnnxRuntime';
import useMLPerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { resultService } from '@/lib/services/resultService';
import { ModelInputPrecision } from '@/lib/types';
import validationUtil from '@/lib/util/validationUtil';

const Onnx = () => {
  const [modelType, setModelType] = useState<Model>('mobilenet');

  const [executionProvider, setExecutionProvider] =
    useState<OnnxRuntimeExecutionProvider>(OnnxRuntimeExecutionProvider.COREML);

  const [modelInputPrecision, setModelInputPrecision] =
    useState<ModelInputPrecision>('uint8');

  const inputDimensions = useModelDataDimensions(modelType);

  const onnxRuntime = useOnnxRuntime({
    inputPrecision: modelInputPrecision,
    model: modelType,
    executionProvider: executionProvider
  });

  const d = useModelData({
    dataPrecision: modelInputPrecision,
    model: modelType,
    maxAmount: 20
  });

  const usedData = onnxRuntime.model
    ? d.data?.map((d) => {
        const imgWidth = modelType === 'mobilenet' ? 224 : 300;
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
      if (modelType === 'mobilenet') {
        const t2 = onnxRuntime.model?.outputNames[0] || '';
        const t = o.result[t2] as any;
        const d = t.cpuData as number[];
        let numberArray = [];
        for (let i = 0; i < d.length; i++) {
          numberArray.push(new Number(d[i]).valueOf());
        }
        const r = await resultService.sendImageNetResults({
          results: numberArray,
          inputIndex: o.index,
          precision: modelInputPrecision,
          library: 'onnxruntime',
          resultsId: 'onnxruntime',
          inferenceTimeMs: o.timeMs
        });
        return r.correct === true;
      }
      return false;
    },
    options: {
      logResults: false
    }
  });

  const t = Object.values(OnnxRuntimeExecutionProvider);

  return (
    <View style={styles.container}>
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
        performanceEvaluator={ttt}
        modelLoadError={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});

export default Onnx;
