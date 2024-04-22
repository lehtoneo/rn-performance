import { resultService } from '../../resultService';
import { CreateMLPerformanceRunnerOpts, LoadModelOptions } from '../types';
import * as Battery from 'expo-battery';

import { sleep } from '@/lib/util/promises';

export const createMLPerformanceResourceRunner = <ModelT, DataT, OutputT>(
  opts: CreateMLPerformanceRunnerOpts<ModelT, DataT, OutputT>
) => {
  const run = async (
    options: LoadModelOptions,
    runOpts: {
      times: number;
    }
  ) => {
    const battery = await Battery.getBatteryLevelAsync();
    if (battery === -1) {
      throw new Error('Battery level not available');
    }
    const sendResultsOpts = {
      resultsId: new Date().getTime().toString(),
      precision: options.inputPrecision,
      model: options.model,
      library: opts.libraryName,
      delegate: options.delegate
    };
    const hasResultsAlready =
      await resultService.getHasBatteryResultsAlreadyAsync({
        ...sendResultsOpts,
        batteryEndLevel: 0,
        batteryStartLevel: 0,
        timeMs: 0
      });

    if (hasResultsAlready) {
      throw new Error('Results already exist');
    }

    const model = await opts.loadModelAsync(options);
    const d = await opts.getFormattedInputsAsync(options, model, {
      maxAmount: 1
    });
    const minuteInMs = 60 * 1000;
    // make sure the time is at least 1 minute
    const sleepTime = minuteInMs + 10000;
    console.log('Sleeping for', sleepTime, 'ms');
    await sleep(sleepTime);

    const times = runOpts.times;
    const batteryBefore = await Battery.getBatteryLevelAsync();
    console.log({ batteryBefore });
    const startTimeMs = performance.now();
    for (let i = 0; i < times; i++) {
      if (i % 100 === 0) {
        console.log(`Running inference ${i} of ${times}`);
      }
      await opts.runInfereceAsync(model, d[0]);
    }
    const endTimeMs = performance.now();

    // Wait for battery to stabilize (1 minute)
    console.log('Sleeping for', sleepTime, 'ms');
    await sleep(sleepTime);
    const batteryAfter = await Battery.getBatteryLevelAsync();
    console.log({ batteryAfter, batteryBefore });
    await resultService.sendBatteryResults({
      ...sendResultsOpts,
      batteryStartLevel: batteryBefore,
      batteryEndLevel: batteryAfter,
      timeMs: endTimeMs - startTimeMs
    });
    return {
      batteryBefore,
      batteryAfter,
      startTimeMs,
      endTimeMs
    };
  };

  return {
    run
  };
};
