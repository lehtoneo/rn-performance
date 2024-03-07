import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import * as ort from 'onnxruntime-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';

import useModelData, {
  useModelDataDimensions
} from '@/lib/hooks/data/useModelData';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import useOnnxRuntime from '@/lib/hooks/ml/onnx-runtime/useOnnxRuntime';
import useMLPerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelInputPrecision } from '@/lib/types';
import validationUtil from '@/lib/util/validationUtil';

const Onnx = () => {
  const [modelType, setModelType] = useState<Model>('mobilenet');

  const [modelInputPrecision, setModelInputPrecision] =
    useState<ModelInputPrecision>('uint8');

  const inputDimensions = useModelDataDimensions(modelType);

  const onnxRuntime = useOnnxRuntime({
    inputPrecision: modelInputPrecision,
    model: modelType
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
    validateResult: (o) => {
      if (modelType === 'mobilenet') {
        const t2 = onnxRuntime.model?.outputNames[0] || '';
        const t = o.result[t2] as any;
        const d = t.cpuData as number[];
        return validationUtil.validateMobileNet({
          result: d,
          index: o.index
        });
      }
      return false;
    },
    options: {
      logResults: false
    }
  });

  return (
    <View style={styles.container}>
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
        loadingData={!d.data}
        loadingModel={!onnxRuntime.model}
        modelLoadError={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {}
});

export default Onnx;
