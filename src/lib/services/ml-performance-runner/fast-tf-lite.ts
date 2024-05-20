import { Delegate } from '../resultService';
import { TypedArray } from '@tensorflow/tfjs';
import { TensorflowModel, loadTensorflowModel } from 'react-native-fast-tflite';

import { createMLPerformanceRunnerService } from './common';
import { fetchDataInChunks } from './common/util';
import { LoadModelOptions } from './types';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import { ModelInputPrecision } from '@/lib/types';

const models: Record<Model, Record<ModelInputPrecision, any>> = {
  mobilenetv2: {
    uint8: require('../../../../assets/models/mlperf/tf-lite/mobilenetv2_uint8.tflite'),
    float32: require('../../../../assets/models/mlperf/tf-lite/mobilenetv2_float32.tflite')
  },
  mobilenet_edgetpu: {
    uint8: require('../../../../assets/models/mlperf/tf-lite/mobilenet_edgetpu_224_1.0_uint8.tflite'),
    float32: require('../../../../assets/models/mlperf/tf-lite/mobilenet_edgetpu_224_1.0_float32.tflite')
  },
  ssd_mobilenet: {
    uint8: require('../../../../assets/models/mlperf/tf-lite/ssd_mobilenet_v2_300_uint8.tflite'),
    float32: require('../../../../assets/models/mlperf/tf-lite/ssd_mobilenet_v2_300_float.tflite')
  },
  deeplabv3: {
    uint8: require('../../../../assets/models/mlperf/tf-lite/deeplabv3_mnv2_ade20k_uint8.tflite'),
    float32: require('../../../../assets/models/mlperf/tf-lite/deeplabv3_mnv2_ade20k_float.tflite')
  }
};

const createFastTfLiteMLPerformanceRunnerService = () => {
  const formatMobileNetOutput = function (output: any) {
    const typedResult = output[0];
    // need to do the conversion because the result is a TypedArray
    let numberArray: number[] = [];
    for (let i = 0; i < typedResult.length; i++) {
      const curr = typedResult[i];
      numberArray.push(new Number(curr).valueOf());
    }

    return numberArray;
  };
  return createMLPerformanceRunnerService<TensorflowModel, any, TypedArray[]>({
    libraryName: 'react-native-fast-tflite',
    libraryDelegates: [Delegate.COREML, Delegate.METAL, Delegate.OPENGL],
    loadModelAsync: async function (
      options: LoadModelOptions
    ): Promise<TensorflowModel> {
      const r = await loadTensorflowModel(
        models[options.model][options.inputPrecision],
        options.delegate === Delegate.OPENGL
          ? 'default'
          : options.delegate === Delegate.COREML
            ? 'core-ml'
            : 'metal'
      );
      return r;
    },
    getFormattedInputsAsync: async function (
      options,
      _model,
      dataOptions
    ): Promise<any[]> {
      const d = await fetchDataInChunks({
        maxAmount: dataOptions.maxAmount,
        model: options.model,
        inputPrecision: options.inputPrecision
      });

      return d.map((d) => [d.array]);
    },
    formatData: function (data, _loadModelOptions, _model) {
      return [data.array];
    },
    runInfereceAsync: async function (
      model: TensorflowModel,
      data: any
    ): Promise<any> {
      return model.runSync(data);
    },
    closeModelAsync: async function (_model: TensorflowModel): Promise<void> {
      return;
    },
    outputFormatting: {
      formatMobileNetEdgeTPUOutput: function (
        output: any,
        _model: TensorflowModel
      ) {
        return formatMobileNetOutput(output);
      },
      formatMobileNetOutput: function (output: any, model: TensorflowModel) {
        return formatMobileNetOutput(output);
      },
      formatSSDMobileNetOutput: function (output, model: TensorflowModel) {
        const typedResult = output;

        let result: [number[], number[], number[], number[]] = [[], [], [], []];
        typedResult.forEach((r, index) => {
          for (let i = 0; i < r.length; i++) {
            const curr = r[i];
            result[index].push(new Number(curr).valueOf());
          }
        });

        return result;
      },
      formatDeepLabV3Output: function (_output: any, _model: TensorflowModel) {
        return [];
      }
    }
  });
};

export const fastTfLiteMLPerformanceRunnerService =
  createFastTfLiteMLPerformanceRunnerService();
