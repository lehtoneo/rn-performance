import { CreateMLPerformanceRunnerOpts, LoadModelOptions } from '../types';

import { sleep } from '@/lib/util/promises';

export const createMLPerformanceResourceRunner = <ModelT, DataT, OutputT>(
  opts: CreateMLPerformanceRunnerOpts<ModelT, DataT, OutputT>
) => {
  const run = async (options: LoadModelOptions) => {
    const model = await opts.loadModelAsync(options);
    const d = await opts.getFormattedInputsAsync(options, model, {
      maxAmount: 1
    });

    await sleep(10000);

    const times = 1000;

    for (let i = 0; i < times; i++) {
      const start = performance.now();
      const out = await opts.runInfereceAsync(model, d[0]);
      const end = performance.now();
      const time = end - start;
    }
  };

  return {
    run
  };
};
