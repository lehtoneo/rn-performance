import { useState } from 'react';

import { perfUtil } from '@/lib/util/performance';

function usePerformanceEvaluator<T>(opts: {
  mlModel: {
    run: (data: T) => Promise<any>;
  } | null;
  data: T[] | null;
  options?: {
    logResults?: boolean;
  };
}) {
  const [results, setResults] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  const runPredictions = async () => {
    if (!opts.data) {
      console.warn('No data, cannot run predictions');
      return;
    }
    if (!opts.mlModel) {
      console.warn('No mlModel, cannot run predictions');
      return;
    }
    setResults([]);
    setRunning(true);
    let i = 0;

    let promises: (() => Promise<any>)[] = [];
    while (i < opts.data.length) {
      const data = opts.data[i];

      promises.push(async () => opts.mlModel!.run(data));
      i++;
    }
    const r = await perfUtil.createMultipleAsyncPerformanceTests({
      name: 'run',
      fns: promises,
      opts: {
        logResults: opts.options?.logResults
      }
    });

    setResults(r.results.map((r) => r.time));
    setRunning(false);
  };

  const avg =
    results.length > 0
      ? results.reduce((a, b) => a + b, 0) / results.length
      : 0;
  return {
    avg,
    runPredictions,
    results,
    running
  };
}

export type PerformanceEvaluator = ReturnType<typeof usePerformanceEvaluator>;

export default usePerformanceEvaluator;
