import { useQuery } from '@tanstack/react-query';

import dataService, {
  FetchImageNetResult,
  ImageNetQuery
} from '@/lib/services/dataService';
import { ModelType } from '@/lib/types';

function useImageNetData<T extends ModelType>(type: T) {
  const loadInChunks = type === 'float32';
  const maxAmount = 300;
  const d = useQuery({
    queryKey: ['imageNetData', { type }],
    queryFn: async () => {
      if (loadInChunks) {
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
      } else {
        return await dataService.fetchImageNetData({
          amount: maxAmount,
          skip: 0,
          type
        });
      }
    }
  });

  return d;
}

export default useImageNetData;
