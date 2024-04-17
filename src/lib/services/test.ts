import { ModelInputPrecision } from '../types';
import { InferenceSession } from 'onnxruntime-react-native';
import * as ort from 'onnxruntime-react-native';

import dataService, {
  CustomImageData,
  FetchImageNetResult,
  FetchImagesQuery
} from './dataService';
import { modelService } from './modelService';
import { Delegate, resultService } from './resultService';

import { getModelDataDimensions } from '../hooks/data/useModelData';
import { Model } from '../hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import { OnnxRuntimeExecutionProvider } from '../hooks/ml/onnx-runtime/useOnnxRuntime';

const getFetchFn = (model: Model | null) => {
  switch (model) {
    case 'mobilenetv2':
      return async (query: FetchImagesQuery) =>
        await dataService.fetchImageNetData(query, {
          formatFloat32fn: (d) => {
            return d / 127.5 - 1;
          }
        });
    case 'mobilenet_edgetpu':
      return async (query: FetchImagesQuery) =>
        await dataService.fetchImageNetData(query, {
          formatFloat32fn: (d) => d / 127.5 - 1
        });
    case 'ssd_mobilenet':
      return async (query: FetchImagesQuery) =>
        await dataService.fetchCocoData(query, {
          formatFloat32fn: (d) => d / 127.5 - 1
        });
    case 'deeplabv3':
      return dataService.fetckAde20kData;
    case null:
      return async () => [];
    default:
      throw new Error('Invalid model');
  }
};

type LoadModelOptions = {
  model: Model;
  inputPrecision: ModelInputPrecision;
  delegate: Delegate;
};

const loadModelOptionsEqual = (a: LoadModelOptions, b: LoadModelOptions) => {
  return (
    a.model === b.model &&
    a.inputPrecision === b.inputPrecision &&
    a.delegate === b.delegate
  );
};

function createMLPerformanceRunnerService<ModelT, DataT>(opts: {
  libraryName: string;
  loadModelAsync: (options: LoadModelOptions) => Promise<ModelT>;
  getFormattedInputsAsync: (
    options: LoadModelOptions,
    model: ModelT
  ) => Promise<DataT[]>;
  runInfereceAsync: (model: ModelT, data: DataT) => Promise<any>;
  closeModelAsync: (model: ModelT) => Promise<void>;
  outputFormatting: {
    formatMobileNetEdgeTPUOutput: (output: any, model: ModelT) => any;
    formatMobileNetOutput: (output: any, model: ModelT) => any;
    formatSSDMobileNetOutput: (output: any, model: ModelT) => any;
    formatDeepLabV3Output: (output: any, model: ModelT) => any;
  };
  onAfterInputRun?: (data: any) => Promise<any>;
}) {
  let _cachedData: DataT[] | null = null;
  let _cachedOptions: LoadModelOptions | null = null;

  const run = async (options: LoadModelOptions) => {
    const model = await opts.loadModelAsync(options);

    const resultsId = new Date().getTime().toString();

    const commonOpts = {
      resultsId: resultsId,
      model: options.model,
      precision: options.inputPrecision,
      delegate: options.delegate,
      library: opts.libraryName
    };

    const hasResults = await resultService.getHasResultsAlreadyAsync({
      ...commonOpts,
      inputIndex: 0,
      inferenceTimeMs: 0,
      output: []
    });

    console.log({ model });
    if (hasResults) {
      return 'ok';
    }

    const d =
      _cachedOptions &&
      loadModelOptionsEqual(options, _cachedOptions) &&
      _cachedData
        ? _cachedData
        : await opts.getFormattedInputsAsync(options, model);

    _cachedData = d;
    _cachedOptions = options;

    const results = [];
    var i = 0;
    for (const data of d) {
      const start = performance.now();
      const out = await opts.runInfereceAsync(model, data);
      const end = performance.now();

      const time = end - start;
      console.log({ time });

      var usedOut = out;

      switch (options.model) {
        case 'mobilenetv2':
          usedOut = opts.outputFormatting.formatMobileNetOutput(out, model);
          break;
        case 'mobilenet_edgetpu':
          usedOut = opts.outputFormatting.formatMobileNetEdgeTPUOutput(
            out,
            model
          );
          break;
        case 'ssd_mobilenet':
          usedOut = opts.outputFormatting.formatSSDMobileNetOutput(out, model);
          break;
        case 'deeplabv3':
          usedOut = opts.outputFormatting.formatDeepLabV3Output(out, model);
          break;
      }

      if (opts.onAfterInputRun) {
        await opts.onAfterInputRun(out);
      }

      results.push({
        ...commonOpts,
        output: usedOut,
        inferenceTimeMs: time,
        result: out,
        inputIndex: i
      });

      i++;
    }

    for (const r of results) {
      switch (options.model) {
        case 'mobilenetv2':
          await resultService.sendImageNetResults(r);
          break;
        case 'mobilenet_edgetpu':
          await resultService.sendImageNetResults(r);
          break;
        case 'ssd_mobilenet':
          await resultService.sendSSDMobilenetResults(r);
          break;
        case 'deeplabv3':
          await resultService.sendDeeplabv3Results(r);
          break;
      }
    }

    await opts.closeModelAsync(model);

    return 'ok';
  };

  const runForAllAsync = async () => {
    const models = [
      'mobilenetv2',
      'mobilenet_edgetpu',
      'ssd_mobilenet',
      'deeplabv3'
    ] as Model[];
    const precsisions = ['float32', 'int8'] as ModelInputPrecision[];
    const delegates = Object.values(Delegate);

    for (const model of models) {
      for (const precision of precsisions) {
        for (const delegate of delegates) {
          var i = 0;
          while (i < 1) {
            try {
              await run({ model, inputPrecision: precision, delegate });
            } catch (e) {
              i = 5;
            }
            i++;
          }
        }
      }
    }
  };

  return {
    run,
    runForAllAsync
  };
}

export const onnxMLPerformanceRunnerService = createMLPerformanceRunnerService<
  InferenceSession,
  any
>({
  libraryName: 'onnxruntime',
  loadModelAsync: async (options: LoadModelOptions) => {
    const model = await modelService.loadModelAsync(
      options.model,
      options.inputPrecision,
      'onnx'
    );

    try {
      console.log(
        `${options.model} ${options.inputPrecision} ${options.delegate}`
      );
      const session = await InferenceSession.create(model, {
        executionProviders: [
          options.delegate === Delegate.COREML ? 'coreml' : options.delegate
        ]
      });

      return session;
    } catch (e: any) {
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
      console.log({ output });
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
  getFormattedInputsAsync: async function (options, model): Promise<any[]> {
    const inputDimensions = getModelDataDimensions(options.model);
    const maxAmount = 10;
    let i = 0;
    const chunkAmount = 10;

    let arr: FetchImageNetResult = [];
    while (i * chunkAmount < maxAmount) {
      const d = await getFetchFn(options.model)({
        amount: chunkAmount,
        skip: i * chunkAmount,
        type: options.inputPrecision
      });
      arr = [...arr, ...d];
      i++;
    }
    const data = arr;

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
    await model.release();
  }
});
