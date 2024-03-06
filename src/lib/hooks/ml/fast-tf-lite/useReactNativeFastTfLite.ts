import React from 'react';
import {
  Tensor,
  TensorflowModel,
  TensorflowModelDelegate,
  useTensorflowModel
} from 'react-native-fast-tflite';

import { ModelPrecision } from '@/lib/types';

type Model = 'mobilenet' | 'ssd_mobilenet';

const models: Record<Model, Record<ModelPrecision, any>> = {
  mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/tf-lite/mobilenet_edgetpu_224_1.0_uint8.tflite'),
    float32: require('../../../../../assets/models/mlperf/tf-lite/mobilenet_edgetpu_224_1.0_float32.tflite')
  },
  ssd_mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/tf-lite/ssd_mobilenet_v2_300_uint8.tflite'),
    float32: require('../../../../../assets/models/mlperf/tf-lite/ssd_mobilenet_v2_300_float.tflite')
  }
};

const useReactNativeFastTfLite = (opts: {
  model: Model;
  type: ModelPrecision;
  delegate?: TensorflowModelDelegate;
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
