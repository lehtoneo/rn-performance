import { ModelInputPrecision } from '../types';
import axios from 'axios';
import { Platform } from 'react-native';

import { localIP } from './dataService';

type SendResultsCommonOpts<T> = {
  resultsId: string;
  inputIndex: number;
  precision: ModelInputPrecision;
  library: string;
  results: T;
  inferenceTimeMs: number;
};

const sendResults = async <T>(uri: string, opts: SendResultsCommonOpts<T>) => {
  try {
    const d = {
      ...opts,
      platform: Platform.OS,
      frameWork: 'react-native'
    };
    const r = await axios.post(`${uri}`, d);
    return r.data;
  } catch (e) {
    console.log(e);
    console.log('error');
  }
};

const createResultService = (uri: string) => {
  const baseUrl = `${uri}/results`;

  const sendImageNetResults = async (opts: SendResultsCommonOpts<number[]>) => {
    try {
      return await sendResults(`${baseUrl}/imagenet`, opts);
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
    opts: SendResultsCommonOpts<number[]>
  ) => {
    try {
      return await sendResults(`${baseUrl}/deeplabv3`, opts);
    } catch (e) {
      console.log(e);
      console.log('error');
    }
  };

  return {
    sendImageNetResults,
    sendSSDMobilenetResults,
    sendDeeplabv3Results
  };
};

export const resultService = createResultService(`http://${localIP}:3000/api`);

export default createResultService;
