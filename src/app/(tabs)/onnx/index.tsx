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
import useOnnxRuntime from '@/lib/hooks/ml/onnx-runtime/useOnnxRuntime';
import usePerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelPrecision } from '@/lib/types';
import { imageNetLabels } from '@/lib/util/imagenet_labels';

const Onnx = () => {
  const [modelPrecision, setModelPrecision] = useState<ModelPrecision>('uint8');

  const t2 = useOnnxRuntime({
    type: modelPrecision,
    model: 'mobilenet'
  });

  const d = useImageNetData(modelPrecision, {
    maxAmount: 20
  });

  const usedData = d.data?.map((d) => {
    const tensorA = new ort.Tensor(modelPrecision, d.array, [1, 224, 224, 3]);

    const feeds =
      modelPrecision === 'uint8'
        ? { input: tensorA }
        : ({
            images: tensorA
          } as any);
    return feeds;
  });

  const ttt = usePerformanceEvaluator({
    mlModel: {
      run: async (data) => {
        await t2.model!.run(data);
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
        modelPrecisionProps={{
          value: modelPrecision,
          onChange: setModelPrecision
        }}
        performanceEvaluator={ttt}
        loadingData={!d.data}
        loadingModel={!t2.model}
        modelLoadError={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 8
  }
});

export default Onnx;
