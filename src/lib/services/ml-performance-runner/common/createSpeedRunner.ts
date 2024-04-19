import { resultService } from '../../resultService';
import { CreateMLPerformanceRunnerOpts, LoadModelOptions } from '../types';

import { loadModelOptionsEqual } from './util';

export const createMLPerformanceSpeedRunner = <ModelT, DataT, OutputT>(
  opts: CreateMLPerformanceRunnerOpts<ModelT, DataT, OutputT>
) => {
  let _cachedData: DataT[] | null = null;
  let _cachedOptions: LoadModelOptions | null = null;
  const run = async (options: LoadModelOptions) => {
    const resultsId = new Date().getTime().toString();

    const commonOpts = {
      resultsId: resultsId,
      model: options.model,
      precision: options.inputPrecision,
      delegate: options.delegate,
      library: opts.libraryName
    };

    const hasResults = await resultService.getHasResultsAlreadyAsync({
      ...commonOpts,
      inputIndex: 0,
      inferenceTimeMs: 0,
      output: []
    });

    if (hasResults) {
      throw new Error('Results already exist');
    }

    const model = await opts.loadModelAsync(options);

    const d =
      _cachedOptions &&
      loadModelOptionsEqual(options, _cachedOptions) &&
      _cachedData
        ? _cachedData
        : await opts.getFormattedInputsAsync(options, model, {
            maxAmount: options.model === 'deeplabv3' ? 100 : 300
          });

    _cachedData = d;
    _cachedOptions = options;

    const results = [];
    var i = 0;
    for (const data of d) {
      const start = performance.now();
      const out = await opts.runInfereceAsync(model, data);
      const end = performance.now();

      const time = end - start;

      var usedOut = null;

      switch (options.model) {
        case 'mobilenetv2':
          usedOut = opts.outputFormatting.formatMobileNetOutput(out, model);
          break;
        case 'mobilenet_edgetpu':
          usedOut = opts.outputFormatting.formatMobileNetEdgeTPUOutput(
            out,
            model
          );
          break;
        case 'ssd_mobilenet':
          usedOut = opts.outputFormatting.formatSSDMobileNetOutput(out, model);
          break;
        case 'deeplabv3':
          usedOut = opts.outputFormatting.formatDeepLabV3Output(out, model);
          break;
      }

      if (opts.onAfterInputRun) {
        await opts.onAfterInputRun(out);
      }

      results.push({
        ...commonOpts,
        output: usedOut as any,
        inferenceTimeMs: time,
        result: out,
        inputIndex: i
      });

      i++;
    }

    await opts.closeModelAsync(model);
    for (const r of results) {
      switch (options.model) {
        case 'mobilenetv2':
          await resultService.sendImageNetResults(r);
          break;
        case 'mobilenet_edgetpu':
          await resultService.sendImageNetResults(r);
          break;
        case 'ssd_mobilenet':
          await resultService.sendSSDMobilenetResults(r);
          break;
        case 'deeplabv3':
          await resultService.sendDeeplabv3Results(r);
          break;
      }
    }

    return 'ok';
  };

  return {
    run
  };
};
