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
import { ModelType } from '@/lib/types';
import { imageNetLabels } from '@/lib/util/imagenet_labels';

const Onnx = () => {
  const [modelType, setModelType] = useState<ModelType>('uint8');

  const t2 = useOnnxRuntime({
    type: modelType,
    model: 'mobilenet'
  });

  const d = useImageNetData(modelType, {
    maxAmount: 20
  });

  const ttt = usePerformanceEvaluator({
    mlModel: {
      run: async (data) => {
        const tensorA = new ort.Tensor(modelType, data, [1, 224, 224, 3]);

        const feeds =
          modelType === 'uint8'
            ? { input: tensorA }
            : ({
                images: tensorA
              } as any);

        await t2.model!.run(feeds);
      }
    },
    data: d.data?.map((d) => d.array) || null,
    options: {
      logResults: true
    }
  });

  return (
    <View style={styles.container}>
      <PerformanceEvaluatingScreen
        modelTypeProps={{
          value: modelType,
          onChange: setModelType
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
