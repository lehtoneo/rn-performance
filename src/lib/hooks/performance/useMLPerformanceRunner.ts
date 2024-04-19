import { Model } from '../ml/fast-tf-lite/useReactNativeFastTfLite';
import { load } from '@tensorflow-models/coco-ssd';
import { useState } from 'react';

import { MLPerformanceRunnerService } from '@/lib/services/ml-performance-runner/common';
import { LoadModelOptions } from '@/lib/services/ml-performance-runner/types';
import { ModelInputPrecision } from '@/lib/types';
import { sleep } from '@/lib/util/promises';

const models: Model[] = [
  'mobilenetv2',
  'mobilenet_edgetpu',
  'ssd_mobilenet',
  'deeplabv3'
];
const precsisions: ModelInputPrecision[] = ['float32', 'uint8'];

export const useMLPerformanceRunner = (s: MLPerformanceRunnerService) => {
  const delegates = s.getDelegates();
  const [running, setRunning] = useState<boolean>(false);
  const [runI, setRunI] = useState<number>(0);
  const [currentLoadModelOptions, setCurrentLoadModelOptions] =
    useState<LoadModelOptions | null>(null);
  const [performedRuns, setPerformedRuns] = useState<LoadModelOptions[]>([]);

  const runOne = async (LoadModelOptions: LoadModelOptions) => {
    var i = 0;
    while (i < 3) {
      setRunI(i);
      try {
        await s.run(LoadModelOptions);
      } catch (e) {
        return false;
      }
      i++;
    }
    return true;
  };

  const runForAllAsync = async () => {
    setRunning(true);
    for (const model of models) {
      for (const precision of precsisions) {
        for (const delegate of delegates) {
          const LoadModelOptions: LoadModelOptions = {
            model,
            inputPrecision: precision,
            delegate
          };
          setCurrentLoadModelOptions(LoadModelOptions);
          const error = await runOne(LoadModelOptions);
          setPerformedRuns((prev) => [...prev, LoadModelOptions]);
          await sleep(10000);
        }
      }
    }
    setRunning(false);
  };

  return {
    running,
    currentLoadModelOptions,
    runForAllAsync,
    runI,
    performedRuns,
    runsAmount: delegates.length * models.length * precsisions.length
  };
};

export type UseMLPerformanceRunner = ReturnType<typeof useMLPerformanceRunner>;
