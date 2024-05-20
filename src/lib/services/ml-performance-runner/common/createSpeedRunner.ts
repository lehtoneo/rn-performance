import { resultService } from '../../resultService';
import { CreateMLPerformanceRunnerOpts, LoadModelOptions } from '../types';

import { getFetchFn } from './util';
import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

const getMaxAmountData = (model: Model) => {
  switch (model) {
    case 'deeplabv3':
      return 100;
    default:
      return 300;
  }
};

export const createMLPerformanceSpeedRunner = <ModelT, DataT, OutputT>(
  opts: CreateMLPerformanceRunnerOpts<ModelT, DataT, OutputT>
) => {
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

    await tryRunInferenceThrows(options);

    const model = await opts.loadModelAsync(options);

    const maxAmount = getMaxAmountData(options.model);

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
        // this is done on try catch block because in rare cases the model throws with certain inputs
        try {
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
        } catch (e) {}

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

  const tryRunInferenceThrows = async (options: LoadModelOptions) => {
    const model = await opts.loadModelAsync(options);
    const rawData = await getFetchFn(options.model)({
      amount: 1,
      skip: 0,
      type: options.inputPrecision
    });

    const formatted = rawData.map((d) => opts.formatData(d, options, model));

    try {
      const out = await opts.runInfereceAsync(model, formatted[0]);
      if (opts.onAfterInputRun) {
        await opts.onAfterInputRun(out);
      }
    } catch (e) {
      await opts.closeModelAsync(model);
      throw e;
    }
  };

  return {
    run
  };
};
