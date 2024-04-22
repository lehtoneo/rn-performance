import { FetchImageNetResult } from '../dataService';
import { modelService } from '../modelService';
import { Delegate } from '../resultService';
import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import * as ort from 'onnxruntime-react-native';
import { Platform } from 'react-native';

import { createMLPerformanceRunnerService } from './common';
import { fetchDataInChunks } from './common/util';
import { LoadModelOptions } from './types';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import { ModelInputPrecision } from '@/lib/types';

import { getModelDataDimensions } from '../../hooks/data/useModelData';

const models: Record<Model, Record<ModelInputPrecision, any>> = {
  mobilenetv2: {
    uint8: require('../../../../assets/models/mlperf/onnx/mobilenetv2_uint8.onnx'),
    float32: require('../../../../assets/models/mlperf/onnx/mobilenetv2_float32.onnx')
  },
  mobilenet_edgetpu: {
    uint8: require('../../../../assets/models/mlperf/onnx/mobilenet_edgetpu_224_1.0_uint8.onnx'),
    float32: require('../../../../assets/models/mlperf/onnx/mobilenet_edgetpu_224_1.0_float32.onnx')
  },
  ssd_mobilenet: {
    uint8: require('../../../../assets/models/mlperf/onnx/ssd_mobilenet_v2_300_uint8.onnx'),
    float32: require('../../../../assets/models/mlperf/onnx/ssd_mobilenet_v2_300_float.onnx')
  },
  deeplabv3: {
    uint8: require('../../../../assets/models/mlperf/onnx/deeplabv3_mnv2_ade20k_uint8.onnx'),
    float32: require('../../../../assets/models/mlperf/onnx/deeplabv3_mnv2_ade20k_float.onnx')
  }
};

const getModelAsync = async (options: LoadModelOptions) => {
  if (Platform.OS === 'ios') {
    return modelService.loadModelAsync(
      options.model,
      options.inputPrecision,
      'onnx'
    );
  } else if (Platform.OS === 'android') {
    const model = models[options.model][options.inputPrecision];
    const [{ localUri }] = await Asset.loadAsync(model);

    // Get the URI of the asset
    return localUri!;
  }
  throw new Error('Invalid platform');
};

export const onnxMLPerformanceRunnerService = createMLPerformanceRunnerService<
  InferenceSession,
  any,
  any
>({
  libraryName: 'onnxruntime-react-native',
  libraryDelegates: [
    Delegate.NNAPI,
    Delegate.CPU,
    Delegate.COREML,
    Delegate.XNNPACK
  ],
  loadModelAsync: async (options: LoadModelOptions) => {
    const model = await getModelAsync(options);

    try {
      const session = await InferenceSession.create(model as any, {
        executionProviders: [
          options.delegate === Delegate.COREML ? 'coreml' : options.delegate
        ]
      });

      return session;
    } catch (e: any) {
      console.log('Error loading model');
      console.log({ e });
      throw e;
    }
  },
  outputFormatting: {
    formatMobileNetEdgeTPUOutput: function (output, model) {
      const t2 = model.outputNames[0] || '';
      const t = output[t2] as any;
      const d = t.cpuData as number[];
      let numberArray = [];
      for (let i = 0; i < d.length; i++) {
        numberArray.push(new Number(d[i]).valueOf());
      }

      return numberArray;
    },
    formatMobileNetOutput: function (output, model) {
      const t2 = model.outputNames[0] || '';
      const t = output[t2] as any;
      const d = t.cpuData as number[];
      let numberArray = [];
      for (let i = 0; i < d.length; i++) {
        numberArray.push(new Number(d[i]).valueOf());
      }

      return numberArray;
    },
    formatSSDMobileNetOutput: function (output, model) {
      let results: any = [];
      model.outputNames.forEach((name, index) => {
        const t = output[name] as any;
        const d = t.cpuData as number[];
        let numberArray = [];
        for (let i = 0; i < d.length; i++) {
          numberArray.push(new Number(d[i]).valueOf());
        }
        results.push(numberArray);
      });
      return results;
    },
    formatDeepLabV3Output: function (_output) {
      return [];
    }
  },
  getFormattedInputsAsync: async function (
    options,
    model,
    dataOptions
  ): Promise<any[]> {
    const inputDimensions = getModelDataDimensions(options.model);

    const d = await fetchDataInChunks({
      maxAmount: dataOptions.maxAmount,
      model: options.model,
      inputPrecision: options.inputPrecision
    });
    const data = d;

    const usedData = data.map((d) => {
      const tensorA = new ort.Tensor(options.inputPrecision, d.array, [
        1,
        ...inputDimensions
      ]);

      const myObject: { [key: string]: any } = {
        [model!.inputNames![0]]: tensorA
      };
      return myObject;
    });
    return usedData;
  },
  runInfereceAsync: async function (model: InferenceSession, data: any) {
    return await model.run(data);
  },
  closeModelAsync: async function (model: InferenceSession): Promise<void> {
    model.endProfiling();
    await model.release();
  }
});
