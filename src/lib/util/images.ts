import { Buffer } from 'buffer';

const bufferToBase64 = (buffer: Buffer) => {
  return buffer.toString('base64');
};

const imagesUtil = {
  uint8ArrayToBase64(uint8Array: Uint8Array) {
    // Convert Uint8Array to binary string
    const binaryString = uint8Array.reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      ''
    );

    // Convert binary string to base64
    const base64String = Buffer.from(binaryString, 'binary').toString('base64');

    return base64String;
  },
  bufferToBase64
};

export default imagesUtil;
