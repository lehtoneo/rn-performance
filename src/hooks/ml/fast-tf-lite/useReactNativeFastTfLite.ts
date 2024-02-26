import { useTensorflowModel } from 'react-native-fast-tflite';

const useReactNativeFastTfLite = (modelPath: string, labelsPath: string) => {
  const plugin = useTensorflowModel(
    require('../../../../assets/models/mobilenet_v1_1.0_224.tflite')
  );

  const test = async () => {
    plugin.model?.inputs.forEach((input) => {
      console.log({ input });
    });
  };
};

export default useReactNativeFastTfLite;
