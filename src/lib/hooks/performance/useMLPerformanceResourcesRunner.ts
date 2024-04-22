import { Model } from '../ml/fast-tf-lite/useReactNativeFastTfLite';
import { useState } from 'react';

import { MLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/common';
import { LoadModelOptions } from '@/lib/services/ml-performance-runner/types';
import { Delegate } from '@/lib/services/resultService';

const models: Model[] = ['ssd_mobilenet'];
const delegates: Delegate[] = Object.values(Delegate);

export const useMLPerformanceResourcesRunner = (
  s: MLPerformanceRunnerService
) => {
  const [running, setRunning] = useState<boolean>(false);
  const [times, setTimes] = useState<number>(1000);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setRunning(true);
    for (const model of models) {
      for (const delegate of delegates) {
        try {
          await s.resources.run(
            {
              model,
              inputPrecision: 'float32',
              delegate
            },
            {
              times
            }
          );
        } catch (e: any) {
          setError(e.message);
          console.error(e);
        }
      }
    }
    setRunning(false);
  };

  return {
    run,
    running,
    delegates: s.getDelegates(),
    state: {
      times,
      setTimes,
      error
    }
  };
};

export type UseMLPerformanceResourcesRunner = ReturnType<
  typeof useMLPerformanceResourcesRunner
>;
