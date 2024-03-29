import { ModelInputPrecision } from '../types';
import axios from 'axios';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { localIP } from './dataService';

import { Model } from '../hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

type SendResultsCommonOpts<T> = {
  resultsId: string;
  inputIndex: number;
  precision: ModelInputPrecision;
  library: string;
  output: T;
  inferenceTimeMs: number;
  model: Model;
  delegate: 'cpu' | 'nnapi' | 'metal' | 'core_ml' | 'webgl' | 'opengl';
};

const sendResults = async <T>(uri: string, opts: SendResultsCommonOpts<T>) => {
  try {
    const d = {
      ...opts,
      platform: Platform.OS,
      deviceModelName: Device.modelName,
      frameWork: 'react-native'
    };
    const r = await axios.post<{ correct: boolean }>(`${uri}`, d);
    return r.data;
  } catch (e) {
    console.log(e);
    console.log('error');
  }
};

const createResultService = (uri: string) => {
  const baseUrl = `${uri}/results`;

  const sendMobileNetResults = async (
    opts: SendResultsCommonOpts<number[]>
  ) => {
    try {
      return await sendResults(`${baseUrl}/mobilenet`, opts);
    } catch (e) {
      console.log(e);
      console.log('error');
    }
  };

  const sendSSDMobilenetResults = async (
    opts: SendResultsCommonOpts<[number[], number[], number[], number[]]>
  ) => {
    try {
      return await sendResults(`${baseUrl}/ssd-mobilenet`, opts);
    } catch (e) {
      console.log(e);
      console.log('error');
    }
  };

  const sendDeeplabv3Results = async (
    opts: SendResultsCommonOpts<number[] | number[][]>
  ) => {
    try {
      return await sendResults(`${baseUrl}/deeplabv3`, opts);
    } catch (e) {
      console.log(e);
      console.log('error');
    }
  };

  return {
    sendImageNetResults: sendMobileNetResults,
    sendSSDMobilenetResults,
    sendDeeplabv3Results
  };
};

export const resultService = createResultService(`http://${localIP}:3000/api`);

export default createResultService;
