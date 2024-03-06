import * as testi from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';

import useImageNetData from '@/lib/hooks/data/useImageNetData';
import useModelData, {
  useModelDataDimensions
} from '@/lib/hooks/data/useModelData';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import useTfjsML from '@/lib/hooks/ml/tfjs/useTfjs';
import usePerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelInputPrecision } from '@/lib/types';

const TfJs = () => {
  const [modelType, setModelType] = useState<Model>('ssd_mobilenet');

  const inputDimenions = useModelDataDimensions(modelType);

  const { data } = useModelData({
    dataPrecision: 'int32',
    model: modelType,
    maxAmount: 20
  });

  const tfjs = useTfjsML({ model: modelType });

  const usedData = data?.map((d) => {
    return tf.tensor3d(d.array, [...inputDimenions]);
  });

  const mobileNetEvaluator = usePerformanceEvaluator({
    mlModel: tfjs.mobilenet
      ? {
          run: async (data) => {
            await tfjs.mobilenet!.classify(data);
          }
        }
      : null,
    data: usedData || null
  });

  const ssdMobilenetEvaluator = usePerformanceEvaluator({
    mlModel: tfjs.ssd_mobilenet
      ? {
          run: async (data) => {
            await tfjs.ssd_mobilenet!.detect(data);
          }
        }
      : null,
    data: usedData || null
  });

  return (
    <View>
      <PerformanceEvaluatingScreen
        modelTypeProps={{
          value: modelType,
          onChange: (value) => setModelType(value)
        }}
        performanceEvaluator={
          modelType === 'mobilenet' ? mobileNetEvaluator : ssdMobilenetEvaluator
        }
        loadingData={!data}
        loadingModel={!tfjs.mobilenet || !tfjs.ssd_mobilenet}
        modelLoadError={null}
      />
    </View>
  );
};

export default TfJs;
