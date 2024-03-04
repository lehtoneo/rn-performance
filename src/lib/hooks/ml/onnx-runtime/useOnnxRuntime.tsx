import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import { useEffect, useRef, useState } from 'react';

import { ModelType } from '@/lib/types';

type Model = 'mobilenet';

const models: Record<Model, Record<ModelType, any>> = {
  mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/onnx/mobilenet_edgetpu_224_1.0_uint8.onnx'),
    float32: require('../../../../../assets/models/mlperf/onnx/mobilenet_edgetpu_224_1.0_float32.onnx')
  }
};

const useOnnxRuntime = (opts: { model: Model; type: ModelType }) => {
  const modelRef = useRef<InferenceSession | undefined>(undefined);
  const [model, setModel] = useState<InferenceSession | undefined>(undefined);

  useEffect(() => {
    const setupModel = async () => {
      setModel(undefined);
      modelRef.current = undefined;
      console.log('??');
      const model = models[opts.model][opts.type];
      const asset = Asset.fromModule(model);
      if (!asset.localUri) {
        await asset.downloadAsync();
      }
      const session = await InferenceSession.create(asset.localUri!);
      modelRef.current = session;
      setModel(session);
    };
    setupModel();
  }, [opts.model, opts.type]);

  return {
    model: model
  };
};

export default useOnnxRuntime;
