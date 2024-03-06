import useModelData from './useModelData';
import { ModelInputPrecision } from '@/lib/types';

function useImageNetData<T extends ModelInputPrecision>(
  type: T,
  opts?: {
    maxAmount?: number;
  }
) {
  return useModelData({
    dataPrecision: type,
    model: 'mobilenet',
    maxAmount: opts?.maxAmount
  });
}

export default useImageNetData;
