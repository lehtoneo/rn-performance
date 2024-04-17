import { ModelInputPrecision } from '../types';
import axios from 'axios';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { localIP } from './dataService';

import { Model } from '../hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

export enum Delegate {
  CPU = 'cpu',
  GPU = 'gpu',
  NNAPI = 'nnapi',
  METAL = 'metal',
  COREML = 'core_ml',
  WEBGL = 'webgl',
  OPENGL = 'opengl',
  XNNPACK = 'xnnpack'
}
type SendResultsCommonOpts<T> = {
  resultsId: string;
  inputIndex: number;
  precision: ModelInputPrecision;
  library: string;
  output: T;
  inferenceTimeMs: number;
  model: Model;
  delegate: Delegate;
};

const getFullOpts = <T>(opts: SendResultsCommonOpts<T>) => {
  return {
    ...opts,
    platform: Platform.OS,
    deviceModelName: Device.modelName,
    frameWork: 'react-native'
  };
};

const sendResults = async <T>(uri: string, opts: SendResultsCommonOpts<T>) => {
  try {
    const d = getFullOpts(opts);
    const r = await axios.post<{ correct: boolean }>(`${uri}`, d);
    return r.data;
  } catch (e) {
    console.log(e);
    console.log('error');
  }
};

const sendMultipleResultsToApi = async <T>(
  uri: string,
  opts: SendResultsCommonOpts<T>[]
) => {
  try {
    const d = opts.map((o) => {
      return getFullOpts(o);
    });
    const r = await axios.post<{ correct: boolean }>(`${uri}/multiple`, d);
    return r.data;
  } catch (e) {
    console.log(e);
    console.log('error');
  }
};

function createResultSenderService<T>(uri: string) {
  const sendOneResult = async (opts: SendResultsCommonOpts<T>) => {
    try {
      return await sendResults(uri, opts);
    } catch (e) {
      console.log(e);
      console.log('error');
    }
  };

  const sendMultipleResults = async (opts: SendResultsCommonOpts<T>[]) => {
    try {
      return await sendMultipleResultsToApi(uri, opts);
    } catch (e) {
      console.log(e);
      console.log('error');
    }
  };

  return {
    sendOneResult,
    sendMultipleResults
  };
}

const getHasResultsAlreadyAsync = async (data: SendResultsCommonOpts<any>) => {
  try {
    const d = getFullOpts(data);
    const r = await axios.post<string>(
      `http://${localIP}:3000/api/results/has-results`,
      d
    );
    return r.data === 'true';
  } catch (e) {
    return true;
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

  const mobileNet = createResultSenderService<number[]>(`${baseUrl}/mobilenet`);

  const ssdMobilenet = createResultSenderService<[]>(
    `${baseUrl}/ssd-mobilenet`
  );

  const deeplabv3 = createResultSenderService<number[] | number[][]>(
    `${baseUrl}/deeplabv3`
  );

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
    mobileNet,
    ssdMobilenet,
    deeplabv3,
    sendImageNetResults: sendMobileNetResults,
    sendSSDMobilenetResults,
    sendDeeplabv3Results,
    getHasResultsAlreadyAsync
  };
};

export const resultService = createResultService(`http://${localIP}:3000/api`);

export default createResultService;
