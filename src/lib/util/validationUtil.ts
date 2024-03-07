import { imageNetValIdationData } from './imagenet_validation';

/**
 * Returns the index of the highest value in an array
 */
const getPredictedMobileNet = (array: number[]) => {
  let maxI = 0;
  let i = 0;

  let max = -Infinity;

  while (i < array.length) {
    if (array[i] > max) {
      max = array[i];
      maxI = i;
    }
    i++;
  }
  return maxI - 1;
};

const getCorrectLabel = (index: number) => {
  return imageNetValIdationData[index];
};

const validateMobileNet = (opts: {
  result: number[];
  index: number;
}): boolean => {
  const pred = opts.result;
  const max = Math.max(...pred);
  const maxIndex = pred.indexOf(max);
  const predictedI = maxIndex - 1;
  console.log({ predictedI });

  const correctResult = getCorrectLabel(opts.index);
  console.log({ correctResult });

  return correctResult === predictedI;
};

const validationUtil = {
  validateMobileNet
};

export default validationUtil;
