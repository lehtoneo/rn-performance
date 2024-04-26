import { resultService } from '../../resultService';
import { CreateMLPerformanceRunnerOpts, LoadModelOptions } from '../types';

import { getFetchFn } from './util';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

export const createMLPerformanceSpeedRunner = <ModelT, DataT, OutputT>(
  opts: CreateMLPerformanceRunnerOpts<ModelT, DataT, OutputT>
) => {
  const getMaxAmount = (model: Model) => {
    switch (model) {
      case 'deeplabv3':
        return 100;
      default:
        return 300;
    }
  };

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

    const maxAmount = getMaxAmount(options.model);

    const batchSize = 10;

    for (var i = 0; i < maxAmount; ) {
      const rawData = await getFetchFn(options.model)({
        amount: batchSize,
        skip: i,
        type: options.inputPrecision
      });

      const formatted = rawData.map((d) => opts.formatData(d, options, model));

      var results = [];

      for (const data of formatted) {
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
            usedOut = opts.outputFormatting.formatSSDMobileNetOutput(
              out,
              model
            );
            break;
          case 'deeplabv3':
            usedOut = opts.outputFormatting.formatDeepLabV3Output(out, model);
            break;
        }

        results.push({
          ...commonOpts,
          output: usedOut as any,
          inferenceTimeMs: time,
          result: out,
          inputIndex: i
        });

        if (opts.onAfterInputRun) {
          await opts.onAfterInputRun(out);
        }

        i++;
      }

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

      results = [];
    }

    await opts.closeModelAsync(model);

    return 'ok';
  };

  return {
    run
  };
};
