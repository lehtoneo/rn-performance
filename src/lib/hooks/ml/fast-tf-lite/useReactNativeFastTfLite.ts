import React from 'react';
import {
  Tensor,
  TensorflowModel,
  useTensorflowModel
} from 'react-native-fast-tflite';

type Model = 'mobilenet_224_uint8';

const models: Record<Model, any> = {
  mobilenet_224_uint8: require('../../../../../assets/models/mlperf/mobilenet_edgetpu_224_1.0_uint8.tflite')
};

const getInfo = (
  model: Model
): {
  input: {
    scale: {
      width: number;
      height: number;
    };
    pixelFormat: 'rgb' | 'rgba' | 'argb' | 'bgra' | 'bgr' | 'abgr';
    dataType: 'uint8' | 'float32';
  };
} => {
  switch (model) {
    case 'mobilenet_224_uint8':
      return {
        input: {
          scale: {
            width: 224,
            height: 224
          },
          pixelFormat: 'rgb',
          dataType: 'uint8'
        }
      };
  }
};

const useReactNativeFastTfLite = (opts: { model: Model }) => {
  const model = useTensorflowModel(models[opts.model]);

  // see https://github.com/mrousavy/react-native-fast-tflite
  const actualModel = model.state === 'loaded' ? model.model : undefined;

  React.useEffect(() => {
    if (actualModel == null) return;
    console.log(`Model loaded! Shape:\n${modelToString(actualModel)}]`);
  }, [actualModel]);

  console.log(`Model: ${model.state} (${model.model != null})`);
  return {
    model,
    actualModel,
    info: getInfo(opts.model)
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
