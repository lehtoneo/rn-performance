import { Model } from '../fast-tf-lite/useReactNativeFastTfLite';
import * as cocoSSd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { useEffect, useRef, useState } from 'react';

const useTfjsML = (opts: { model: Model }) => {
  const mobileNetModelRef = useRef<mobilenet.MobileNet | null>(null);
  const [cocoSSdModel, setCocoSSdModel] =
    useState<cocoSSd.ObjectDetection | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const model = await mobilenet.load();
      mobileNetModelRef.current = model;
      const ssd = await cocoSSd.load();
      setCocoSSdModel(ssd);
    };
    loadModels();
  }, []);

  return {
    mobilenet: mobileNetModelRef.current,
    ssd_mobilenet: cocoSSdModel
  };
};

export default useTfjsML;
