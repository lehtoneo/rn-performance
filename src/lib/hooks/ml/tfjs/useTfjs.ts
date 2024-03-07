import * as cocoSSd from '@tensorflow-models/coco-ssd';
import * as deeplabv3 from '@tensorflow-models/deeplab';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { useEffect, useRef, useState } from 'react';

const useTfjsML = () => {
  const mobileNetModelRef = useRef<mobilenet.MobileNet | null>(null);
  const [cocoSSdModel, setCocoSSdModel] =
    useState<cocoSSd.ObjectDetection | null>(null);
  const [deeplabv3Model, setDeeplabv3Model] =
    useState<deeplabv3.SemanticSegmentation | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const model = await mobilenet.load();
      mobileNetModelRef.current = model;
      const ssd = await cocoSSd.load();
      setCocoSSdModel(ssd);
      const deeplab = await deeplabv3.load();
      setDeeplabv3Model(deeplab);
    };
    loadModels();
  }, []);

  return {
    mobilenet: mobileNetModelRef.current,
    ssd_mobilenet: cocoSSdModel,
    deeplabv3: deeplabv3Model
  };
};

export default useTfjsML;
