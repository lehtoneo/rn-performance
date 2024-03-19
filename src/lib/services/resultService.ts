import { ModelInputPrecision } from '../types';
import axios from 'axios';
import { Platform } from 'react-native';

import { localIP } from './dataService';

import { Model } from '../hooks/ml/fast-tf-lite/useReactNativeFastTfLite';

type SendResultCommonOptions = {
  library: string;
  precision: ModelInputPrecision;
};

type SendResultsCommonOpts<T> = {
  inputIndex: number;
  precision: ModelInputPrecision;
  library: string;
  results: T;
};

const sendResults = async <T>(uri: string, opts: SendResultsCommonOpts<T>) => {
  try {
    const d = {
      platform: Platform.OS,
      library: opts.library,
      frameWork: 'react-native',
      results: opts.results,
      precision: opts.precision,
      inputIndex: opts.inputIndex
    };
    await axios.post(`${uri}`, d);
  } catch (e) {
    console.log(e);
    console.log('error');
  }
};

const createResultService = (uri: string) => {
  const baseUrl = `${uri}/results`;

  const sendImageNetResults = async (opts: SendResultsCommonOpts<number[]>) => {
    try {
      await sendResults(`${baseUrl}/imagenet`, opts);
    } catch (e) {
      console.log(e);
      console.log('error');
    }
  };

  return {
    sendImageNetResults
  };
};

export const resultService = createResultService(`http://${localIP}:3000/api`);

export default createResultService;
