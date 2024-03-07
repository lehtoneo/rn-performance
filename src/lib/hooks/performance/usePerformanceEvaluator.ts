import { useEffect, useState } from 'react';

import { perfUtil } from '@/lib/util/performance';

// The performance evaluator hook is used to evaluate the performance of a model
function useMLPerformanceEvaluator<T, T2>(opts: {
  mlModel: {
    run: (data: T) => Promise<T2>;
  } | null;
  data: T[] | null;
  validateResult?: (o: { result: T2; index: number }) => boolean;
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

    let promises: (() => Promise<T2>)[] = [];
    while (i < opts.data.length) {
      const data = opts.data[i];

      promises.push(async () => {
        const r = await opts.mlModel!.run(data);
        return r;
      });
      i++;
    }
    const r = await perfUtil.createMultipleAsyncPerformanceTests({
      name: 'run',
      fns: promises,
      opts: {
        logResults: opts.options?.logResults
      }
    });

    setResults(r.results);
    setRunning(false);
  };

  const timeResults = results.map((r) => r.time);
  const avg =
    timeResults.length > 0
      ? timeResults.reduce((a, b) => a + b, 0) / timeResults.length
      : 0;

  // needs to be different function
  const runAccuracy = async () => {
    if (!opts.data) {
      console.warn('No data, cannot run predictions');
      return;
    }
    if (!opts.mlModel) {
      console.warn('No mlModel, cannot run predictions');
      return;
    }
    let i = 0;
    let correct = 0;
    let total = 0;
    while (i < opts.data.length) {
      const data = opts.data[i];
      const r = await opts.mlModel.run(data);
      if (opts.validateResult) {
        if (opts.validateResult({ result: r, index: i })) {
          correct++;
        }
      }
      total++;
      i++;
    }
    setAccuracy(correct / total);
    return correct / total;
  };
  return {
    avg,
    runPredictions,
    /**
     * The results of the performance test
     * - The index of the array corresponds to the index of the data
     * @type {Array<{ fnResult: T2; time: number }>}
     */
    results,
    running,
    runAccuracy,
    accuracy
  };
}

export type PerformanceEvaluator = ReturnType<typeof useMLPerformanceEvaluator>;

export default useMLPerformanceEvaluator;
