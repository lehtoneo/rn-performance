import { ModelInputPrecision } from '../../../types';
import { sleep } from '../../../util/promises';
import dataService, {
  FetchImageNetResult,
  FetchImagesQuery
} from '../../dataService';
import { Delegate, resultService } from '../../resultService';
import { CreateMLPerformanceRunnerOpts, LoadModelOptions } from '../types';
import { Platform } from 'react-native';

import { createMLPerformanceResourceRunner } from './createResourceRunner';
import { createMLPerformanceSpeedRunner } from './createSpeedRunner';
import { getPlatfromSupportedDelegates } from './util';

export function createMLPerformanceRunnerService<ModelT, DataT, OutputT>(
  opts: CreateMLPerformanceRunnerOpts<ModelT, DataT, OutputT>
) {
  const getDelegates = () => {
    const platformSupported = getPlatfromSupportedDelegates();

    return opts.libraryDelegates.filter((d) => {
      if (!platformSupported.includes(d)) {
        return false;
      }
      return true;
    });
  };

  const speedRunner = createMLPerformanceSpeedRunner(opts);
  const resources = createMLPerformanceResourceRunner(opts);
  return {
    ...speedRunner,
    resources,
    getDelegates
  };
}

export type MLPerformanceRunnerService = ReturnType<
  typeof createMLPerformanceRunnerService
>;
