import { ModelInputPrecision } from '../../types';
import { sleep } from '../../util/promises';
import dataService, {
  FetchImageNetResult,
  FetchImagesQuery
} from '../dataService';
import { Delegate, resultService } from '../resultService';
import { Platform } from 'react-native';

import { getModelDataDimensions } from '@/lib/hooks/data/useModelData';

import { Model } from '../../hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

export const fetchDataInChunks = async (options: {
  model: Model;
  maxAmount: number;
  inputPrecision: ModelInputPrecision;
  chunkAmount?: number;
}) => {
  const maxAmount = options.maxAmount;
  let i = 0;
  const chunkAmount = options.chunkAmount || 10;
  console.log('Fetching data');
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
  console.log('Fetched data');
  return arr;
};

export const getFetchFn = (model: Model | null) => {
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

export type LoadModelOptions = {
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

const getPlatfromSupportedDelegates = () => {
  const iosSpecificDelegates = [Delegate.COREML, Delegate.METAL];
  const androidSpecificDelegates = [Delegate.NNAPI];
  if (Platform.OS === 'ios') {
    return Object.values(Delegate).filter(
      (d) => !androidSpecificDelegates.includes(d)
    );
  }

  if (Platform.OS === 'android') {
    return Object.values(Delegate).filter(
      (d) => !iosSpecificDelegates.includes(d)
    );
  }

  throw new Error('Invalid platform');
};

export function createMLPerformanceRunnerService<ModelT, DataT, OutputT>(opts: {
  libraryName: string;
  libraryDelegates: Delegate[];
  loadModelAsync: (options: LoadModelOptions) => Promise<ModelT>;
  getFormattedInputsAsync: (
    options: LoadModelOptions,
    model: ModelT,
    dataOptions: {
      maxAmount: number;
    }
  ) => Promise<DataT[]>;
  runInfereceAsync: (model: ModelT, data: DataT) => Promise<OutputT>;
  closeModelAsync: (model: ModelT) => Promise<void>;
  outputFormatting: {
    formatMobileNetEdgeTPUOutput: (output: OutputT, model: ModelT) => number[];
    formatMobileNetOutput: (output: OutputT, model: ModelT) => number[];
    formatSSDMobileNetOutput: (
      output: OutputT,
      model: ModelT
    ) => [number[], number[], number[], number[]];
    formatDeepLabV3Output: (output: OutputT, model: ModelT) => number[];
  };
  onAfterInputRun?: (data: any) => Promise<any>;
}) {
  let _cachedData: DataT[] | null = null;
  let _cachedOptions: LoadModelOptions | null = null;

  const getDelegates = () => {
    const platformSupported = getPlatfromSupportedDelegates();

    return opts.libraryDelegates.filter((d) => {
      if (!platformSupported.includes(d)) {
        return false;
      }
      return true;
    });
  };

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

    if (hasResults) {
      return 'ok';
    }

    const d =
      _cachedOptions &&
      loadModelOptionsEqual(options, _cachedOptions) &&
      _cachedData
        ? _cachedData
        : await opts.getFormattedInputsAsync(options, model, {
            maxAmount: options.model === 'deeplabv3' ? 100 : 300
          });

    _cachedData = d;
    _cachedOptions = options;

    const results = [];
    var i = 0;
    for (const data of d) {
      const start = performance.now();
      const out = await opts.runInfereceAsync(model, data);
      const end = performance.now();

      const time = end - start;

      var usedOut = null;

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
        output: usedOut as any,
        inferenceTimeMs: time,
        result: out,
        inputIndex: i
      });

      i++;
    }

    await opts.closeModelAsync(model);
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

    return 'ok';
  };

  const runForAllAsync = async () => {
    const models: Model[] = [
      'mobilenetv2',
      'mobilenet_edgetpu',
      'ssd_mobilenet',
      'deeplabv3'
    ];
    const precsisions: ModelInputPrecision[] = ['float32', 'uint8'];
    const delegates = getDelegates();

    for (const model of models) {
      for (const precision of precsisions) {
        for (const delegate of delegates) {
          var i = 0;
          console.log({ model, precision, delegate });
          while (i < 5) {
            try {
              await run({ model, inputPrecision: precision, delegate });
            } catch (e) {
              break;
            }
            i++;
          }
          if (i > 0) {
            console.log('Sleeping');
            await sleep(1000);
          }
        }
      }
    }
  };

  return {
    run,
    runForAllAsync,
    getDelegates
  };
}

export type MLPerformanceRunnerService = ReturnType<
  typeof createMLPerformanceRunnerService
>;
