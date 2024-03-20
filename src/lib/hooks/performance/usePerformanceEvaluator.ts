import { op } from '@tensorflow/tfjs';
import { useEffect, useState } from 'react';

import { perfUtil } from '@/lib/util/performance';

// The performance evaluator hook is used to evaluate the performance of a model
function useMLPerformanceEvaluator<T, T2>(opts: {
  mlModel: {
    run: (data: T) => Promise<T2>;
  } | null;
  data: T[] | null;
  /**
   * - Callback to validate the result of the model
   */
  validateResult?: (o: {
    result: T2;
    index: number;
    timeMs: number;
  }) => Promise<boolean>;
  options?: {
    logResults?: boolean;
  };
}) {
  const [results, setResults] = useState<
    {
      time: number;
      index: number;
    }[]
  >([]);
  const [running, setRunning] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [runError, setRunError] = useState<string | null>(null);

  // needs to be different function
  const runPredictions = async () => {
    if (running) {
      return;
    }
    if (!opts.data) {
      console.warn('No data, cannot run predictions');
      return;
    }
    if (!opts.mlModel) {
      console.warn('No mlModel, cannot run predictions');
      return;
    }
    setRunning(true);
    setRunError(null);
    let i = 0;
    let correct = 0;
    let total = 0;
    let results = [];
    while (i < opts.data.length) {
      const data = opts.data[i];
      try {
        console.log({ i });
        const r = await perfUtil.createAsyncPerformanceTest({
          name: 'run',
          fn: async () => {
            return await opts.mlModel!.run(data);
          }
        });
        results.push({ ...r, index: i });
        if (opts.validateResult) {
          if (
            await opts.validateResult({
              result: r.fnResult,
              index: i,
              timeMs: r.time
            })
          ) {
            correct++;
          }
        }
      } catch (e: any) {
        setRunError(e.message);
        setRunning(false);
        return;
      }

      total++;
      i++;
    }
    setRunning(false);
    setResults(results);
    setAccuracy(correct / total);
  };

  const timeResults = results.map((r) => r.time);
  const avg =
    timeResults.length > 0
      ? timeResults.reduce((a, b) => a + b, 0) / timeResults.length
      : 0;

  return {
    avg,
    runPredictions,
    /**
     * The results of the performance test
     * - The index of the array corresponds to the index of the data
     * @type {Array<{ fnResult: T2; time: number }>}
     */
    running,
    accuracy,
    loadingData: !opts.data,
    loadingModel: !opts.mlModel,
    runError
  };
}

export type PerformanceEvaluator = ReturnType<typeof useMLPerformanceEvaluator>;

export default useMLPerformanceEvaluator;
