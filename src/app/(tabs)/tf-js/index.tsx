import * as testi from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';

import { tfJSMobileNetUtil } from './util/mobilenet';
import useModelData, {
  useModelDataDimensions
} from '@/lib/hooks/data/useModelData';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import useTfjsML from '@/lib/hooks/ml/tfjs/useTfjs';
import useMLPerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { resultService } from '@/lib/services/resultService';
import { ModelInputPrecision } from '@/lib/types';

const TfJs = () => {
  const [modelType, setModelType] = useState<Model>('ssd_mobilenet');

  const inputDimenions = useModelDataDimensions(modelType);

  const { data } = useModelData({
    dataPrecision: 'int32',
    model: modelType,
    maxAmount: 300
  });

  const tfjs = useTfjsML();

  const usedData = data?.map((d) => {
    return tf.tensor3d(d.array, [...inputDimenions]);
  });

  const mobileNetEvaluator = useMLPerformanceEvaluator({
    mlModel: tfjs.mobilenet
      ? {
          run: async (data) => {
            return await tfjs.mobilenet!.classify(data);
          }
        }
      : null,
    validateResult: async (o) => {
      const t = tfJSMobileNetUtil.classToIndex(o.result[0].className);
      let result = new Array(1000).fill(0);
      result[t + 1] = 1;
      const r = await resultService.sendImageNetResults({
        output: result,
        library: 'tfjs',
        precision: 'uint8',
        resultsId: o.runId,
        inferenceTimeMs: o.timeMs,
        inputIndex: o.index,
        model: modelType,
        delegate: 'webgl'
      });
      return r?.correct === true;
    },
    data: usedData || null
  });

  const ssdMobilenetEvaluator = useMLPerformanceEvaluator({
    mlModel: tfjs.ssd_mobilenet
      ? {
          run: async (data) => {
            return await tfjs.ssd_mobilenet!.detect(data);
          }
        }
      : null,
    validateResult: async (o) => {
      console.log(o.result);
      return false;
    },
    data: usedData || null
  });

  const deepLabEvaluator = useMLPerformanceEvaluator({
    mlModel: tfjs.deeplabv3
      ? {
          run: async (data) => {
            return await tfjs.deeplabv3!.segment(data);
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
        modelLoadError={null}
      />
    </View>
  );
};

export default TfJs;
