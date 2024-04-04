import { ModelInputPrecision } from '../types';
import axios from 'axios';
import { Buffer } from 'buffer';

export const localIP = '192.168.38.134';

const baseDataUrl = `http://${localIP}:3000/api/data`;

export type DataPrecision = ModelInputPrecision | 'int32';

interface FetchImagesApiQuery {
  amount: number;
  skip: number;
}

export interface FetchImagesQuery extends FetchImagesApiQuery {
  type: DataPrecision;
}

type FetchImagesQueryData = {
  id: string;
  buffer: {
    type: 'buffer';
    data: number[];
  };
  rawImageBuffer: {
    type: 'buffer';
    data: number[];
  };
};

interface GetArrayOpts {
  precision: DataPrecision;
  data: number[];
  formatFloat32fn: (data: number) => number;
}

const getArray = (opts: GetArrayOpts) => {
  const { precision, data } = opts;
  switch (precision) {
    case 'int32':
      return new Int32Array(data);
    case 'uint8':
      return new Uint8Array(data);
    case 'float32':
      const asFloat32 = data.map(opts.formatFloat32fn);
      return new Float32Array(asFloat32);
  }
};

const fetchImages = async (
  query: FetchImagesQuery,
  path: string,
  opts?: FetchImagesOpts
) => {
  const response = await axios.get<FetchImagesQueryData[]>(
    `${baseDataUrl}/${path}`,
    {
      params: query
    }
  );

  const data = response.data.map((d) => {
    const buffer = Buffer.from(d.buffer.data);
    const array = getArray({
      precision: query.type,
      data: d.rawImageBuffer.data,
      formatFloat32fn: opts?.formatFloat32fn || ((d) => d)
    });
    const base64 = buffer.toString('base64');
    return {
      id: d.id,
      array,
      buffer: buffer,
      base64
    };
  });

  return data;
};

interface FetchImagesOpts {
  formatFloat32fn: (data: number) => number;
}

/**
 * - Create a data service object
 * @returns - A data service object
 */
export const createDataService = () => {
  /**
   * - Fetch ImageNet data
   */
  const fetchImageNetData = async (
    query: FetchImagesQuery,
    opts: FetchImagesOpts
  ) => {
    return await fetchImages(query, 'imageNet', opts);
  };

  const fetchCocoData = async (
    query: FetchImagesQuery,
    opts?: FetchImagesOpts
  ) => {
    return await fetchImages(query, 'coco', opts);
  };

  const fetckAde20kData = async (
    query: FetchImagesQuery,
    opts?: FetchImagesOpts
  ) => {
    return await fetchImages(query, 'ade20k', opts);
  };

  return {
    fetchImageNetData,
    fetchCocoData,
    fetckAde20kData
  };
};

export type DataService = ReturnType<typeof createDataService>;
export type FetchImageNetResult = Awaited<
  ReturnType<DataService['fetchImageNetData']>
>;
/**
 * - A data service object
 */
const dataService = createDataService();

export default dataService;
