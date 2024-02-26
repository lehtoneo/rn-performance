import { Asset } from 'expo-asset';
import { FlipType, SaveFormat, manipulateAsync } from 'expo-image-manipulator';

const useResizeImage = () => {
  const resize = async (opts: {
    imagePath: string;
    width: number;
    height: number;
  }) => {
    const { imagePath, width, height } = opts;

    const manipResult = await manipulateAsync(
      imagePath,
      [{ resize: { width, height } }],
      { compress: 1, format: SaveFormat.PNG }
    );
    return manipResult;
  };

  return { resize };
};

export default useResizeImage;
