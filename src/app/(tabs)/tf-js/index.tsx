import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import PerformanceEvaluatingScreen from '@/components/performance-evaluating/PeformanceEvaluatingScreen';

import useImageNetData from '@/lib/hooks/data/useImageNetData';
import usePerformanceEvaluator from '@/lib/hooks/performance/usePerformanceEvaluator';
import { ModelPrecision } from '@/lib/types';

const TfJs = () => {
  const [modelPrecision, setModelPrecision] = useState<ModelPrecision>('uint8');

  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);

  const { data } = useImageNetData(modelPrecision);

  useEffect(() => {
    (async () => {
      const model = await mobilenet.load();
      setModel(model);
    })();
  }, []);

  const usedData = data?.map((d) => {
    return tf.tensor3d(d.array, [224, 224, 3]);
  });

  const ttt = usePerformanceEvaluator({
    mlModel: model
      ? {
          run: async (data) => {
            await model.classify(data);
          }
        }
      : null,
    data: usedData || null
  });

  return (
    <View>
      <Text>Moi</Text>
      <PerformanceEvaluatingScreen
        modelPrecisionProps={{
          value: modelPrecision,
          onChange: setModelPrecision
        }}
        performanceEvaluator={ttt}
        loadingData={!data}
        loadingModel={!model}
        modelLoadError={null}
      />
    </View>
  );
};

export default TfJs;
