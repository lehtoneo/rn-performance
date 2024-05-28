import { CustomImageData } from '../dataService';
import { Delegate } from '../resultService';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

import { createMLPerformanceRunnerService } from './common';
import { LoadModelOptions } from './types';
import { getModelDataDimensions } from '@/lib/hooks/data/useModelData';

const tfjsMLPerformanceRunnerService = createMLPerformanceRunnerService<
  tf.LayersModel,
  any,
  any
>({
  libraryName: 'tfjs',
  libraryDelegates: [Delegate.WEBGL],
  loadModelAsync: async (options) => {
    const json = {};
    const weights = {};
    return tf.loadLayersModel(bundleResourceIO(json, weights));
  },
  runInfereceAsync: async (model, data) => {
    return await model.predict(data);
  },
  getFormattedInputsAsync: function (
    options: LoadModelOptions,
    model: tf.LayersModel,
    dataOptions: { maxAmount: number }
  ): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
  formatData: function (
    data: CustomImageData,
    loadModelOptions: LoadModelOptions,
    _model: tf.LayersModel
  ) {
    const inputDimensions = getModelDataDimensions(loadModelOptions.model);
    return tf.tensor(data.array, [1, ...inputDimensions]);
  },
  closeModelAsync: async function (model: tf.LayersModel): Promise<void> {
    await model.dispose();
  },
  outputFormatting: {
    formatMobileNetEdgeTPUOutput: function (
      output: any,
      model: tf.LayersModel
    ): number[] {
      throw new Error('Function not implemented.');
    },
    formatMobileNetOutput: function (
      output: any,
      model: tf.LayersModel
    ): number[] {
      throw new Error('Function not implemented.');
    },
    formatSSDMobileNetOutput: function (
      output: any,
      model: tf.LayersModel
    ): [number[], number[], number[], number[]] {
      throw new Error('Function not implemented.');
    },
    formatDeepLabV3Output: function (
      output: any,
      model: tf.LayersModel
    ): number[] {
      throw new Error('Function not implemented.');
    }
  }
});
