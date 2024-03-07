import * as testi from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';

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

  const tfjs = useTfjsML();

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

  const deepLabEvaluator = usePerformanceEvaluator({
    mlModel: tfjs.deeplabv3
      ? {
          run: async (data) => {
            await tfjs.deeplabv3!.segment(data);
          }
        }
      : null,
    data: usedData || null
  });

  const usedEvaluator =
    modelType === 'mobilenet'
      ? mobileNetEvaluator
      : modelType === 'ssd_mobilenet'
        ? ssdMobilenetEvaluator
        : deepLabEvaluator;

  return (
    <View>
      <PerformanceEvaluatingScreen
        modelTypeProps={{
          value: modelType,
          onChange: (value) => setModelType(value)
        }}
        performanceEvaluator={usedEvaluator}
        loadingData={!data}
        loadingModel={!tfjs.mobilenet || !tfjs.ssd_mobilenet}
        modelLoadError={null}
      />
    </View>
  );
};

export default TfJs;
