import dataService, {
  FetchImageNetResult,
  FetchImagesQuery
} from '../../dataService';
import { Delegate } from '../../resultService';
import { LoadModelOptions } from '../types';
import { Platform } from 'react-native';

import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import { ModelInputPrecision } from '@/lib/types';

export const loadModelOptionsEqual = (
  a: LoadModelOptions,
  b: LoadModelOptions
) => {
  return (
    a.model === b.model &&
    a.inputPrecision === b.inputPrecision &&
    a.delegate === b.delegate
  );
};

export const getPlatfromSupportedDelegates = () => {
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
