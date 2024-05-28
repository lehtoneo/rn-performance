import { Model } from '../ml/fast-tf-lite/useReactNativeFastTfLite';
import { useState } from 'react';

import { MLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/common';
import { Delegate } from '@/lib/services/resultService';

export const useMLPerformanceResourcesRunner = (
  s: MLPerformanceRunnerService
) => {
  const delegates = s.getDelegates();
  const [model, setModel] = useState<Model>('ssd_mobilenet');
  const [delegate, setDelegate] = useState<Delegate>(delegates[0]);
  const [running, setRunning] = useState<boolean>(false);
  const [times, setTimes] = useState<number>(1000);
  const [error, setError] = useState<string | null>(null);
  const runAllFP2 = async () => {
    setRunning(true);
    for (const delegate of delegates) {
      await runOneDelegate(delegate);
    }
    setRunning(false);
  };

  const runOneDelegate = async (delegate: Delegate) => {
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
  };

  return {
    runAllFP2,
    runOneDelegate,
    running,
    delegates: s.getDelegates(),
    state: {
      times,
      setTimes,
      model,
      setModel,
      delegate,
      setDelegate,
      error
    }
  };
};

export type UseMLPerformanceResourcesRunner = ReturnType<
  typeof useMLPerformanceResourcesRunner
>;
