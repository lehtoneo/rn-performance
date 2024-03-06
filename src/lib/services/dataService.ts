import { ModelInputPrecision } from '../types';
import axios from 'axios';
import { Buffer } from 'buffer';

const localIP = '192.168.38.134';

const baseDataUrl = `http://${localIP}:3000/api/data`;

export type DataPrecision = ModelInputPrecision | 'int32';

export interface FetchImagesQuery {
  amount: number;
  skip: number;
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

const getArray = (precision: DataPrecision, data: number[]) => {
  switch (precision) {
    case 'int32':
      return new Int32Array(data);
    case 'uint8':
      return new Uint8Array(data);
    case 'float32':
      return new Float32Array(data);
  }
};

const fetchImages = async (query: FetchImagesQuery, path: string) => {
  const response = await axios.get<FetchImagesQueryData[]>(
    `${baseDataUrl}/${path}`,
    {
      params: query
    }
  );

  const data = response.data.map((d) => {
    const buffer = Buffer.from(d.buffer.data);
    const array = getArray(query.type, d.rawImageBuffer.data);
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

/**
 * - Create a data service object
 * @returns - A data service object
 */
export const createDataService = () => {
  /**
   * - Fetch ImageNet data
   */
  const fetchImageNetData = async (query: FetchImagesQuery) => {
    return await fetchImages(query, 'imageNet');
  };

  const fetchCocoData = async (query: FetchImagesQuery) => {
    return await fetchImages(query, 'coco');
  };

  return {
    fetchImageNetData,
    fetchCocoData
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
