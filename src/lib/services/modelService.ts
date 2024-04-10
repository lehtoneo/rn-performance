import { ModelInputPrecision } from '../types';

import { localIP } from './dataService';

import { Model } from '../hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

const baseDataUrl = `http://${localIP}:3000`;

const getModelName = (model: Model) => {
  switch (model) {
    case 'mobilenetv2':
      return 'mobilenetv2';
    case 'mobilenet_edgetpu':
      return 'mobilenet_edgetpu_224_1.0';
    case 'ssd_mobilenet':
      return 'ssd_mobilenet_v2_300';
    case 'deeplabv3':
      return 'deeplabv3_mnv2_ade20k';
  }
};

const createModelService = (uri: string) => {
  const loadModelAsync = async (
    model: Model,
    inputPrecision: ModelInputPrecision,
    format: 'onnx' | 'tflite'
  ) => {
    const fullModelname = `${getModelName(model)}_${inputPrecision}.${format}`;
    const url = `${uri}/models/${format}/${fullModelname}`;
    const r = await fetch(url);
    const buffer = await r.arrayBuffer();
    console.log({ buffer });
    return buffer;
  };

  return {
    loadModelAsync
  };
};

export const modelService = createModelService(baseDataUrl);
