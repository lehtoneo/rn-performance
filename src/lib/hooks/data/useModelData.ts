import { Model } from '../ml/fast-tf-lite/useReactNativeFastTfLite';
import { useQuery } from '@tanstack/react-query';

import dataService, {
  DataPrecision,
  FetchImageNetResult
} from '@/lib/services/dataService';
import { ModelInputPrecision } from '@/lib/types';

export const useModelDataDimensions = (
  model: Model
): [number, number, number] => {
  switch (model) {
    case 'mobilenet':
      return [224, 224, 3];
    case 'ssd_mobilenet':
      return [300, 300, 3];
    default:
      throw new Error('Invalid model');
  }
};

function useModelData(opts: {
  dataPrecision: DataPrecision;
  model: Model;
  maxAmount?: number;
}) {
  const fetchFn =
    opts.model === 'mobilenet'
      ? dataService.fetchImageNetData
      : dataService.fetchCocoData;
  const maxAmount = opts?.maxAmount || 300;
  const d = useQuery({
    queryKey: [
      'model-data',
      { dataPrecision: opts.dataPrecision, fn: fetchFn, model: opts.model }
    ],
    queryFn: async () => {
      let i = 0;
      const chunkAmount = 20;
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
