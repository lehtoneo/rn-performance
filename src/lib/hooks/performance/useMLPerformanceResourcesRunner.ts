import { useState } from 'react';

import { MLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/common';
import { LoadModelOptions } from '@/lib/services/ml-performance-runner/types';
import { Delegate } from '@/lib/services/resultService';

export const useMLPerformanceResourcesRunner = (
  s: MLPerformanceRunnerService
) => {
  const [running, setRunning] = useState<boolean>(false);
  const [LoadModelOptions, setLoadModelOptions] = useState<LoadModelOptions>({
    model: 'ssd_mobilenet',
    inputPrecision: 'float32',
    delegate: Delegate.COREML
  });
  const run = async () => {
    setRunning(true);
    await s.resources.run({
      model: 'ssd_mobilenet',
      inputPrecision: 'float32',
      delegate: Delegate.COREML
    });
    setRunning(false);
  };

  return {
    run,
    running,
    delegates: s.getDelegates(),
    state: {
      LoadModelOptions,
      setLoadModelOptions
    }
  };
};

export type UseMLPerformanceResourcesRunner = ReturnType<
  typeof useMLPerformanceResourcesRunner
>;
