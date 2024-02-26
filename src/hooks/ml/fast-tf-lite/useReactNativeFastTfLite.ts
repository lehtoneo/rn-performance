import { useTensorflowModel } from 'react-native-fast-tflite';

import useResizeImage from '@/hooks/images/useResizeImage';

const useReactNativeFastTfLite = () => {
  const t = useResizeImage();

  const plugin = useTensorflowModel(
    require('../../../../assets/models/mlperf/mobilenet_edgetpu_224_1.0_int8.tflite')
  );

  const test = async () => {
    plugin.model?.inputs.forEach((input) => {
      console.log({ input });
    });
  };

  const doInference = async () => {
    if (!plugin.model) {
      throw new Error('Model not loaded');
    }
    console.log(plugin.model.inputs);

    const inputs = plugin.model.inputs.map((input) => {
      return new Int8Array(
        1 * input.shape[1] * input.shape[2] * input.shape[3]
      );
    });

    const r = await plugin.model.run(inputs);
  };

  return {
    isReady: plugin.state === 'loaded',
    test,
    doInference
  };
};

export default useReactNativeFastTfLite;
