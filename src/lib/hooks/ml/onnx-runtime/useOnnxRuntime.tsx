import { Model } from '../fast-tf-lite/useReactNativeFastTfLite';
import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import { useEffect, useRef, useState } from 'react';

import { ModelInputPrecision } from '@/lib/types';

const models: Record<Model, Record<ModelInputPrecision, any>> = {
  mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/onnx/mobilenet_edgetpu_224_1.0_uint8.onnx'),
    float32: require('../../../../../assets/models/mlperf/onnx/mobilenet_edgetpu_224_1.0_float32.onnx')
  },
  ssd_mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/onnx/ssd_mobilenet_v2_300_uint8.onnx'),
    float32: require('../../../../../assets/models/mlperf/onnx/ssd_mobilenet_v2_300_float.onnx')
  }
};

const useOnnxRuntime = (opts: {
  model: Model;
  inputPrecision: ModelInputPrecision;
}) => {
  const modelRef = useRef<InferenceSession | undefined>(undefined);
  const [model, setModel] = useState<InferenceSession | undefined>(undefined);

  useEffect(() => {
    const setupModel = async () => {
      setModel(undefined);
      modelRef.current = undefined;
      console.log('??');
      const model = models[opts.model][opts.inputPrecision];
      const asset = Asset.fromModule(model);
      if (!asset.localUri) {
        await asset.downloadAsync();
      }
      const session = await InferenceSession.create(asset.localUri!);
      modelRef.current = session;
      setModel(session);
    };
    setupModel();
  }, [opts.model, opts.inputPrecision]);

  console.log(model?.inputNames);

  return {
    model: model
  };
};

export default useOnnxRuntime;
