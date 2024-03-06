import { useQuery } from '@tanstack/react-query';

import dataService, {
  FetchImageNetResult,
  ImageNetQuery
} from '@/lib/services/dataService';
import { ModelPrecision } from '@/lib/types';

function useImageNetData<T extends ModelPrecision>(
  type: T,
  opts?: {
    maxAmount?: number;
  }
) {
  const maxAmount = opts?.maxAmount || 300;
  const d = useQuery({
    queryKey: ['imageNetData', { type }],
    queryFn: async () => {
      let i = 0;
      const chunkAmount = 20;
      let arr: FetchImageNetResult = [];
      while (i * chunkAmount < maxAmount) {
        const d = await dataService.fetchImageNetData({
          amount: chunkAmount,
          skip: i * chunkAmount,
          type
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

export default useImageNetData;
