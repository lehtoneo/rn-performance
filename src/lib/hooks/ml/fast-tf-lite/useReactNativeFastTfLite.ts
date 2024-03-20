import React from 'react';
import {
  Tensor,
  TensorflowModel,
  TensorflowModelDelegate,
  useTensorflowModel
} from 'react-native-fast-tflite';

import { ModelInputPrecision } from '@/lib/types';

export type Model = 'mobilenet' | 'ssd_mobilenet' | 'deeplabv3';

const models: Record<Model, Record<ModelInputPrecision, any>> = {
  mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/tf-lite/mobilenet_edgetpu_224_1.0_uint8.tflite'),
    float32: require('../../../../../assets/models/mlperf/tf-lite/mobilenet_edgetpu_224_1.0_float32.tflite')
  },
  ssd_mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/tf-lite/ssd_mobilenet_v2_300_uint8.tflite'),
    float32: require('../../../../../assets/models/mlperf/tf-lite/ssd_mobilenet_v2_300_float.tflite')
  },
  deeplabv3: {
    uint8: require('../../../../../assets/models/mlperf/tf-lite/deeplabv3_mnv2_ade20k_uint8.tflite'),
    float32: require('../../../../../assets/models/mlperf/tf-lite/deeplabv3_mnv2_ade20k_float.tflite')
  }
};

export enum FastTFLiteModelDelegate {
  DEFAULT = 'default',
  CoreML = 'core-ml',
  METAL = 'metal'
}

const useReactNativeFastTfLite = (opts: {
  model: Model;
  type: ModelInputPrecision;
  delegate?: FastTFLiteModelDelegate;
}) => {
  const model = useTensorflowModel(
    models[opts.model][opts.type],
    opts.delegate
  );

  React.useEffect(() => {
    if (!model.model) return;
    console.log(`Model loaded! Shape:\n${modelToString(model.model)}]`);
  }, [model.model]);

  console.log(`Model: ${model.state} (${model.model != null})`);
  return {
    model: model.model,
    error: model.state === 'error'
  };
};

function tensorToString(tensor: Tensor): string {
  return `\n  - ${tensor.dataType} ${tensor.name}[${tensor.shape}]`;
}
function modelToString(model: TensorflowModel): string {
  return (
    `TFLite Model (${model.delegate}):\n` +
    `- Inputs: ${model.inputs.map(tensorToString).join('')}\n` +
    `- Outputs: ${model.outputs.map(tensorToString).join('')}`
  );
}

export default useReactNativeFastTfLite;
