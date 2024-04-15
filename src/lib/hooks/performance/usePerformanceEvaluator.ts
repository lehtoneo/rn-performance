import * as _ from 'lodash';
import { useState } from 'react';

import { perfUtil } from '@/lib/util/performance';
import { sleep } from '@/lib/util/promises';

type Result<T> = {
  fnResult: T | null;
  timeMs: number;
  index: number;
  runId: string;
};

// The performance evaluator hook is used to evaluate the performance of a model
function useMLPerformanceEvaluator<DataType, FnResultType>(opts: {
  mlModel: {
    run: (data: DataType) => Promise<FnResultType>;
  } | null;
  data: DataType[] | null;
  /**
   * - Callback to validate the result of the model
   */
  validateResult?: (o: {
    result: FnResultType;
    index: number;
    timeMs: number;
    runId: string;
  }) => Promise<boolean>;

  /**
   * - Callback to run after a performance test is done
   * @param results - The results of the performance test
   * @returns {Promise<void>}
   */
  onReady?: (results: Result<FnResultType>[]) => Promise<void>;
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
  const [runErrors, setRunErrors] = useState<string[]>([]);

  // needs to be different function

  const runPredictions = async (times?: number) => {
    if (running) {
      return;
    }

    const xTimes = times || 1;
    const sleepSeconds = 3;
    for (let i = 0; i < xTimes; i++) {
      setRunning(true);
      if (i > 0) {
        console.log(
          `Sleeping for ${sleepSeconds} seconds before running predictions`
        );
        await sleep(sleepSeconds * 1000);
      }
      console.log(`Running predictions for the ${i + 1}/${xTimes} time`);
      await runPredictionsOnce();
    }
  };

  const runPredictionsOnce = async () => {
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
    const runID = `run-${new Date().getTime()}`;
    setRunning(true);
    setRunErrors([]);
    let i = 0;
    let correct = 0;
    let total = 0;
    let results: Result<FnResultType>[] = [];
    while (i < opts.data.length) {
      const data = opts.data[i];

      try {
        const r = await perfUtil.createAsyncPerformanceTest({
          name: 'run',
          fn: async () => {
            return await opts.mlModel!.run(data);
          }
        });
        results.push({
          fnResult: _.cloneDeep(r.fnResult),
          timeMs: r.time,
          index: i,
          runId: runID
        });
      } catch (e: any) {
        console.log('INFERENCE ERROR');
        let ss: any =
          total > 0 ? results.reduce((a, b) => a + b.timeMs, 0) / total : 0;
        results.push({
          fnResult: null,
          timeMs: ss,
          index: i,
          runId: runID
        });
        setRunErrors((prev) => [
          ...prev,
          `ERROR RUNNING MODEL with DATA INDEX ${i} ${e.message}`
        ]);
      }

      total++;
      i++;
    }
    if (opts.onReady) {
      await opts.onReady(results);
    }
    for (const r of results) {
      try {
        if (opts.validateResult) {
          if (
            await opts.validateResult({
              result: r.fnResult!,
              index: r.index,
              timeMs: r.timeMs,
              runId: runID
            })
          ) {
            correct++;
          }
        }
      } catch (e: any) {
        console.log('VALIDATION ERROR');
        setRunErrors((prev) => [
          ...prev,
          `ERROR VALIDATING RESULT with DATA INDEX ${i} ${e.message}`
        ]);
      }
    }
    setRunning(false);
    setResults(
      results.map((r) => {
        console.log({ time: r.timeMs });
        return {
          time: r.timeMs,
          index: r.index
        };
      })
    );
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
     * @type {Array<{ fnResult: FnResultType; time: number }>}
     */
    running,
    accuracy,
    loadingData: !opts.data,
    loadingModel: !opts.mlModel,
    runErrors
  };
}

export type PerformanceEvaluator = ReturnType<typeof useMLPerformanceEvaluator>;

export default useMLPerformanceEvaluator;
