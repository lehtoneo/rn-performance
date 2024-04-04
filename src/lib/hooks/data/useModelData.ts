import { Model } from '../ml/fast-tf-lite/useReactNativeFastTfLite';
import { useQuery } from '@tanstack/react-query';

import dataService, {
  DataPrecision,
  FetchImageNetResult,
  FetchImagesQuery
} from '@/lib/services/dataService';
import { ModelInputPrecision } from '@/lib/types';

export const useModelDataDimensions = (
  model?: Model
): [number, number, number] => {
  switch (model) {
    case 'mobilenetv2':
      return [224, 224, 3];
    case 'mobilenet_edgetpu':
      return [224, 224, 3];
    case 'ssd_mobilenet':
      return [300, 300, 3];
    case 'deeplabv3':
      return [512, 512, 3];
    case undefined:
      return [0, 0, 0];
    default:
      throw new Error('Invalid model');
  }
};

const getFetchFn = (model: Model) => {
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
    default:
      throw new Error('Invalid model');
  }
};

function useModelData(opts: {
  dataPrecision: DataPrecision;
  model: Model;
  maxAmount?: number;
}) {
  const fetchFn = getFetchFn(opts.model);

  const maxAmount = opts?.maxAmount || 300;
  const d = useQuery({
    queryKey: [
      'model-data',
      {
        dataPrecision: opts.dataPrecision,
        fn: fetchFn,
        model: opts.model,
        amount: maxAmount
      }
    ],
    queryFn: async () => {
      let i = 0;
      const chunkAmount = maxAmount < 20 ? maxAmount : 50;

      let arr: FetchImageNetResult = [];
      while (i * chunkAmount < maxAmount) {
        const d = await fetchFn({
          amount: chunkAmount,
          skip: i * chunkAmount,
          type: opts.dataPrecision
        });
        arr = [...arr, ...d];
        i++;
      }
      return arr;
    },
    staleTime: 1000 * 60 * 60 * 24
  });

  return d;
}

export default useModelData;
