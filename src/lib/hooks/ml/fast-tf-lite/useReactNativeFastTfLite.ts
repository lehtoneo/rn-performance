import React from 'react';
import {
  Tensor,
  TensorflowModel,
  useTensorflowModel
} from 'react-native-fast-tflite';

import { ModelType } from '@/lib/types';

type Model = 'mobilenet';

const models: Record<Model, Record<ModelType, any>> = {
  mobilenet: {
    uint8: require('../../../../../assets/models/mlperf/mobilenet_edgetpu_224_1.0_uint8.tflite'),
    float32: require('../../../../../assets/models/mlperf/mobilenet_edgetpu_224_1.0_float32.tflite')
  }
};

const useReactNativeFastTfLite = (opts: { model: Model; type: ModelType }) => {
  const model = useTensorflowModel(models[opts.model][opts.type]);

  React.useEffect(() => {
    if (!model.model) return;
    console.log(`Model loaded! Shape:\n${modelToString(model.model)}]`);
  }, [model.model]);

  console.log(`Model: ${model.state} (${model.model != null})`);
  return {
    model: model.model
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
