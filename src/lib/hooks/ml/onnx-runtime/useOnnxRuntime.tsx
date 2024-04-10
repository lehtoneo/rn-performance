import { Model } from '../fast-tf-lite/useReactNativeFastTfLite';
import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import { useEffect, useRef, useState } from 'react';

import { ModelInputPrecision } from '@/lib/types';

const models: Record<Model, Record<ModelInputPrecision, any>> = {
  mobilenetv2: {
    uint8: require('../../../../../assets/models/mlperf/onnx/mobilenetv2_uint8.onnx'),
    float32: require('../../../../../assets/models/mlperf/onnx/mobilenetv2_float32.onnx')
  },
  mobilenet_edgetpu: {
    uint8: require('../../../../../assets/models/mlperf/onnx/mobilenet_edgetpu_224_1.0_uint8.onnx'),
    float32: require('../../../../../assets/models/mlperf/onnx/mobilenet_edgetpu_224_1.0_float32.onnx')
  },
  ssd_mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/onnx/ssd_mobilenet_v2_300_uint8.onnx'),
    float32: require('../../../../../assets/models/mlperf/onnx/ssd_mobilenet_v2_300_float.onnx')
  },
  deeplabv3: {
    uint8: require('../../../../../assets/models/mlperf/onnx/deeplabv3_mnv2_ade20k_uint8.onnx'),
    float32: require('../../../../../assets/models/mlperf/onnx/deeplabv3_mnv2_ade20k_float.onnx')
  }
};

export enum OnnxRuntimeExecutionProvider {
  NNAPI = 'nnapi',
  CPU = 'cpu',
  COREML = 'core_ml',
  XXNPACK = 'xnnpack'
}

const useOnnxRuntime = (opts: {
  model: Model;
  inputPrecision: ModelInputPrecision;
  executionProvider: OnnxRuntimeExecutionProvider;
}) => {
  const modelRef = useRef<InferenceSession | undefined>(undefined);
  const [model, setModel] = useState<InferenceSession | undefined>(undefined);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const [modelPath, setModelPath] = useState<string | null>(null);

  useEffect(() => {
    const setupModel = async () => {
      setModel(undefined);
      setModelLoadError(null);
      setModelPath(null);
      modelRef.current = undefined;
      console.log('??');
      const model = models[opts.model][opts.inputPrecision];
      const assets = await Asset.loadAsync(
        require('../../../../../assets/models/mlperf/onnx/mobilenetv2_float32.onnx')
      );
      const uri = assets[0].localUri;
      if (!uri) {
        throw new Error(`Failed to get modelURI`);
      }
      setModelPath(uri);
      try {
        const session = await InferenceSession.create(uri, {
          executionProviders: [
            opts.executionProvider === OnnxRuntimeExecutionProvider.COREML
              ? 'coreml'
              : opts.executionProvider
          ]
        });
        modelRef.current = session;
        setModel(session);
      } catch (e: any) {
        setModelLoadError(e.message);
      }
    };
    setupModel();
  }, [opts.model, opts.inputPrecision, opts.executionProvider]);

  console.log(model?.inputNames);

  return {
    model: modelRef.current,
    modelLoadError,
    modelPath
  };
};

export default useOnnxRuntime;
