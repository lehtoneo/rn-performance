import { Delegate } from '../resultService';

import { Model } from '@/lib/hooks/ml/fast-tf-lite/useReactNativeFastTfLite';
import { ModelInputPrecision } from '@/lib/types';

export type LoadModelOptions = {
  model: Model;
  inputPrecision: ModelInputPrecision;
  delegate: Delegate;
};
export interface CreateMLPerformanceRunnerOpts<ModelT, DataT, OutputT> {
  libraryName: string;
  libraryDelegates: Delegate[];
  loadModelAsync: (options: LoadModelOptions) => Promise<ModelT>;
  getFormattedInputsAsync: (
    options: LoadModelOptions,
    model: ModelT,
    dataOptions: {
      maxAmount: number;
    }
  ) => Promise<DataT[]>;
  runInfereceAsync: (model: ModelT, data: DataT) => Promise<OutputT>;
  closeModelAsync: (model: ModelT) => Promise<void>;
  outputFormatting: {
    formatMobileNetEdgeTPUOutput: (output: OutputT, model: ModelT) => number[];
    formatMobileNetOutput: (output: OutputT, model: ModelT) => number[];
    formatSSDMobileNetOutput: (
      output: OutputT,
      model: ModelT
    ) => [number[], number[], number[], number[]];
    formatDeepLabV3Output: (output: OutputT, model: ModelT) => number[];
  };
  onAfterInputRun?: (data: any) => Promise<any>;
}
