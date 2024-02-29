import axios from 'axios';
import { Buffer } from 'buffer';

const localIP = '192.168.38.134';

const baseDataUrl = `http://${localIP}:3000/api/data`;

export interface ImageNetQuery {
  amount: number;
  skip: number;
  type: 'uint8' | 'float32';
}

type FetchImageNetDataData = {
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
      const array = new Uint8Array(d.rawImageBuffer.data);
      const base64 = buffer.toString('base64');
      return {
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

async function getImageDataAsUint8Array(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    return uint8Array;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

async function fetchImageAsUint8Array(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      };
      reader.onerror = () =>
        reject(new Error('Error reading blob as ArrayBuffer'));
      reader.readAsArrayBuffer(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}
/**
 * - A data service object
 */
const dataService = createDataService();

export default dataService;
