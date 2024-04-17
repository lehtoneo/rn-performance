import { FetchImageNetResult } from '../dataService';
import { modelService } from '../modelService';
import { Delegate } from '../resultService';
import { InferenceSession } from 'onnxruntime-react-native';
import * as ort from 'onnxruntime-react-native';

import {
  LoadModelOptions,
  createMLPerformanceRunnerService,
  fetchDataInChunks,
  getFetchFn
} from './common';

import { getModelDataDimensions } from '../../hooks/data/useModelData';

export const onnxMLPerformanceRunnerService = createMLPerformanceRunnerService<
  InferenceSession,
  any,
  any
>({
  libraryName: 'onnxruntime',
  libraryDelegates: [
    Delegate.NNAPI,
    Delegate.CPU,
    Delegate.COREML,
    Delegate.XNNPACK
  ],
  loadModelAsync: async (options: LoadModelOptions) => {
    const model = await modelService.loadModelAsync(
      options.model,
      options.inputPrecision,
      'onnx'
    );

    try {
      const session = await InferenceSession.create(model, {
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
