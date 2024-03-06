import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import * as ort from 'onnxruntime-react-native';
import { useEffect, useState } from 'react';
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';
import RadioGroup from '@/components/tests/radio-group';

import useImageNetData from '@/lib/hooks/data/useImageNetData';
import useModelData, {
  useModelDataDimensions
} from '@/lib/hooks/data/useModelData';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import useOnnxRuntime from '@/lib/hooks/ml/onnx-runtime/useOnnxRuntime';
import usePerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelInputPrecision } from '@/lib/types';
import { imageNetLabels } from '@/lib/util/imagenet_labels';

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

  const ttt = usePerformanceEvaluator({
    mlModel: {
      run: async (data) => {
        await onnxRuntime.model!.run(data);
      }
    },
    data: usedData || null,
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
