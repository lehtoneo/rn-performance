import { ModelPrecision } from '../types';
import axios from 'axios';
import { Buffer } from 'buffer';

const localIP = '192.168.38.134';

const baseDataUrl = `http://${localIP}:3000/api/data`;

export interface ImageNetQuery {
  amount: number;
  skip: number;
  type: ModelPrecision;
}

type FetchImageNetDataData = {
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

/**
 * - Create a data service object
 * @returns - A data service object
 */
export const createDataService = () => {
  /**
   * - Fetch ImageNet data
   */
  const fetchImageNetData = async (query: ImageNetQuery) => {
    const response = await axios.get<FetchImageNetDataData[]>(
      `${baseDataUrl}/imagenet`,
      {
        params: query
      }
    );

    const data = response.data.map((d) => {
      const buffer = Buffer.from(d.buffer.data);
      const array =
        query.type === 'uint8'
          ? new Uint8Array(d.rawImageBuffer.data)
          : new Float32Array(d.rawImageBuffer.data);
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

  return {
    fetchImageNetData
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
